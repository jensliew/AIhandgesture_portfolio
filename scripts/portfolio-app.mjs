import { portfolioRecords, uiCopy } from "./portfolio-data.mjs?v=20260609-smooth-trackpad";
import { computeDetailScrollDelta, getCameraStatusMessage, startGestureSession } from "./portfolio-gestures.mjs?v=20260609-smooth-trackpad";
import { createSceneStage } from "./portfolio-scene.mjs?v=20260609-smooth-trackpad";
import { createInitialState, reduceAppState } from "./portfolio-state.mjs?v=20260609-smooth-trackpad";
import { buildDetailMarkup, buildShellMarkup, buildSupportMarkup } from "./portfolio-render.mjs?v=20260609-smooth-trackpad";

const root = document.querySelector("#lab-app");
const handCursor = document.querySelector("#hand-cursor");
let state = createInitialState(portfolioRecords);
let gestureSession = null;
let sceneStage = null;
let renderToken = 0;
let sceneSignature = "";
let detailCloseTransition = null;
let supportAnimationSignature = "";
let shellIntroAnimated = false;
let projectAnimationSignature = "";
let shellMarkupSnapshot = "";
let detailMarkupSnapshot = "";
let supportMarkupSnapshot = "";
const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null;
const DETAIL_EXIT_FALLBACK_MS = 420;

function getReducedMotion() {
  return reducedMotionQuery?.matches ?? false;
}

function destroySceneStage() {
  sceneStage?.destroy?.();
  sceneStage = null;
}

function canUseGsap() {
  return !getReducedMotion() && typeof window.gsap !== "undefined";
}

function animateShellIntro() {
  if (shellIntroAnimated || !canUseGsap()) {
    shellIntroAnimated = true;
    return;
  }

  shellIntroAnimated = true;
  window.gsap.fromTo(
    root?.querySelectorAll(".lab-identity-rail, .lab-showcase-stage, .lab-directory-rail"),
    { autoAlpha: 0, y: 18, scale: 0.985 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.72, ease: "power3.out", stagger: 0.08 }
  );
}

function animateProjectFocus(signature) {
  if (getReducedMotion() || projectAnimationSignature === signature) {
    projectAnimationSignature = signature;
    return;
  }

  projectAnimationSignature = signature;

  if (typeof window.gsap === "undefined") {
    root?.querySelector(".lab-identity-body")?.classList.remove("is-refreshing");
    window.requestAnimationFrame(() => {
      root?.querySelector(".lab-identity-body")?.classList.add("is-refreshing");
    });
    return;
  }

  window.gsap.fromTo(
    root?.querySelectorAll(".lab-manual-mode, .lab-title, .lab-intro, .lab-dossier-trigger"),
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.38, ease: "power3.out", stagger: 0.045 }
  );

  window.gsap.fromTo(
    root?.querySelector(".lab-directory-item.is-active"),
    { scale: 0.985 },
    { scale: 1, duration: 0.3, ease: "power2.out" }
  );
}

function animateSupportChrome(signature) {
  if (getReducedMotion() || supportAnimationSignature === signature || typeof window.gsap === "undefined") {
    supportAnimationSignature = signature;
    return;
  }

  supportAnimationSignature = signature;
  const dock = root?.querySelector(".lab-language-dock");
  const toggle = root?.querySelector(".lab-support-toggle");
  const panel = root?.querySelector(".lab-support-panel");

  window.gsap.fromTo(
    [dock, toggle].filter(Boolean),
    { autoAlpha: 0, y: -8, scale: 0.98 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.36, ease: "power3.out", stagger: 0.05 }
  );

  if (state.helpOpen && panel) {
    window.gsap.fromTo(
      panel,
      { autoAlpha: 0, y: 14, scale: 0.98 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.34, ease: "power3.out" }
    );
  }
}

function updateShellMarkup(markup) {
  if (!root) {
    return true;
  }

  const existingShell = root.querySelector(".lab-shell");
  if (!existingShell) {
    root.innerHTML = markup;
    return true;
  }

  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  const nextShell = template.content.querySelector(".lab-shell");

  if (!nextShell) {
    return false;
  }

  existingShell.className = nextShell.className;

  const currentIdentityRail = existingShell.querySelector(".lab-identity-rail");
  const nextIdentityRail = nextShell.querySelector(".lab-identity-rail");
  const currentDirectoryRail = existingShell.querySelector(".lab-directory-rail");
  const nextDirectoryRail = nextShell.querySelector(".lab-directory-rail");

  if (currentIdentityRail && nextIdentityRail) {
    currentIdentityRail.innerHTML = nextIdentityRail.innerHTML;
  }

  if (currentDirectoryRail && nextDirectoryRail) {
    currentDirectoryRail.innerHTML = nextDirectoryRail.innerHTML;
  }

  return false;
}

