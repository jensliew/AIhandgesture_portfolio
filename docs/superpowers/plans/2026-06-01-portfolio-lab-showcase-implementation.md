# Portfolio Lab Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the portfolio into a browse-first Lab Showcase experience that preserves gesture interaction as an optional enhancement, improves credibility and navigation, and removes the camera-loading dead end.

**Architecture:** Keep `index.html` as the single entry surface, but move styles and behavior into focused ES modules. Use pure state, render, scene, and gesture helpers that can be exercised with Node's built-in test runner, then wire the final UI together through a single browser bootstrap module.

**Tech Stack:** Static HTML, CSS, ES modules (`.mjs`), Three.js, CSS3DRenderer, MediaPipe Hands, GSAP, Node `--test`

---

## File Structure

- Modify: `/Users/jensliew/MyPortfolio/index.html`
  Purpose: keep the import map and CDN dependencies, replace inline styles and inline application logic with the new shell root plus a single module entrypoint.
- Create: `/Users/jensliew/MyPortfolio/styles/portfolio.css`
  Purpose: hold the redesigned Lab Showcase tokens, layout, component styling, responsive rules, and reduced-motion fallbacks.
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-data.mjs`
  Purpose: export the current portfolio records, localized UI copy, and static metadata needed by the new shell.
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-state.mjs`
  Purpose: own the pure app-state model and reducer transitions for browse mode, detail mode, camera mode, language, and help visibility.
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs`
  Purpose: build the shell markup and detail markup from state and data, plus DOM update helpers.
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-gestures.mjs`
  Purpose: extract gesture classification, camera status copy, and opt-in gesture session wiring around MediaPipe.
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-scene.mjs`
  Purpose: extract the Three.js and CSS3D stage setup, restrained background presets, and stage transition hooks.
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs`
  Purpose: compose state, render, scene, and gesture modules into the final portfolio experience.
- Create: `/Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs`
  Purpose: cover reducer defaults and state transitions.
- Create: `/Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`
  Purpose: cover shell markup, directory markup, detail markup, and localized support surfaces.
- Create: `/Users/jensliew/MyPortfolio/tests/portfolio-gestures.test.mjs`
  Purpose: cover gesture classification and camera status helpers.
- Create: `/Users/jensliew/MyPortfolio/tests/portfolio-scene.test.mjs`
  Purpose: cover pure scene preset selection and reduced-motion stage config.

### Task 1: Extract App Data And State Foundations

**Files:**
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-data.mjs`
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-state.mjs`
- Create: `/Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs`

- [ ] **Step 1: Write the failing state test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { portfolioRecords, defaultLanguage } from "../scripts/portfolio-data.mjs";
import { createInitialState, reduceAppState } from "../scripts/portfolio-state.mjs";

test("createInitialState starts in browse mode with the first record active", () => {
  const state = createInitialState(portfolioRecords);

  assert.equal(state.mode, "browse");
  assert.equal(state.language, defaultLanguage);
  assert.equal(state.camera.status, "idle");
  assert.equal(state.projects.activeId, portfolioRecords[0].id);
  assert.equal(state.detail.isOpen, false);
});

test("reduceAppState opens detail and preserves the active record", () => {
  const initialState = createInitialState(portfolioRecords);
  const nextState = reduceAppState(initialState, { type: "detail/open" });

  assert.equal(nextState.mode, "project-detail");
  assert.equal(nextState.detail.isOpen, true);
  assert.equal(nextState.projects.activeId, portfolioRecords[0].id);
});

test("reduceAppState switches language and camera status independently", () => {
  const initialState = createInitialState(portfolioRecords);
  const localizedState = reduceAppState(initialState, { type: "language/set", payload: "cn" });
  const cameraState = reduceAppState(localizedState, { type: "camera/status", payload: "denied" });

  assert.equal(localizedState.language, "cn");
  assert.equal(cameraState.camera.status, "denied");
  assert.equal(cameraState.mode, "browse");
});
```

- [ ] **Step 2: Run the state test to verify it fails**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `portfolio-data.mjs` and `portfolio-state.mjs`

- [ ] **Step 3: Write the minimal data and state modules**

```js
// /Users/jensliew/MyPortfolio/scripts/portfolio-data.mjs
export const defaultLanguage = "en";

