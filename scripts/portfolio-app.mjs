import { portfolioRecords, uiCopy } from "./portfolio-data.mjs";
import { createInitialState, reduceAppState } from "./portfolio-state.mjs";
import { buildDetailMarkup, buildShellMarkup } from "./portfolio-render.mjs";

const root = document.querySelector("#lab-app");
let state = createInitialState(portfolioRecords);

function render() {
  if (!root) {
    return;
  }

  const copy = uiCopy[state.language] ?? uiCopy.en;
  const activeRecord = portfolioRecords.find((record) => record.id === state.projects.activeId) ?? null;

  root.innerHTML = buildShellMarkup({ state, records: portfolioRecords, copy });
  const detailRoot = root.querySelector("#lab-detail-root");

  if (detailRoot) {
    detailRoot.innerHTML = buildDetailMarkup({ state, activeRecord });
  }
}

if (root) {
  render();

  root.addEventListener("click", (event) => {
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
    } else {
      return;
    }

    state = nextState;
    render();
  });
}