function getCameraMessage(copy) {
  if (state.camera.status === "denied" || state.camera.status === "unavailable") {
    return getCameraStatusMessage(state.camera.status, state.language);
  }

  if (state.camera.status === "requesting") {
    return copy.permissionBody;
  }

  if (state.camera.enabled) {
    return copy.helpTitle;
  }

  return copy.permissionBody;
}

function updateHandCursor(gesture, results) {
  if (!handCursor) {
    return;
  }

  const palm = results?.multiHandLandmarks?.[0]?.[9];

  if (!palm) {
    handCursor.hidden = true;
    return;
  }

  handCursor.hidden = false;
  handCursor.dataset.gesture = gesture;
  handCursor.style.left = `${(1 - palm.x) * window.innerWidth}px`;
  handCursor.style.top = `${palm.y * window.innerHeight}px`;
}

function scrollDetailFromGesture(gesture, results) {
  const palm = results?.multiHandLandmarks?.[0]?.[9];

  if (gesture !== "OPEN" || !state.detail.isOpen || !palm || !state.gesture.lastPalm) {
    return;
  }

  const detailPanel = root?.querySelector(".lab-dossier");
  const scrollDelta = computeDetailScrollDelta({
    previousPalmY: state.gesture.lastPalm.y,
    palmY: palm.y
  });

  if (detailPanel && scrollDelta !== 0) {
    detailPanel.scrollTop += scrollDelta;
  }
}

function waitForDossierExit(dossier) {
  if (!dossier || getReducedMotion()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      dossier.removeEventListener("animationend", finish);
      window.clearTimeout(timeoutId);
      resolve();
    };
    const timeoutId = window.setTimeout(finish, DETAIL_EXIT_FALLBACK_MS);

    dossier.addEventListener("animationend", finish, { once: true });
    dossier.classList.add("is-closing");
  });
}

async function closeDetailWithTransition() {
  if (!state.detail.isOpen) {
    return;
  }

  if (detailCloseTransition) {
    return detailCloseTransition;
  }

  detailCloseTransition = (async () => {
    const dossier = root?.querySelector(".lab-dossier");
    root?.classList.add("is-detail-closing");
    sceneStage?.exitDetail?.();
    await waitForDossierExit(dossier);
    state = reduceAppState(state, { type: "detail/close" });
    root?.classList.remove("is-detail-closing");
    detailCloseTransition = null;
    await render();
  })();

  return detailCloseTransition;
}

function setCameraStatus(status) {
  state = reduceAppState(state, { type: "camera/status", payload: status });
  void render();
}

function stopGestureMode() {
  gestureSession?.stop?.();
  gestureSession = null;
  if (handCursor) {
    handCursor.hidden = true;
  }
  setCameraStatus("idle");
}

function handleGestureAction(gesture, results) {
  updateHandCursor(gesture, results);
  scrollDetailFromGesture(gesture, results);

  const palm = results?.multiHandLandmarks?.[0]?.[9];
  const palmX = results?.multiHandLandmarks?.[0]?.[9]?.x;

  if (state.detail.isOpen && gesture === "PINCH") {
    void closeDetailWithTransition();
    return;
  }

  if (state.detail.isOpen && gesture === "ZOOM") {
    state = {
      ...state,
      gesture: {
        ...state.gesture,
        lastGesture: gesture,
        lastPalm: palm ?? state.gesture.lastPalm,
        dragging: false,
        dragStartX: null
      }
    };
    return;
  }

  if (state.detail.isOpen && gesture === "OPEN" && palm) {
    state = {
      ...state,
      gesture: {
        ...state.gesture,
        lastGesture: gesture,
        lastPalm: palm,
        dragging: false,
        dragStartX: null
      }
    };
    return;
  }

  if (!state.detail.isOpen && gesture === "OPEN" && Number.isFinite(palmX)) {
    sceneStage?.updateGestureDrag?.(palmX);

    if (state.gesture.lastGesture === "OPEN") {
      return;
    }
  } else {
    sceneStage?.endGestureDrag?.();
  }

  const nextState = reduceAppState(state, {
    type: "gesture/apply",
    payload: {
      gesture,
      palm: results?.multiHandLandmarks?.[0]?.[9],
      recordIds: portfolioRecords.map((record) => record.id)
    }
  });

  if (nextState === state) {
    return;
  }

  state = nextState;
  void render();
}

async function requestGestureMode() {
  if (state.camera.status === "requesting") {
    return;
  }

  if (state.camera.enabled) {
    stopGestureMode();
    return;
  }

  setCameraStatus("requesting");

  try {
    gestureSession = await startGestureSession({
      videoElement: document.querySelector(".input_video"),
      onGesture: handleGestureAction,
      onStatus: (status) => {
        if (status !== "ready") {
          gestureSession = null;
        }

        state = reduceAppState(state, { type: "camera/status", payload: status });
        render();
      }
    });
  } catch {
    setCameraStatus("unavailable");
    return;
  }

  if (!gestureSession && state.camera.status === "requesting") {
    setCameraStatus("unavailable");
  }
}