export const uiCopy = {
  en: {
    eyebrow: "Interactive Lab",
    enableGesture: "Enable gesture mode",
    disableGesture: "Disable gesture mode",
    browseMode: "Browse manually",
    helpTitle: "Gesture controls",
    permissionTitle: "Gesture mode uses your camera in-browser",
    permissionBody: "Nothing is uploaded. You can continue browsing without camera access."
  },
  cn: {
    eyebrow: "互动实验室",
    enableGesture: "启用手势模式",
    disableGesture: "关闭手势模式",
    browseMode: "手动浏览",
    helpTitle: "手势控制",
    permissionTitle: "手势模式会在浏览器内使用相机",
    permissionBody: "不会上传任何内容，你也可以继续手动浏览。"
  }
};
export const portfolioRecords = [
  {
    id: 0,
    indexStr: "01",
    title: "PROFILE",
    brief: "Jens Liew<br>Cloud & Software Engineer<br>Full-Stack Developer",
    cover: "./images/profile.png",
    details: `
      <div class="detail-hero" style="background-image: url('./images/profile.png')"></div>
      <div class="detail-content-wrap">
        <h1>Liew Shen Wei</h1>
        <div class="subtitle">Cloud Engineering & Software Development</div>
        <div class="subtitle">Full-Stack Developer</div>

        <div class="contact-tags">
          <span class="contact-tag">jensliew0704@gmail.com</span>
          <span class="contact-tag">+60186634699</span>
          <a href="https://www.linkedin.com/in/shen-wei-liew-9341a430b" target="_blank" style="text-decoration:none;"><span class="contact-tag" style="cursor:pointer;border-color:rgba(0,119,181,0.5);color:#0077b5;">LinkedIn</span></a>
        </div>
        <h2>CORE TECH STACK</h2>
        <div class="tech-stack">
          <div class="tech-icon-wrap"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" alt="AWS">AWS</div>
          <div class="tech-icon-wrap"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React">React</div>
          <div class="tech-icon-wrap"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" alt="Node.js">Node.js</div>
          <div class="tech-icon-wrap"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" alt="Python">Python</div>
          <div class="tech-icon-wrap"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/githubactions/githubactions-original.svg" alt="GitHub Actions">GitHub Actions</div>
        </div>
        <h2>EDUCATION</h2>
        <h3>Asia Pacific University (APU)</h3>
        <p><strong>Degree (2025):</strong> BSc in IT (Cloud Engineering) - Current GPA: 3.88</p>
        <p><strong>Diploma (2022):</strong> Diploma in IT (Software Engineering) - CGPA: 3.77</p>
      </div>
    `
  },
  {
    id: 1,
    indexStr: "02",
    title: "EXPERIENCE",
    brief: "Professional Internships<br>Software Engineering",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800",
    details: `
      <div class="detail-hero" style="background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600')"></div>
      <div class="detail-content-wrap">
        <h1>Work Experience</h1>
        <div class="subtitle">Professional Software Engineering Journey</div>
        <h2>Kinslabs Sdn. Bhd.</h2>
        <h3>Software Engineering Intern (Dec 2025 - May 2026)</h3>
        <ul>
          <li>Performed bug investigation, testing, and issue verification across internal systems.</li>
          <li>Resolved DNS/SPF and WordPress hosting configuration issues.</li>
          <li>Designed an IP geolocation caching approach to reduce API usage.</li>
        </ul>
        <h2>Skrine</h2>
        <h3>System Developer Intern (Aug 2024 - Oct 2024)</h3>
        <ul>
          <li>Worked on a team project to digitalize manual forms within Malaysia's top legal firm.</li>
          <li>Utilized Microsoft Power Apps, Power Automate, and SharePoint.</li>
        </ul>
      </div>
    `
  }
];

// /Users/jensliew/MyPortfolio/scripts/portfolio-state.mjs
export function createInitialState(records) {
  return {
    mode: "browse",
    language: defaultLanguage,
    helpOpen: false,
    camera: { status: "idle", enabled: false },
    detail: { isOpen: false },
    projects: { activeId: records[0]?.id ?? null }
  };
}

