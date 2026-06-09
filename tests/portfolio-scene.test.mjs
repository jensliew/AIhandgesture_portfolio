import assert from "node:assert/strict";
import test from "node:test";

import { computeGestureDragRotation, computeManualSwipeRotation, createSceneStage, getScenePreset } from "../scripts/portfolio-scene.mjs";

test("getScenePreset reduces atmosphere counts when reduced motion is active", () => {
  const preset = getScenePreset({ mode: "browse", reducedMotion: true });

  assert.deepEqual(preset, {
    particleCount: 0,
    ringCount: 0,
    lineCount: 0,
    nodeCount: 0,
    directoryDepth: 0,
    stageFloat: false
  });
});

test("getScenePreset keeps the browse stage present with restrained atmosphere", () => {
  const preset = getScenePreset({ mode: "browse", reducedMotion: false });

  assert.deepEqual(preset, {
    particleCount: 1400,
    ringCount: 4,
    lineCount: 12,
    nodeCount: 10,
    directoryDepth: 1,
    stageFloat: true
  });
});

test("getScenePreset quiets the scene in project detail mode", () => {
  const preset = getScenePreset({ mode: "project-detail", reducedMotion: false });

  assert.deepEqual(preset, {
    particleCount: 700,
    ringCount: 2,
    lineCount: 8,
    nodeCount: 6,
    directoryDepth: 0.35,
    stageFloat: false
  });
});

test("computeGestureDragRotation follows palm movement with the carousel sensitivity", () => {
  const rotation = computeGestureDragRotation({ startRotation: 1, startPalmX: 0.5, palmX: 0.65 });

  assert.ok(Math.abs(rotation - 0.4) < 0.000001);
});

test("computeManualSwipeRotation advances the carousel from wheel or touch deltas", () => {
  const wheelRotation = computeManualSwipeRotation({ currentRotation: 0, delta: 120 });
  const touchRotation = computeManualSwipeRotation({ currentRotation: 0, delta: 64, sensitivity: 0.006 });

  assert.ok(Math.abs(wheelRotation - -0.3) < 0.000001);
  assert.ok(Math.abs(touchRotation - -0.384) < 0.000001);
});

test("createSceneStage returns a safe noop lifecycle outside the browser runtime", async () => {
  const stage = await createSceneStage({ mountEls: null, records: [] });

  assert.equal(typeof stage.syncActiveRecord, "function");
  assert.equal(typeof stage.enterDetail, "function");
  assert.equal(typeof stage.exitDetail, "function");
  assert.equal(typeof stage.destroy, "function");
  assert.doesNotThrow(() => stage.destroy());
});
