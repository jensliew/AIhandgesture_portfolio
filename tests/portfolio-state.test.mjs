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

test("reduceAppState opens detail without dropping sibling detail fields", () => {
  const initialState = {
    ...createInitialState(portfolioRecords),
    detail: { isOpen: false, origin: "directory" }
  };

  const nextState = reduceAppState(initialState, { type: "detail/open" });

  assert.equal(nextState.detail.isOpen, true);
  assert.equal(nextState.detail.origin, "directory");
});

test("reduceAppState handles project selection by updating the active record", () => {
  const initialState = {
    ...createInitialState(portfolioRecords),
    detail: { isOpen: true, selectedTab: "overview" }
  };

  const nextState = reduceAppState(initialState, { type: "project/select", payload: portfolioRecords[2].id });

  assert.equal(nextState.projects.activeId, portfolioRecords[2].id);
  assert.equal(nextState.detail.isOpen, false);
  assert.equal(nextState.detail.selectedTab, "overview");
  assert.equal(nextState.mode, "browse");
});

test("reduceAppState closes detail without dropping sibling detail fields", () => {
  const initialState = {
    ...createInitialState(portfolioRecords),
    detail: { isOpen: true, selectedTab: "overview" }
  };

  const nextState = reduceAppState(initialState, { type: "detail/close" });

  assert.equal(nextState.detail.isOpen, false);
  assert.equal(nextState.detail.selectedTab, "overview");
  assert.equal(nextState.mode, "browse");
});

test("reduceAppState toggles help state", () => {
  const initialState = createInitialState(portfolioRecords);
  const openedHelp = reduceAppState(initialState, { type: "help/toggle" });
  const closedHelp = reduceAppState(openedHelp, { type: "help/toggle" });

  assert.equal(openedHelp.helpOpen, true);
  assert.equal(closedHelp.helpOpen, false);
});

test("reduceAppState marks the camera enabled when status is ready", () => {
  const initialState = createInitialState(portfolioRecords);
  const nextState = reduceAppState(initialState, { type: "camera/status", payload: "ready" });

  assert.equal(nextState.camera.status, "ready");
  assert.equal(nextState.camera.enabled, true);
});

test("reduceAppState returns the same state object for unknown actions", () => {
  const initialState = createInitialState(portfolioRecords);
  const nextState = reduceAppState(initialState, { type: "unknown/action" });

  assert.strictEqual(nextState, initialState);
});

test("reduceAppState switches language and camera status independently", () => {
  const initialState = createInitialState(portfolioRecords);
  const localizedState = reduceAppState(initialState, { type: "language/set", payload: "cn" });
  const cameraState = reduceAppState(localizedState, { type: "camera/status", payload: "denied" });

  assert.equal(localizedState.language, "cn");
  assert.equal(cameraState.camera.status, "denied");
  assert.equal(cameraState.mode, "browse");
});
