const normalizeBrief = (brief) => brief.replace(/<br\s*\/?>/gi, " ");
const gestureTokens = ["OPEN", "FIST", "ZOOM", "PINCH"];

function getGestureButtonLabel(state, copy) {
  return state.camera.enabled ? copy.disableGesture : copy.enableGesture;
}

export function buildShellMarkup({ state, records, copy, cameraMessage = "" }) {
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
  const cameraPanelClass = state.camera.status === "requesting" ? "lab-camera-panel is-pending" : "lab-camera-panel";
  const shellClass = state.detail.isOpen ? "lab-shell is-detail-open" : "lab-shell";

  return `
    <div class="${shellClass}">
      <aside class="lab-identity-rail" data-panel="identity-rail">
        <p class="lab-eyebrow">${copy.eyebrow}</p>
        <div class="lab-identity-body">
          <p class="lab-manual-mode">${copy.browseMode}</p>
          <h1 class="lab-title">${activeRecord?.title ?? ""}</h1>
          <p class="lab-intro">${activeRecord ? normalizeBrief(activeRecord.brief) : ""}</p>
          <button class="lab-dossier-trigger" data-action="detail/open">
            <span>${copy.viewDetails ?? "View details"}</span>
            <small>${copy.viewDetailsHint ?? "Open the selected project"}</small>
          </button>
        </div>
      </aside>
      <main class="lab-showcase-stage" data-panel="showcase-stage">
        <div id="webgl-container" aria-hidden="true"></div>
        <div id="css3d-container" aria-hidden="true"></div>
        <div class="lab-stage-overlay"></div>
      </main>
      <aside class="lab-directory-rail" data-panel="project-directory">
        <button class="lab-gesture-toggle" data-action="camera/request"${state.camera.status === "requesting" ? " disabled" : ""}>${getGestureButtonLabel(state, copy)}</button>
        <section class="${cameraPanelClass}" aria-live="polite" data-camera-status="${state.camera.status}">
          <strong>${copy.permissionTitle}</strong>
          <p>${cameraMessage}</p>
        </section>
        <div class="lab-directory-list">${directoryItems}</div>
      </aside>
    </div>
    <section id="lab-detail-root"></section>
    <section id="lab-support-root"></section>
  `;
}

export function buildDetailMarkup({ state, activeRecord, copy = {} }) {
  if (!state.detail.isOpen || !activeRecord) {
    return "";
  }

  return `
    <section class="lab-dossier" aria-label="${activeRecord.title}">
      <button class="lab-dossier-close" data-action="detail/close">${copy.backToBrowse ?? "Back"}</button>
      <div class="lab-dossier-hero" style="background-image:url('${activeRecord.cover}')"></div>
      <div class="lab-dossier-body">${activeRecord.details}</div>
    </section>
  `;
}

export function buildSupportMarkup({ state, copy, cameraMessage = "" }) {
  const gestureItems = (copy.gestureInstructions ?? [])
    .map(
      (item, index) => `
        <li>
          <span>${gestureTokens[index] ?? ""}</span>
          <strong>${item.command}</strong>
          <small>${item.description}</small>
        </li>
      `
    )
    .join("");

  return `
    <aside class="lab-language-dock" aria-label="Language">
      <span>Language</span>
      <div class="lab-language-switcher">
        <button class="${state.language === "en" ? "is-active" : ""}" data-action="language/set" data-language="en">EN</button>
        <button class="${state.language === "cn" ? "is-active" : ""}" data-action="language/set" data-language="cn">中文</button>
      </div>
    </aside>
    <aside class="lab-support-drawer${state.helpOpen ? " is-open" : ""}" aria-label="${copy.helpTitle}">
      <button class="lab-support-toggle" data-action="help/toggle" aria-expanded="${state.helpOpen ? "true" : "false"}">
        <span>${copy.helpHint ?? copy.helpTitle}</span>
        <strong>${copy.helpTitle}</strong>
      </button>
      <div class="lab-support-panel">
        <div class="lab-support-panel-header">
          <strong>${copy.helpTitle}</strong>
          <button class="lab-support-close" data-action="help/toggle" aria-label="Close gesture controls">×</button>
        </div>
        <p class="lab-support-status">${cameraMessage}</p>
        <ul class="lab-support-gesture-list">${gestureItems}</ul>
      </div>
    </aside>
  `;
}
