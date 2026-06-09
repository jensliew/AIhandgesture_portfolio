import { defaultLanguage } from "./portfolio-data.mjs";

const DEFAULT_GESTURE_COOLDOWN_MS = 900;
const DRAG_THRESHOLD_X = 0.12;

function getAdjacentRecordId(recordIds, activeId, offset) {
  if (!Array.isArray(recordIds) || recordIds.length === 0) {
    return activeId;
  }

  const activeIndex = recordIds.indexOf(activeId);
  const currentIndex = activeIndex >= 0 ? activeIndex : 0;
  const nextIndex = (currentIndex + offset + recordIds.length) % recordIds.length;
  return recordIds[nextIndex];
}

function reduceGestureAction(state, payload = {}) {
  const now = payload.now ?? Date.now();
  const cooldownMs = state.gesture?.cooldownMs ?? DEFAULT_GESTURE_COOLDOWN_MS;
  const palmX = Number.isFinite(payload.palm?.x) ? payload.palm.x : null;
  const nextGestureBase = {
    ...state.gesture,
    lastGesture: payload.gesture ?? "NONE",
    lastPalm: payload.palm ?? state.gesture?.lastPalm ?? null,
    cooldownMs
  };

  if (payload.gesture === "OPEN" && palmX !== null && state.mode !== "project-detail") {
    if (!state.gesture?.dragging || !Number.isFinite(state.gesture?.dragStartX)) {
      return {
        ...state,
        gesture: {
          ...nextGestureBase,
          dragging: true,
          dragStartX: palmX
        }
      };
    }

    return {
      ...state,
      gesture: {
        ...nextGestureBase,
        dragging: true,
        dragStartX: state.gesture.dragStartX
      },
      detail: { ...state.detail, isOpen: false },
      mode: "browse"
    };
  }

  const releasedGestureState = {
    ...nextGestureBase,
    dragging: false,
    dragStartX: null
  };

  if ((payload.gesture === "OPEN" || payload.gesture === "ZOOM") && state.mode === "project-detail") {
    return {
      ...state,
      gesture: releasedGestureState
    };
  }

  if (now - (state.gesture?.lastActionAt ?? 0) < cooldownMs) {
    return {
      ...state,
      gesture: releasedGestureState
    };
  }

  const nextGestureState = { ...releasedGestureState, lastActionAt: now };

  switch (payload.gesture) {
    case "OPEN":
      return {
        ...state,
        gesture: nextGestureState
      };
    case "FIST":
      return {
        ...state,
        gesture: nextGestureState
      };
    case "ZOOM":
      return {
        ...state,
        gesture: nextGestureState,
        detail: { ...state.detail, isOpen: true },
        mode: "project-detail"
      };
    case "PINCH":
      return {
        ...state,
        gesture: nextGestureState,
        detail: { ...state.detail, isOpen: false },
        mode: "browse"
      };
    default:
      return state;
  }
}

export function createInitialState(records) {
  return {
    mode: "browse",
    language: defaultLanguage,
    helpOpen: false,
    camera: { status: "idle", enabled: false },
    gesture: {
      lastActionAt: 0,
      cooldownMs: DEFAULT_GESTURE_COOLDOWN_MS,
      dragging: false,
      dragStartX: null,
      lastGesture: "NONE",
      lastPalm: null
    },
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
      return { ...state, detail: { ...state.detail, isOpen: true }, mode: "project-detail" };
    case "detail/close":
      return { ...state, detail: { ...state.detail, isOpen: false }, mode: "browse" };
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
    case "gesture/apply":
      return reduceGestureAction(state, action.payload);
    default:
      return state;
  }
}
