import test from "node:test";
import assert from "node:assert/strict";

import { portfolioRecords, uiCopy } from "../scripts/portfolio-data.mjs";
import { createInitialState } from "../scripts/portfolio-state.mjs";
import { buildDetailMarkup, buildShellMarkup } from "../scripts/portfolio-render.mjs";

test("buildShellMarkup includes the three-panel lab structure", () => {
  const state = createInitialState(portfolioRecords);
  const html = buildShellMarkup({ state, records: portfolioRecords, copy: uiCopy.en });

  assert.match(html, /data-panel="identity-rail"/);
  assert.match(html, /data-panel="showcase-stage"/);
  assert.match(html, /data-panel="project-directory"/);
  assert.match(html, /Enable gesture mode/);
  assert.match(html, /<div class="lab-directory-list">[\s\S]*data-project-id="0"[\s\S]*data-project-id="1"[\s\S]*data-project-id="2"[\s\S]*data-project-id="3"[\s\S]*data-project-id="4"[\s\S]*data-project-id="5"[\s\S]*<\/div>/);
  assert.match(html, /<button class="lab-directory-item is-active" data-action="project\/select" data-project-id="0">/);
  assert.match(html, /<div id="webgl-container" aria-hidden="true"><\/div>/);
  assert.match(html, /<div id="css3d-container" aria-hidden="true"><\/div>/);
  assert.match(html, /<section id="lab-detail-root"><\/section>/);
  assert.match(html, /<section id="lab-support-root"><\/section>/);
  assert.match(html, />Open dossier<\/button>/);
});

test("buildDetailMarkup renders the current project title, manual close control, and hero from cover", () => {
  const state = { ...createInitialState(portfolioRecords), detail: { isOpen: true } };
  const html = buildDetailMarkup({ state, activeRecord: portfolioRecords[0] });

  assert.match(html, /Liew Shen Wei/);
  assert.match(html, /data-action="detail\/close"/);
  assert.match(html, /class="lab-dossier-hero" style="background-image:url\('\.\/images\/profile\.png'\)"/);
  assert.match(html, /class="detail-hero"/);
  assert.match(html, /class="detail-content-wrap"/);
  assert.match(html, />Close<\/button>/);
});

test("buildShellMarkup shows browse-first camera guidance without blocking manual navigation", () => {
  const state = {
    ...createInitialState(portfolioRecords),
    camera: { status: "denied", enabled: false }
  };
  const html = buildShellMarkup({
    state,
    records: portfolioRecords,
    copy: uiCopy.en,
    cameraMessage:
      "Camera access was denied. Continue browsing manually or try enabling gesture mode again."
  });

  assert.match(html, /class="lab-camera-panel"/);
  assert.match(html, /data-camera-status="denied"/);
  assert.match(html, /Camera access was denied/);
  assert.match(html, /data-action="camera\/request"/);
  assert.match(html, /Browse manually/);
});