export function reduceAppState(state, action) {
  switch (action.type) {
    case "project/select":
      return {
        ...state,
        projects: { ...state.projects, activeId: action.payload },
        detail: { ...state.detail, isOpen: false },
        mode: "browse"
      };
    case "detail/open":
      return { ...state, detail: { isOpen: true }, mode: "project-detail" };
    case "detail/close":
      return { ...state, detail: { isOpen: false }, mode: "browse" };
    case "language/set":
      return { ...state, language: action.payload };
    case "help/toggle":
      return { ...state, helpOpen: !state.helpOpen };
    case "camera/status":
      return {
        ...state,
        camera: {
          ...state.camera,
          status: action.payload,
          enabled: action.payload === "ready"
        }
      };
    default:
      return state;
  }
}
```

After writing the module skeleton above, continue the `portfolioRecords` array with the remaining four exact record objects now living at `/Users/jensliew/MyPortfolio/index.html:403-500`, preserving every current `cover` path and `details` HTML block so no portfolio content regresses during the redesign.

- [ ] **Step 4: Run the state test to verify it passes**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs`
Expected: PASS with `3 tests` and `0 failures`

- [ ] **Step 5: Commit the foundation extraction**

```bash
git add /Users/jensliew/MyPortfolio/scripts/portfolio-data.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-state.mjs /Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs
git commit -m "refactor: extract portfolio data and app state"
```

### Task 2: Build The Browse-First Lab Shell

**Files:**
- Create: `/Users/jensliew/MyPortfolio/styles/portfolio.css`
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs`
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs`
- Create: `/Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`
- Modify: `/Users/jensliew/MyPortfolio/index.html:7-299`

- [ ] **Step 1: Write the failing render test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { portfolioRecords, uiCopy } from "../scripts/portfolio-data.mjs";
import { createInitialState } from "../scripts/portfolio-state.mjs";
import { buildShellMarkup } from "../scripts/portfolio-render.mjs";

test("buildShellMarkup includes the three-panel lab structure", () => {
  const state = createInitialState(portfolioRecords);
  const html = buildShellMarkup({ state, records: portfolioRecords, copy: uiCopy.en });

  assert.match(html, /data-panel="identity-rail"/);
  assert.match(html, /data-panel="showcase-stage"/);
  assert.match(html, /data-panel="project-directory"/);
  assert.match(html, /Enable gesture mode/);
});
```

- [ ] **Step 2: Run the render test to verify it fails**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `portfolio-render.mjs`

- [ ] **Step 3: Write the shell renderer, stylesheet, and HTML entry shell**

```js
// /Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs
export function buildShellMarkup({ state, records, copy }) {
  const directoryItems = records.map((record) => `
    <button class="lab-directory-item${record.id === state.projects.activeId ? " is-active" : ""}" data-action="project/select" data-project-id="${record.id}">
      <span class="lab-directory-index">${record.indexStr}</span>
      <span class="lab-directory-copy">
        <strong>${record.title}</strong>
        <small>${record.brief.replace(/<br>/g, " ")}</small>
      </span>
    </button>
  `).join("");

  return `
    <div class="lab-shell">
      <aside class="lab-identity-rail" data-panel="identity-rail"></aside>
      <main class="lab-showcase-stage" data-panel="showcase-stage">
        <div id="webgl-container" aria-hidden="true"></div>
        <div id="css3d-container" aria-hidden="true"></div>
        <div class="lab-stage-overlay"></div>
      </main>
      <aside class="lab-directory-rail" data-panel="project-directory">
        <button class="lab-gesture-toggle" data-action="camera/request">${copy.enableGesture}</button>
        <div class="lab-directory-list">${directoryItems}</div>
      </aside>
    </div>
    <section id="lab-detail-root"></section>
    <section id="lab-support-root"></section>
  `;
}
```

```css
/* /Users/jensliew/MyPortfolio/styles/portfolio.css */
:root {
  --bg-base: #090b11;
  --bg-surface: rgba(19, 25, 39, 0.88);
  --bg-elevated: rgba(255, 255, 255, 0.05);
  --ink-strong: #dbe4f0;
  --ink-muted: #97a7bb;
  --accent-cyan: #63e0ff;
  --accent-rose: #ff8ca8;
}

body {
  margin: 0;
  min-height: 100vh;
  overflow: hidden;
  color: var(--ink-strong);
  background: radial-gradient(circle at top, rgba(99, 224, 255, 0.08), transparent 30%), var(--bg-base);
}

.lab-shell {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(240px, 280px) minmax(0, 1fr) minmax(280px, 320px);
  gap: 18px;
  min-height: 100vh;
  padding: 24px;
}
```

```html
<!-- /Users/jensliew/MyPortfolio/index.html -->
<head>
  <!-- keep the existing import map and CDN script tags -->
  <link rel="stylesheet" href="./styles/portfolio.css">
