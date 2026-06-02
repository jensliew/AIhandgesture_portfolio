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
    detailRoot.innerHTML = buildDetailMarkup({ state, activeRecord, copy });
  }
}

if (root) {
  render();

  root.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) {
      return;
    }

    if (actionEl.dataset.action === "project/select") {
      state = reduceAppState(state, {
        type: "project/select",
        payload: Number(actionEl.dataset.projectId)
      });
    }

    if (actionEl.dataset.action === "detail/open") {
      state = reduceAppState(state, { type: "detail/open" });
    }

    if (actionEl.dataset.action === "detail/close") {
      state = reduceAppState(state, { type: "detail/close" });
    }

    render();
  });
}
