import { defaultLanguage } from "./portfolio-data.mjs";

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
    default:
      return state;
  }
}