</head>
<body>
  <video class="input_video" autoplay playsinline></video>
  <div id="lab-app"></div>
  <div id="hand-cursor" hidden></div>
  <script type="module" src="./scripts/portfolio-app.mjs"></script>
</body>
```

- [ ] **Step 4: Run the render test to verify it passes**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`
Expected: PASS with `1 test` and `0 failures`

- [ ] **Step 5: Commit the new shell**

```bash
git add /Users/jensliew/MyPortfolio/index.html /Users/jensliew/MyPortfolio/styles/portfolio.css /Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs
git commit -m "feat: add browse-first lab showcase shell"
```

### Task 3: Wire Manual Navigation, Identity Rail, And Project Dossier

**Files:**
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-state.mjs`
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs`
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs`
- Modify: `/Users/jensliew/MyPortfolio/styles/portfolio.css`
- Modify: `/Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs`
- Modify: `/Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`

- [ ] **Step 1: Add failing tests for project switching and dossier rendering**

```js
test("reduceAppState changes the active project and closes the dossier", () => {
  const initialState = createInitialState(portfolioRecords);
  const detailState = reduceAppState(initialState, { type: "detail/open" });
  const nextState = reduceAppState(detailState, { type: "project/select", payload: portfolioRecords[2].id });

  assert.equal(nextState.projects.activeId, portfolioRecords[2].id);
  assert.equal(nextState.detail.isOpen, false);
  assert.equal(nextState.mode, "browse");
});

test("buildDetailMarkup renders the current project title and manual close control", () => {
  const state = { ...createInitialState(portfolioRecords), detail: { isOpen: true } };
  const html = buildDetailMarkup({ state, activeRecord: portfolioRecords[0], copy: uiCopy.en });

  assert.match(html, /Liew Shen Wei/);
  assert.match(html, /data-action="detail\\/close"/);
});
```

- [ ] **Step 2: Run the updated tests to verify they fail**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`
Expected: FAIL because `project/select` and `buildDetailMarkup` are not implemented

- [ ] **Step 3: Implement the manual navigation and dossier panel**

```js
// /Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs
export function buildDetailMarkup({ state, activeRecord, copy }) {
  if (!state.detail.isOpen || !activeRecord) return "";

  return `
    <section class="lab-dossier" aria-label="${activeRecord.title}">
      <button class="lab-dossier-close" data-action="detail/close">Close</button>
      <div class="lab-dossier-hero" style="background-image:url('${activeRecord.cover}')"></div>
      <div class="lab-dossier-body">${activeRecord.details}</div>
    </section>
  `;
}

// /Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs
const root = document.querySelector("#lab-app");
let state = createInitialState(portfolioRecords);

function render() {
  const copy = uiCopy[state.language];
  const activeRecord = portfolioRecords.find((record) => record.id === state.projects.activeId);

  root.innerHTML = buildShellMarkup({ state, records: portfolioRecords, copy });
  root.querySelector("#lab-detail-root").innerHTML = buildDetailMarkup({ state, activeRecord, copy });
}

root.addEventListener("click", (event) => {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;

  if (actionEl.dataset.action === "project/select") {
    state = reduceAppState(state, { type: "project/select", payload: Number(actionEl.dataset.projectId) });
  }
  if (actionEl.dataset.action === "detail/open") {
    state = reduceAppState(state, { type: "detail/open" });
  }
  if (actionEl.dataset.action === "detail/close") {
    state = reduceAppState(state, { type: "detail/close" });
  }

  render();
});
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`
Expected: PASS with `5 tests` and `0 failures`

- [ ] **Step 5: Commit the manual browsing flow**

```bash
git add /Users/jensliew/MyPortfolio/scripts/portfolio-state.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs /Users/jensliew/MyPortfolio/styles/portfolio.css /Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs
git commit -m "feat: wire manual navigation and project dossier"
```

### Task 4: Add Camera Opt-In And Gesture Helpers