async function mountScene(currentToken) {
  const mountEls = {
    webgl: root?.querySelector("#webgl-container"),
    css3d: root?.querySelector("#css3d-container")
  };

  let nextStage;

  try {
    nextStage = await createSceneStage({
      mountEls,
      records: portfolioRecords,
      onSelect: (activeId) => {
        state = reduceAppState(state, { type: "project/select", payload: activeId });
        void render();
      },
      onOpenDetail: () => {
        state = reduceAppState(state, { type: "detail/open" });
        void render();
      },
      reducedMotion: getReducedMotion(),
      mode: state.mode
    });
  } catch (error) {
    console.error("Unable to initialize portfolio scene", error);
    return;
  }

  if (currentToken !== renderToken) {
    nextStage.destroy();
    return;
  }

  sceneStage = nextStage;
  sceneStage.syncActiveRecord(state.projects.activeId);

  if (state.detail.isOpen) {
    sceneStage.enterDetail();
    return;
  }

  sceneStage.exitDetail();
}

async function render() {
  if (!root) {
    return;
  }

  root.classList.toggle("has-detail-open", state.detail.isOpen);

  const copy = uiCopy[state.language] ?? uiCopy.en;
  const activeRecord = portfolioRecords.find((record) => record.id === state.projects.activeId) ?? null;
  const cameraMessage = getCameraMessage(copy);
  const shellMarkup = buildShellMarkup({ state, records: portfolioRecords, copy, cameraMessage });
  const shellWasMounted = shellMarkup !== shellMarkupSnapshot ? updateShellMarkup(shellMarkup) : false;
  shellMarkupSnapshot = shellMarkup;
  const nextSceneSignature = JSON.stringify({ mode: state.mode, reducedMotion: getReducedMotion() });
  const nextSupportAnimationSignature = JSON.stringify({
    language: state.language,
    helpOpen: state.helpOpen,
    cameraStatus: state.camera.status
  });
  const nextProjectAnimationSignature = JSON.stringify({
    activeId: state.projects.activeId,
    language: state.language
  });

  const detailRoot = root.querySelector("#lab-detail-root");
  const supportRoot = root.querySelector("#lab-support-root");

  if (detailRoot) {
    const detailMarkup = buildDetailMarkup({ state, activeRecord, copy });

    if (detailMarkup !== detailMarkupSnapshot) {
      detailRoot.innerHTML = detailMarkup;
      detailMarkupSnapshot = detailMarkup;
    }
  }

  if (supportRoot) {
    const supportMarkup = buildSupportMarkup({ state, copy, cameraMessage });

    if (supportMarkup !== supportMarkupSnapshot) {
      supportRoot.innerHTML = supportMarkup;
      supportMarkupSnapshot = supportMarkup;
      animateSupportChrome(nextSupportAnimationSignature);
    }
  }

  animateShellIntro();
  animateProjectFocus(nextProjectAnimationSignature);

  if (!sceneStage || shellWasMounted || sceneSignature !== nextSceneSignature) {
    renderToken += 1;
    sceneSignature = nextSceneSignature;
    destroySceneStage();
    await mountScene(renderToken);
  }

  sceneStage?.syncActiveRecord(state.projects.activeId);

  if (state.detail.isOpen) {
    sceneStage?.enterDetail();
  } else {
    sceneStage?.exitDetail();
  }
}

if (root) {
  void render();

  root.addEventListener("click", async (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) {
      return;
    }

    let nextState = state;

    if (actionEl.dataset.action === "project/select") {
      nextState = reduceAppState(state, {
        type: "project/select",
        payload: Number(actionEl.dataset.projectId)
      });
    } else if (actionEl.dataset.action === "detail/open") {
      nextState = reduceAppState(state, { type: "detail/open" });
    } else if (actionEl.dataset.action === "detail/close") {
      await closeDetailWithTransition();
      return;
    } else if (actionEl.dataset.action === "camera/request") {
      await requestGestureMode();
      return;
    } else if (actionEl.dataset.action === "help/toggle") {
      nextState = reduceAppState(state, { type: "help/toggle" });
    } else if (actionEl.dataset.action === "language/set") {
      nextState = reduceAppState(state, {
        type: "language/set",
        payload: actionEl.dataset.language
      });
    } else {
      return;
    }

    state = nextState;
    await render();
  });
}

if (reducedMotionQuery) {
  const rerender = () => {
    void render();
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", rerender);
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(rerender);
  }
}
