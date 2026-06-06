import { portfolioRecords, uiCopy } from "./portfolio-data.mjs";
import { getCameraStatusMessage, startGestureSession } from "./portfolio-gestures.mjs";
import { createInitialState, reduceAppState } from "./portfolio-state.mjs";
import { buildDetailMarkup, buildShellMarkup } from "./portfolio-render.mjs";

const root = document.querySelector("#lab-app");
let state = createInitialState(portfolioRecords);
let gestureSession = null;

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

function setCameraStatus(status) {
  state = reduceAppState(state, { type: "camera/status", payload: status });
  render();
}

function stopGestureMode() {
  gestureSession?.stop?.();
  gestureSession = null;
  setCameraStatus("idle");
}

function handleGestureAction(gesture) {
  if (gesture !== "PINCH" || !state.detail.isOpen) {
    return;
  }

  state = reduceAppState(state, { type: "detail/close" });
  render();
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

function render() {
  if (!root) {
    return;
  }

  const copy = uiCopy[state.language] ?? uiCopy.en;
  const activeRecord = portfolioRecords.find((record) => record.id === state.projects.activeId) ?? null;
  const cameraMessage = getCameraMessage(copy);

  root.innerHTML = buildShellMarkup({ state, records: portfolioRecords, copy, cameraMessage });
  const detailRoot = root.querySelector("#lab-detail-root");

  if (detailRoot) {
    detailRoot.innerHTML = buildDetailMarkup({ state, activeRecord });
  }
}

if (root) {
  render();

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
      nextState = reduceAppState(state, { type: "detail/close" });
    } else if (actionEl.dataset.action === "camera/request") {
      await requestGestureMode();
      return;
    } else {
      return;
    }

    state = nextState;
    render();
  });
}
