import { portfolioRecords, uiCopy } from "./portfolio-data.mjs";
import { createInitialState } from "./portfolio-state.mjs";
import { buildShellMarkup } from "./portfolio-render.mjs";

const appRoot = document.querySelector("#lab-app");

if (appRoot) {
  const state = createInitialState(portfolioRecords);
  const copy = uiCopy[state.language] ?? uiCopy.en;

  appRoot.innerHTML = buildShellMarkup({ state, records: portfolioRecords, copy });
}