**Files:**
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-gestures.mjs`
- Create: `/Users/jensliew/MyPortfolio/tests/portfolio-gestures.test.mjs`
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs`
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs`
- Modify: `/Users/jensliew/MyPortfolio/styles/portfolio.css`

- [ ] **Step 1: Write the failing gesture and camera-state tests**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { classifyGesture, getCameraStatusMessage } from "../scripts/portfolio-gestures.mjs";

test("classifyGesture returns OPEN for a wide four-finger spread", () => {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  landmarks[0] = { x: 0.5, y: 0.8, z: 0 };
  landmarks[8] = { x: 0.5, y: 0.2, z: 0 };
  landmarks[12] = { x: 0.58, y: 0.2, z: 0 };
  landmarks[16] = { x: 0.66, y: 0.24, z: 0 };
  landmarks[20] = { x: 0.74, y: 0.28, z: 0 };

  assert.equal(classifyGesture(landmarks), "OPEN");
});

test("getCameraStatusMessage returns a friendly manual fallback for denied permission", () => {
  assert.equal(
    getCameraStatusMessage("denied", "en"),
    "Camera access was denied. Continue browsing manually or try enabling gesture mode again."
  );
});
```

- [ ] **Step 2: Run the gesture test to verify it fails**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-gestures.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `portfolio-gestures.mjs`

- [ ] **Step 3: Implement the gesture module and camera opt-in flow**

```js
// /Users/jensliew/MyPortfolio/scripts/portfolio-gestures.mjs
export function getDistance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
}

export function classifyGesture(landmarks) {
  const wrist = landmarks[0];
  const isExtended = (tip, mcp) => getDistance(landmarks[tip], wrist) > getDistance(landmarks[mcp], wrist) * 1.15;
  const openFingers = [isExtended(8, 5), isExtended(12, 9), isExtended(16, 13), isExtended(20, 17)].filter(Boolean).length;
  const pinchDistance = getDistance(landmarks[4], landmarks[8]);

  if (openFingers >= 3) return "OPEN";
  if (openFingers === 0 && pinchDistance >= 0.05) return "FIST";
  if (openFingers <= 1 && pinchDistance > 0.12) return "ZOOM";
  if (openFingers <= 1 && pinchDistance < 0.05) return "PINCH";
  return "NONE";
}

export function getCameraStatusMessage(status, language) {
  const messages = {
    en: {
      denied: "Camera access was denied. Continue browsing manually or try enabling gesture mode again.",
      unavailable: "Camera hardware is unavailable. The portfolio is still fully browseable without gesture mode."
    },
    cn: {
      denied: "相机权限被拒绝。你仍可继续手动浏览，或稍后再次启用手势模式。",
      unavailable: "当前无法使用相机设备。你仍可完整手动浏览作品集。"
    }
  };
  return messages[language][status];
}
```

```js
// /Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs
async function requestGestureMode() {
  state = reduceAppState(state, { type: "camera/status", payload: "requesting" });
  render();

  try {
    await startGestureSession({
      videoElement: document.querySelector(".input_video"),
      onGesture: handleGestureAction,
      onStatus: (status) => {
        state = reduceAppState(state, { type: "camera/status", payload: status });
        render();
      }
    });
  } catch {
    state = reduceAppState(state, { type: "camera/status", payload: "unavailable" });
    render();
  }
}
```

- [ ] **Step 4: Run the gesture tests to verify they pass**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-gestures.test.mjs`
Expected: PASS with `2 tests` and `0 failures`

- [ ] **Step 5: Commit the opt-in gesture layer**

```bash
git add /Users/jensliew/MyPortfolio/scripts/portfolio-gestures.mjs /Users/jensliew/MyPortfolio/tests/portfolio-gestures.test.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs /Users/jensliew/MyPortfolio/styles/portfolio.css
git commit -m "feat: add opt-in camera and gesture helpers"
```

### Task 5: Rebuild The Three.js Stage And Restrain Motion

**Files:**
- Create: `/Users/jensliew/MyPortfolio/scripts/portfolio-scene.mjs`
- Create: `/Users/jensliew/MyPortfolio/tests/portfolio-scene.test.mjs`
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs`
- Modify: `/Users/jensliew/MyPortfolio/styles/portfolio.css`

- [ ] **Step 1: Write the failing scene preset test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { getScenePreset } from "../scripts/portfolio-scene.mjs";

test("getScenePreset reduces atmosphere counts when reduced motion is active", () => {
  const preset = getScenePreset({ mode: "browse", reducedMotion: true });

  assert.equal(preset.particleCount, 0);
  assert.equal(preset.ringCount, 0);
  assert.equal(preset.stageFloat, false);
});

