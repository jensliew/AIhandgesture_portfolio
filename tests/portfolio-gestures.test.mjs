import test from "node:test";
import assert from "node:assert/strict";

import { classifyGesture, computeDetailScrollDelta, getCameraStatusMessage, startGestureSession } from "../scripts/portfolio-gestures.mjs";

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

test("computeDetailScrollDelta converts palm movement into panel scroll", () => {
  const scrollDelta = computeDetailScrollDelta({ previousPalmY: 0.4, palmY: 0.45 });

  assert.ok(Math.abs(scrollDelta - -150) < 0.000001);
  assert.equal(computeDetailScrollDelta({ previousPalmY: 0.4, palmY: 0.402 }), 0);
});

test("startGestureSession reports unavailable when setup throws before the camera starts", async () => {
  const statuses = [];
  const videoElement = {};
  const HandsCtor = class {
    constructor() {
      throw new Error("setup exploded");
    }
  };

  const session = await startGestureSession({
    videoElement,
    onStatus: (status) => statuses.push(status),
    HandsCtor,
    CameraCtor: class {}
  });

  assert.equal(session, null);
  assert.deepEqual(statuses, ["unavailable"]);
});

test("startGestureSession emits NONE when a processed frame has no hand landmarks", async () => {
  const gestures = [];
  let resultsHandler = null;

  class HandsCtor {
    setOptions() {}
    onResults(handler) {
      resultsHandler = handler;
    }
    async send() {
      resultsHandler?.({ multiHandLandmarks: [] });
    }
  }

  class CameraCtor {
    constructor(videoElement, options) {
      this.options = options;
    }
    async start() {
      await this.options.onFrame();
    }
  }

  const session = await startGestureSession({
    videoElement: {},
    onGesture: (gesture) => gestures.push(gesture),
    HandsCtor,
    CameraCtor
  });

  assert.equal(typeof session.stop, "function");
  assert.deepEqual(gestures, ["NONE"]);
});
