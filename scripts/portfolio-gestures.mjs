const CAMERA_STATUS_MESSAGES = {
  en: {
    denied: "Camera access was denied. Continue browsing manually or try enabling gesture mode again.",
    unavailable: "Camera hardware is unavailable. The portfolio is still fully browseable without gesture mode."
  },
  cn: {
    denied: "相机权限被拒绝。你仍可继续手动浏览，或稍后再次启用手势模式。",
    unavailable: "当前无法使用相机设备。你仍可完整手动浏览作品集。"
  }
};

export function getDistance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
}

export function classifyGesture(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 21) {
    return "NONE";
  }

  const wrist = landmarks[0];

  if (!wrist) {
    return "NONE";
  }

  const isExtended = (tip, mcp) => {
    if (!landmarks[tip] || !landmarks[mcp]) {
      return false;
    }

    return getDistance(landmarks[tip], wrist) > getDistance(landmarks[mcp], wrist) * 1.15;
  };
  const openFingers = [isExtended(8, 5), isExtended(12, 9), isExtended(16, 13), isExtended(20, 17)].filter(Boolean).length;

  if (!landmarks[4] || !landmarks[8]) {
    return "NONE";
  }

  const pinchDistance = getDistance(landmarks[4], landmarks[8]);

  if (openFingers >= 3) {
    return "OPEN";
  }

  if (openFingers === 0 && pinchDistance >= 0.05) {
    return "FIST";
  }

  if (openFingers <= 1 && pinchDistance > 0.12) {
    return "ZOOM";
  }

  if (openFingers <= 1 && pinchDistance < 0.05) {
    return "PINCH";
  }

  return "NONE";
}

export function getCameraStatusMessage(status, language = "en") {
  const messages = CAMERA_STATUS_MESSAGES[language] ?? CAMERA_STATUS_MESSAGES.en;
  return messages[status] ?? CAMERA_STATUS_MESSAGES.en[status] ?? "";
}

function getUnavailableSession(onStatus) {
  onStatus?.("unavailable");
  return null;
}

function getCameraFailureStatus(error) {
  return error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError" || error?.name === "SecurityError"
    ? "denied"
    : "unavailable";
}

export async function startGestureSession({
  videoElement,
  onGesture,
  onStatus,
  HandsCtor = globalThis.Hands,
  CameraCtor = globalThis.Camera
} = {}) {
  if (!videoElement || typeof HandsCtor !== "function" || typeof CameraCtor !== "function") {
    return getUnavailableSession(onStatus);
  }

  try {
    const hands = new HandsCtor({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions?.({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    hands.onResults?.((results) => {
      const landmarks = results?.multiHandLandmarks?.[0];

      if (!landmarks) {
        return;
      }

      onGesture?.(classifyGesture(landmarks), results);
    });

    const camera = new CameraCtor(videoElement, {
      width: 1280,
      height: 720,
      onFrame: async () => {
        await hands.send?.({ image: videoElement });
      }
    });

    try {
      await camera.start?.();
    } catch (error) {
      onStatus?.(getCameraFailureStatus(error));
      return null;
    }

    onStatus?.("ready");

    return {
      stop() {
        camera.stop?.();

        const tracks = videoElement.srcObject?.getTracks?.() ?? [];
        for (const track of tracks) {
          track.stop();
        }

        if ("srcObject" in videoElement) {
          videoElement.srcObject = null;
        }

        hands.close?.();
      }
    };
  } catch (error) {
    onStatus?.(getCameraFailureStatus(error));
    return null;
  }
}