test("getScenePreset keeps the stage present in browse mode", () => {
  const preset = getScenePreset({ mode: "browse", reducedMotion: false });

  assert.equal(preset.directoryDepth, 1);
  assert.equal(preset.stageFloat, true);
});
```

- [ ] **Step 2: Run the scene test to verify it fails**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-scene.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `portfolio-scene.mjs`

- [ ] **Step 3: Implement the extracted stage module and reduced background profile**

```js
// /Users/jensliew/MyPortfolio/scripts/portfolio-scene.mjs
export function getScenePreset({ mode, reducedMotion }) {
  if (reducedMotion) {
    return { particleCount: 0, ringCount: 0, lineCount: 0, nodeCount: 0, directoryDepth: 0, stageFloat: false };
  }

  if (mode === "project-detail") {
    return { particleCount: 700, ringCount: 2, lineCount: 8, nodeCount: 6, directoryDepth: 0.35, stageFloat: false };
  }

  return { particleCount: 1400, ringCount: 4, lineCount: 12, nodeCount: 10, directoryDepth: 1, stageFloat: true };
}

export function createSceneStage({ mountEls, records, onSelect, onOpenDetail, reducedMotion }) {
  const gsap = window.gsap;
  const preset = getScenePreset({ mode: "browse", reducedMotion });
  let activeIndex = 0;
  let isDetailMode = false;

  function syncActiveRecord(activeId) {
    activeIndex = Math.max(records.findIndex((record) => record.id === activeId), 0);
    gsap.to(carouselGroup.rotation, {
      y: -activeIndex * anglePerCard,
      duration: 0.7,
      ease: "power3.out"
    });
  }

  function enterDetail() {
    isDetailMode = true;
    gsap.to(camera.position, { z: 620, duration: 0.6, ease: "power2.out" });
  }

  function exitDetail() {
    isDetailMode = false;
    gsap.to(camera.position, { z: 1500, duration: 0.7, ease: "power2.out" });
  }

  function destroy() {
    window.removeEventListener("resize", handleResize);
    glRenderer.dispose();
  }

  return {
    syncActiveRecord,
    enterDetail,
    exitDetail,
    destroy
  };
}
```

In the same step, move the existing scene setup from `/Users/jensliew/MyPortfolio/index.html:512-680` and `/Users/jensliew/MyPortfolio/index.html:795-836` into this module, but cap the background atmosphere using the `preset` values above so the redesigned stage carries fewer particles, rings, lines, and idle float effects than the current implementation.

- [ ] **Step 4: Run the scene test to verify it passes**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-scene.test.mjs`
Expected: PASS with `2 tests` and `0 failures`

- [ ] **Step 5: Commit the stage refactor**

```bash
git add /Users/jensliew/MyPortfolio/scripts/portfolio-scene.mjs /Users/jensliew/MyPortfolio/tests/portfolio-scene.test.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs /Users/jensliew/MyPortfolio/styles/portfolio.css
git commit -m "feat: refactor stage into restrained lab showcase scene"
```

### Task 6: Add Localized Support Surfaces, Responsive Fallback, And Reduced Motion

**Files:**
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs`
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs`
- Modify: `/Users/jensliew/MyPortfolio/styles/portfolio.css`
- Modify: `/Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`

- [ ] **Step 1: Write the failing support-surface test**

```js
test("buildSupportMarkup shows manual fallback copy and language controls", () => {
  const state = {
    ...createInitialState(portfolioRecords),
    language: "cn",
    camera: { status: "denied", enabled: false }
  };
  const html = buildSupportMarkup({ state, copy: uiCopy.cn, cameraMessage: "相机权限被拒绝。你仍可继续手动浏览，或稍后再次启用手势模式。" });

  assert.match(html, /相机权限被拒绝/);
  assert.match(html, /data-action="language\\/set"/);
});
```

