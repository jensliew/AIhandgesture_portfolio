const normalizeBrief = (brief) => brief.replace(/<br\s*\/?>/gi, " ");

export function buildShellMarkup({ state, records, copy }) {
  const activeRecord = records.find((record) => record.id === state.projects.activeId) ?? null;
  const directoryItems = records
    .map(
      (record) => `
    <button class="lab-directory-item${record.id === state.projects.activeId ? " is-active" : ""}" data-action="project/select" data-project-id="${record.id}">
      <span class="lab-directory-index">${record.indexStr}</span>
      <span class="lab-directory-copy">
        <strong>${record.title}</strong>
        <small>${normalizeBrief(record.brief)}</small>
      </span>
    </button>
  `
    )
    .join("");

  return `
    <div class="lab-shell">
      <aside class="lab-identity-rail" data-panel="identity-rail">
        <p class="lab-eyebrow">${copy.eyebrow}</p>
        <div class="lab-identity-body">
          <p class="lab-manual-mode">${copy.browseMode}</p>
          <h1 class="lab-title">${activeRecord?.title ?? ""}</h1>
          <p class="lab-intro">${activeRecord ? normalizeBrief(activeRecord.brief) : ""}</p>
        </div>
        <button class="lab-dossier-trigger" data-action="detail/open">Open dossier</button>
      </aside>
      <main class="lab-showcase-stage" data-panel="showcase-stage">
        <div id="webgl-container" aria-hidden="true"></div>
        <div id="css3d-container" aria-hidden="true"></div>
        <div class="lab-stage-overlay"></div>
      </main>
      <aside class="lab-directory-rail" data-panel="project-directory">
        <button class="lab-gesture-toggle" data-action="camera/request">${copy.enableGesture}</button>
        <div class="lab-directory-list">${directoryItems}</div>
      </aside>
    </div>
    <section id="lab-detail-root"></section>
    <section id="lab-support-root"></section>
  `;
}

export function buildDetailMarkup({ state, activeRecord }) {
  if (!state.detail.isOpen || !activeRecord) {
    return "";
  }

  return `
    <section class="lab-dossier" aria-label="${activeRecord.title}">
      <button class="lab-dossier-close" data-action="detail/close">Close</button>
      <div class="lab-dossier-body">${activeRecord.details}</div>
    </section>
  `;
}
