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

test("reduceAppState changes the active project and closes the dossier", () => {
  const initialState = createInitialState(portfolioRecords);
  const detailState = reduceAppState(initialState, { type: "detail/open" });
  const nextState = reduceAppState(detailState, {
    type: "project/select",
    payload: portfolioRecords[2].id
  });

  assert.equal(nextState.projects.activeId, portfolioRecords[2].id);
  assert.equal(nextState.detail.isOpen, false);
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

test("reduceAppState tracks open-hand dragging without changing projects", () => {
  const initialState = createInitialState(portfolioRecords);
  const dragStartState = reduceAppState(initialState, {
    type: "gesture/apply",
    payload: {
      gesture: "OPEN",
      recordIds: portfolioRecords.map((record) => record.id),
      palm: { x: 0.5, y: 0.5 },
      now: 1200
    }
  });
  const nextState = reduceAppState(dragStartState, {
    type: "gesture/apply",
    payload: {
      gesture: "OPEN",
      recordIds: portfolioRecords.map((record) => record.id),
      palm: { x: 0.68, y: 0.5 },
      now: 1400
    }
  });

  assert.equal(nextState.projects.activeId, portfolioRecords[0].id);
  assert.equal(nextState.detail.isOpen, false);
  assert.equal(nextState.gesture.dragging, true);
  assert.equal(nextState.gesture.lastGesture, "OPEN");
});

test("reduceAppState opens and closes detail from zoom and pinch gestures", () => {
  const initialState = createInitialState(portfolioRecords);
  const detailState = reduceAppState(initialState, {
    type: "gesture/apply",
    payload: {
      gesture: "ZOOM",
      recordIds: portfolioRecords.map((record) => record.id),
      now: 1200
    }
  });
  const closedState = reduceAppState(detailState, {
    type: "gesture/apply",
    payload: {
      gesture: "PINCH",
      recordIds: portfolioRecords.map((record) => record.id),
      now: 2400
    }
  });

  assert.equal(detailState.detail.isOpen, true);
  assert.equal(detailState.mode, "project-detail");
  assert.equal(closedState.detail.isOpen, false);
  assert.equal(closedState.mode, "browse");
});

test("reduceAppState keeps the active project while open-hand tracking in detail mode", () => {
  const initialState = reduceAppState(createInitialState(portfolioRecords), { type: "detail/open" });
  const nextState = reduceAppState(initialState, {
    type: "gesture/apply",
    payload: {
      gesture: "OPEN",
      recordIds: portfolioRecords.map((record) => record.id),
      palm: { x: 0.8, y: 0.5 },
      now: 1200
    }
  });

  assert.equal(nextState.projects.activeId, portfolioRecords[0].id);
  assert.equal(nextState.detail.isOpen, true);
  assert.equal(nextState.mode, "project-detail");
  assert.equal(nextState.gesture.lastGesture, "OPEN");
});

test("reduceAppState keeps detail open without re-opening on repeated zoom in detail mode", () => {
  const initialState = reduceAppState(createInitialState(portfolioRecords), {
    type: "gesture/apply",
    payload: {
      gesture: "ZOOM",
      recordIds: portfolioRecords.map((record) => record.id),
      now: 1200
    }
  });
  const nextState = reduceAppState(initialState, {
    type: "gesture/apply",
    payload: {
      gesture: "ZOOM",
      recordIds: portfolioRecords.map((record) => record.id),
      palm: { x: 0.5, y: 0.4 },
      now: 2400
    }
  });

  assert.equal(nextState.detail.isOpen, true);
  assert.equal(nextState.mode, "project-detail");
  assert.equal(nextState.gesture.lastGesture, "ZOOM");
  assert.equal(nextState.gesture.lastActionAt, initialState.gesture.lastActionAt);
});

test("reduceAppState ignores repeated gestures during the cooldown window", () => {
  const initialState = createInitialState(portfolioRecords);
  const firstState = reduceAppState(initialState, {
    type: "gesture/apply",
    payload: {
      gesture: "OPEN",
      recordIds: portfolioRecords.map((record) => record.id),
      palm: { x: 0.5, y: 0.5 },
      now: 1200
    }
  });
  const movedState = reduceAppState(firstState, {
    type: "gesture/apply",
    payload: {
      gesture: "OPEN",
      recordIds: portfolioRecords.map((record) => record.id),
      palm: { x: 0.68, y: 0.5 },
      now: 1500
    }
  });
  const nextState = reduceAppState(movedState, {
    type: "gesture/apply",
    payload: {
      gesture: "OPEN",
      recordIds: portfolioRecords.map((record) => record.id),
      palm: { x: 0.86, y: 0.5 },
      now: 1600
    }
  });

  assert.equal(nextState.projects.activeId, portfolioRecords[0].id);
  assert.equal(nextState.gesture.lastGesture, "OPEN");
});

test("reduceAppState clears open-hand dragging when the hand closes", () => {
  const initialState = createInitialState(portfolioRecords);
  const dragStartState = reduceAppState(initialState, {
    type: "gesture/apply",
    payload: {
      gesture: "OPEN",
      recordIds: portfolioRecords.map((record) => record.id),
      palm: { x: 0.5, y: 0.5 },
      now: 1200
    }
  });
  const nextState = reduceAppState(dragStartState, {
    type: "gesture/apply",
    payload: {
      gesture: "FIST",
      recordIds: portfolioRecords.map((record) => record.id),
      palm: { x: 0.5, y: 0.5 },
      now: 1300
    }
  });

  assert.equal(nextState.gesture.dragging, false);
  assert.equal(nextState.gesture.dragStartX, null);
  assert.equal(nextState.projects.activeId, portfolioRecords[0].id);
});

test("reduceAppState keeps idle no-hand frames from forcing state churn", () => {
  const initialState = createInitialState(portfolioRecords);
  const nextState = reduceAppState(initialState, {
    type: "gesture/apply",
    payload: {
      gesture: "NONE",
      recordIds: portfolioRecords.map((record) => record.id),
      now: 1200
    }
  });

  assert.strictEqual(nextState, initialState);
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
