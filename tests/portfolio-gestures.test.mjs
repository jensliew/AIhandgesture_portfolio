import test from "node:test";
import assert from "node:assert/strict";

import { classifyGesture, getCameraStatusMessage, startGestureSession } from "../scripts/portfolio-gestures.mjs";

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
