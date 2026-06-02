const normalizeBrief = (brief) => brief.replace(/<br\s*\/?>/gi, " ");

export function buildShellMarkup({ state, records, copy }) {
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