- [ ] **Step 2: Run the render test to verify it fails**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`
Expected: FAIL because `buildSupportMarkup` is not implemented

- [ ] **Step 3: Implement the support drawer, responsive stack, and reduced-motion CSS**

```js
// /Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs
export function buildSupportMarkup({ state, copy, cameraMessage }) {
  return `
    <aside class="lab-support-drawer${state.helpOpen ? " is-open" : ""}">
      <button data-action="help/toggle">${copy.helpTitle}</button>
      <div class="lab-support-status">${cameraMessage ?? ""}</div>
      <div class="lab-language-switcher">
        <button data-action="language/set" data-language="en">EN</button>
        <button data-action="language/set" data-language="cn">中文</button>
      </div>
    </aside>
  `;
}
```

```css
/* /Users/jensliew/MyPortfolio/styles/portfolio.css */
@media (max-width: 1100px) {
  .lab-shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      "identity"
      "stage"
      "directory";
    overflow: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Run the render test to verify it passes**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`
Expected: PASS with `3 tests` and `0 failures`

- [ ] **Step 5: Commit the support and fallback polish**

```bash
git add /Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs /Users/jensliew/MyPortfolio/styles/portfolio.css /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs
git commit -m "feat: add localized support drawer and responsive fallback"
```

### Task 7: Run Full Verification And Final Cleanup

**Files:**
- Modify: `/Users/jensliew/MyPortfolio/index.html`
- Modify: `/Users/jensliew/MyPortfolio/styles/portfolio.css`
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs`
- Modify: `/Users/jensliew/MyPortfolio/scripts/portfolio-scene.mjs`
- Test: `/Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs`
- Test: `/Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs`
- Test: `/Users/jensliew/MyPortfolio/tests/portfolio-gestures.test.mjs`
- Test: `/Users/jensliew/MyPortfolio/tests/portfolio-scene.test.mjs`

- [ ] **Step 1: Run the complete automated test suite**

Run: `node --test /Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs /Users/jensliew/MyPortfolio/tests/portfolio-gestures.test.mjs /Users/jensliew/MyPortfolio/tests/portfolio-scene.test.mjs`
Expected: PASS with `0 failures`

- [ ] **Step 2: Start a local preview server**

Run: `python3 -m http.server 4173`
Expected: `Serving HTTP on` and the project available at `http://127.0.0.1:4173/`

- [ ] **Step 3: Verify browse-first mode in the browser**

Run: open `http://127.0.0.1:4173/` in the in-app browser
Expected: the identity rail, active showcase, and project directory render before any camera request appears

- [ ] **Step 4: Verify the denied-camera fallback**

Run: click `Enable gesture mode`, deny permission in the browser prompt
Expected: the portfolio remains fully browseable, a camera status message appears, and no loading overlay blocks the page

- [ ] **Step 5: Verify accepted camera flow and core gestures**

Run: click `Enable gesture mode`, allow permission, then test open hand, spread, pinch, and manual click navigation
Expected: manual navigation still works, open hand navigates, spread opens detail, pinch closes detail, and no console errors appear

- [ ] **Step 6: Verify smaller-screen and reduced-motion behavior**

Run: use browser responsive mode around `1024px` and `768px`, then simulate `prefers-reduced-motion: reduce`
Expected: the shell collapses into a readable vertical flow, the directory remains usable, and the stage does not rely on continuous motion for comprehension

- [ ] **Step 7: Commit the verified Lab Showcase redesign**

```bash
git add /Users/jensliew/MyPortfolio/index.html /Users/jensliew/MyPortfolio/styles/portfolio.css /Users/jensliew/MyPortfolio/scripts/portfolio-data.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-state.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-render.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-gestures.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-scene.mjs /Users/jensliew/MyPortfolio/scripts/portfolio-app.mjs /Users/jensliew/MyPortfolio/tests/portfolio-state.test.mjs /Users/jensliew/MyPortfolio/tests/portfolio-render.test.mjs /Users/jensliew/MyPortfolio/tests/portfolio-gestures.test.mjs /Users/jensliew/MyPortfolio/tests/portfolio-scene.test.mjs
git commit -m "feat: redesign portfolio as lab showcase"
```

## Self-Review

### Spec coverage

- Layout and hierarchy are covered by Tasks 2 and 3.
- Browse-first manual fallback is covered by Tasks 2, 3, and 7.
- Camera opt-in, denied-permission handling, and gesture preservation are covered by Tasks 4 and 7.
- Restrained stage motion and visual cleanup are covered by Task 5.
- Responsive and reduced-motion behavior are covered by Task 6 and verified in Task 7.
- Existing feature preservation and regression verification are covered by Tasks 3, 4, and 7.

### Placeholder scan

- No `TBD`, `TODO`, or "implement later" placeholders remain.
- Browser checks are listed explicitly where pure unit tests are not enough.

### Type consistency

- Shared state keys are `mode`, `language`, `camera`, `detail`, and `projects`.
- Gesture helper output names are `OPEN`, `FIST`, `ZOOM`, `PINCH`, and `NONE`.
- Scene state mode names stay aligned with the reducer: `browse` and `project-detail`.
