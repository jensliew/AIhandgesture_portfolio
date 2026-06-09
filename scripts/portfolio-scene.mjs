const BROWSE_PRESET = {
  particleCount: 1400,
  ringCount: 4,
  lineCount: 12,
  nodeCount: 10,
  directoryDepth: 1,
  stageFloat: true
};

const DETAIL_PRESET = {
  particleCount: 700,
  ringCount: 2,
  lineCount: 8,
  nodeCount: 6,
  directoryDepth: 0.35,
  stageFloat: false
};

const REDUCED_MOTION_PRESET = {
  particleCount: 0,
  ringCount: 0,
  lineCount: 0,
  nodeCount: 0,
  directoryDepth: 0,
  stageFloat: false
};

const noopStage = {
  syncActiveRecord() {},
  startGestureDrag() {},
  updateGestureDrag() {},
  endGestureDrag() {},
  enterDetail() {},
  exitDetail() {},
  destroy() {}
};

export function computeGestureDragRotation({ startRotation, startPalmX, palmX, sensitivity = 4 }) {
  return startRotation - (palmX - startPalmX) * sensitivity;
}

export function computeManualSwipeRotation({ currentRotation, delta, sensitivity = 0.0025 }) {
  if (!Number.isFinite(currentRotation) || !Number.isFinite(delta)) {
    return currentRotation;
  }

  return currentRotation - delta * sensitivity;
}

function disposeMaterial(material) {
  if (!material) {
    return;
  }

  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  material.dispose?.();
}

function disposeObject3D(object) {
  object?.traverse?.((node) => {
    node.geometry?.dispose?.();
    disposeMaterial(node.material);
  });
}

export function getScenePreset({ mode, reducedMotion }) {
  if (reducedMotion) {
    return { ...REDUCED_MOTION_PRESET };
  }

  if (mode === "project-detail") {
    return { ...DETAIL_PRESET };
  }

  return { ...BROWSE_PRESET };
}

async function loadSceneRuntime() {
  const [THREE, css3dModule] = await Promise.all([
    import("three"),
    import("three/addons/renderers/CSS3DRenderer.js")
  ]);

  return {
    THREE,
    CSS3DObject: css3dModule.CSS3DObject,
    CSS3DRenderer: css3dModule.CSS3DRenderer
  };
}

function tween(target, vars) {
  if (typeof window !== "undefined" && window.gsap?.to) {
    return window.gsap.to(target, vars);
  }

  Object.assign(target, Object.fromEntries(Object.entries(vars).filter(([key]) => !["duration", "ease", "delay", "onUpdate", "onComplete"].includes(key))));
  vars.onUpdate?.();
  vars.onComplete?.();
  return null;
}

function createCardElement(record, { isActive, onActivate, onOpenDetail }) {
  const element = document.createElement("article");
  element.className = `portfolio-card${isActive ? " active" : ""}`;
  element.tabIndex = 0;
  element.role = "button";
  element.setAttribute("aria-label", record.title);
  element.innerHTML = `
    <div class="card-watermark">${record.indexStr}</div>
    <div class="card-cover" style="background-image: url('${record.cover}')"></div>
    <div class="card-body">
      <div class="card-title">${record.title}</div>
      <div class="card-brief">${record.brief}</div>
    </div>
  `;

  const handleActivate = () => {
    if (element.classList.contains("active")) {
      onOpenDetail(record.id);
      return;
    }

    onActivate(record.id);
  };

  element.addEventListener("click", handleActivate);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  });

  return element;
}

function createParticles(THREE, count) {
  if (count <= 0) {
    return null;
  }

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 4200;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 3200;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 3200;

    const useRose = Math.random() > 0.5;
    colors[index * 3] = useRose ? 1 : 0.39;
    colors[index * 3 + 1] = useRose ? 0.55 : 0.88;
    colors[index * 3 + 2] = useRose ? 0.66 : 1;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 4,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
  );
}

function createRings(THREE, count) {
  const group = new THREE.Group();

  for (let index = 0; index < count; index += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(95 + Math.random() * 110, 1.1, 16, 64),
      new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? 0xff8ca8 : 0x63e0ff,
        transparent: true,
        opacity: 0.2 + Math.random() * 0.15
      })
    );
    ring.position.set((Math.random() - 0.5) * 1800, (Math.random() - 0.5) * 1100, (Math.random() - 0.5) * 1200);
    ring.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    ring.userData = {
      axis: Math.random() > 0.5 ? "x" : "z",
      speed: 0.35 + Math.random() * 0.45
    };
    group.add(ring);
  }

  return group;
}

function createLines(THREE, count) {
  const group = new THREE.Group();

  for (let index = 0; index < count; index += 1) {
    const startX = (Math.random() - 0.5) * 1800;
    const startY = (Math.random() - 0.5) * 1100;
    const startZ = (Math.random() - 0.5) * 1200;
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(startX + (Math.random() - 0.5) * 350, startY + (Math.random() - 0.5) * 350, startZ + (Math.random() - 0.5) * 350),
        new THREE.Vector3(startX + (Math.random() - 0.5) * 700, startY + (Math.random() - 0.5) * 700, startZ + (Math.random() - 0.5) * 700)
      ]),
      new THREE.LineBasicMaterial({
        color: index % 2 === 0 ? 0xff8ca8 : 0x63e0ff,
        transparent: true,
        opacity: 0.12 + Math.random() * 0.08,
        blending: THREE.AdditiveBlending
      })
    );
    group.add(line);
  }

  return group;
}

function createNodes(THREE, count) {
  const group = new THREE.Group();

  for (let index = 0; index < count; index += 1) {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(4 + Math.random() * 4, 12, 12),
      new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? 0x63e0ff : 0xff8ca8,
        transparent: true,
        opacity: 0.55 + Math.random() * 0.2
      })
    );
    node.position.set((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 1300, (Math.random() - 0.5) * 1400);
    node.userData = {
      baseY: node.position.y,
      speed: 0.55 + Math.random() * 0.7,
      offset: Math.random() * Math.PI * 2
    };
    group.add(node);
  }

  return group;
}

function createHexFrames(THREE, count) {
  const group = new THREE.Group();

  for (let index = 0; index < count; index += 1) {
    const hex = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CircleGeometry(55 + Math.random() * 55, 6)),
      new THREE.LineBasicMaterial({
        color: index % 2 === 0 ? 0xff8ca8 : 0x63e0ff,
        transparent: true,
        opacity: 0.18
      })
    );
    hex.position.set((Math.random() - 0.5) * 1700, (Math.random() - 0.5) * 1100, (Math.random() - 0.5) * 1100);
    hex.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    hex.userData = { rotSpeed: 0.0015 + Math.random() * 0.0015 };
    group.add(hex);
  }

  return group;
}

export async function createSceneStage({ mountEls, records, onSelect, onOpenDetail, reducedMotion = false, mode = "browse" }) {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !mountEls?.webgl ||
    !mountEls?.css3d ||
    !Array.isArray(records) ||
    records.length === 0
  ) {
    return noopStage;
  }

  const { THREE, CSS3DObject, CSS3DRenderer } = await loadSceneRuntime();
  const gsap = window.gsap;
  const preset = getScenePreset({ mode, reducedMotion });
  const radius = 700;
  const anglePerCard = (Math.PI * 2) / records.length;
  let activeIndex = 0;
  let isDetailMode = mode === "project-detail";
  let animationFrameId = 0;
  let destroyed = false;
  let gestureDrag = null;
  let touchDrag = null;
  let wheelSnapTimeout = 0;
  const interactionSurface = mountEls.webgl.closest(".lab-showcase-stage") ?? mountEls.webgl;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x090b11, reducedMotion ? 0.00055 : 0.00038);

  const camera = new THREE.PerspectiveCamera(45, mountEls.webgl.clientWidth / mountEls.webgl.clientHeight, 1, 5000);
  camera.position.z = isDetailMode ? 620 : 1500;

  const glRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  glRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  glRenderer.setSize(mountEls.webgl.clientWidth, mountEls.webgl.clientHeight);
  mountEls.webgl.replaceChildren(glRenderer.domElement);

  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(mountEls.css3d.clientWidth, mountEls.css3d.clientHeight);
  mountEls.css3d.replaceChildren(cssRenderer.domElement);

  const carouselGroup = new THREE.Group();
  scene.add(carouselGroup);

  const cssObjects = records.map((record, index) => {
    const element = createCardElement(record, {
      isActive: index === activeIndex,
      onActivate: onSelect,
      onOpenDetail: onOpenDetail
    });
    const cssObject = new CSS3DObject(element);
    carouselGroup.add(cssObject);
    return cssObject;
  });

  const particleSystem = createParticles(THREE, preset.particleCount);
  if (particleSystem) {
    scene.add(particleSystem);
  }

  const gridNear = new THREE.GridHelper(3200, 32, 0xff8ca8, 0x1f2a44);
  gridNear.position.y = -520;
  gridNear.material.opacity = reducedMotion ? 0.12 : 0.28;
  gridNear.material.transparent = true;
  scene.add(gridNear);

  const gridFar = new THREE.GridHelper(3200, 64, 0x63e0ff, 0x111827);
  gridFar.position.y = -520;
  gridFar.material.opacity = reducedMotion ? 0.08 : 0.18;
  gridFar.material.transparent = true;
  scene.add(gridFar);

  const ringGroup = createRings(THREE, preset.ringCount);
  const lineGroup = createLines(THREE, preset.lineCount);
  const nodeGroup = createNodes(THREE, preset.nodeCount);
  const hexGroup = createHexFrames(THREE, reducedMotion ? 0 : mode === "project-detail" ? 2 : 4);

  scene.add(ringGroup);
  scene.add(lineGroup);
  scene.add(nodeGroup);
  scene.add(hexGroup);

  function positionCards(currentPreset) {
    const depthRadius = radius * currentPreset.directoryDepth;

    cssObjects.forEach((cssObject, index) => {
      const angle = index * anglePerCard;
      cssObject.position.x = Math.sin(angle) * radius;
      cssObject.position.z = Math.cos(angle) * depthRadius;
      cssObject.position.y = 0;
      cssObject.rotation.y = Math.atan2(cssObject.position.x, cssObject.position.z || 0.0001);
    });
  }

  function updateActiveCardStyle() {
    cssObjects.forEach((cssObject, index) => {
      cssObject.element.classList.toggle("active", index === activeIndex);
    });
  }

  function getIndexFromRotation(rotation) {
    const rawIndex = Math.round(-rotation / anglePerCard);
    return ((rawIndex % records.length) + records.length) % records.length;
  }

  function syncActiveRecord(activeId) {
    const nextIndex = records.findIndex((record) => record.id === activeId);
    activeIndex = nextIndex >= 0 ? nextIndex : 0;
    updateActiveCardStyle();

    const targetRotation = -activeIndex * anglePerCard;
    const currentRotation = carouselGroup.rotation.y;
    const rotationDelta = Math.atan2(Math.sin(targetRotation - currentRotation), Math.cos(targetRotation - currentRotation));

    tween(carouselGroup.rotation, {
      y: currentRotation + rotationDelta,
      duration: gsap ? 0.75 : 0,
      ease: "power3.out"
    });
  }

  function startGestureDrag(palmX) {
    if (isDetailMode || !Number.isFinite(palmX)) {
      return;
    }

    window.gsap?.killTweensOf?.(carouselGroup.rotation);
    gestureDrag = {
      startPalmX: palmX,
      startRotation: carouselGroup.rotation.y
    };
  }

  function updateGestureDrag(palmX) {
    if (isDetailMode || !Number.isFinite(palmX)) {
      return;
    }

    if (!gestureDrag) {
      startGestureDrag(palmX);
    }

    carouselGroup.rotation.y = computeGestureDragRotation({
      startRotation: gestureDrag.startRotation,
      startPalmX: gestureDrag.startPalmX,
      palmX
    });
    activeIndex = getIndexFromRotation(carouselGroup.rotation.y);
    updateActiveCardStyle();
  }

  function endGestureDrag() {
    if (!gestureDrag) {
      return;
    }

    gestureDrag = null;
    activeIndex = getIndexFromRotation(carouselGroup.rotation.y);
    const activeRecord = records[activeIndex];

    if (activeRecord) {
      if (onSelect) {
        onSelect(activeRecord.id);
      } else {
        syncActiveRecord(activeRecord.id);
      }
    }
  }

  function snapToCurrentManualIndex() {
    if (isDetailMode) {
      return;
    }

    activeIndex = getIndexFromRotation(carouselGroup.rotation.y);
    const activeRecord = records[activeIndex];

    if (activeRecord) {
      syncActiveRecord(activeRecord.id);
      onSelect?.(activeRecord.id);
    }
  }

  function applyManualSwipe(delta, sensitivity) {
    if (isDetailMode || !Number.isFinite(delta)) {
      return;
    }

    window.gsap?.killTweensOf?.(carouselGroup.rotation);
    carouselGroup.rotation.y = computeManualSwipeRotation({
      currentRotation: carouselGroup.rotation.y,
      delta,
      sensitivity
    });
  }

  function scheduleManualSnap() {
    window.clearTimeout(wheelSnapTimeout);
    wheelSnapTimeout = window.setTimeout(snapToCurrentManualIndex, 140);
  }

  function handleWheel(event) {
    if (isDetailMode) {
      return;
    }

    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (!Number.isFinite(dominantDelta) || Math.abs(dominantDelta) < 1) {
      return;
    }

    event.preventDefault();
    applyManualSwipe(dominantDelta, 0.0025);
    scheduleManualSnap();
  }

  function handleTouchStart(event) {
    if (isDetailMode || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    touchDrag = {
      x: touch.clientX,
      y: touch.clientY,
      isHorizontal: false
    };
    window.gsap?.killTweensOf?.(carouselGroup.rotation);
  }

  function handleTouchMove(event) {
    if (isDetailMode || !touchDrag || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchDrag.x;
    const deltaY = touch.clientY - touchDrag.y;

    if (!touchDrag.isHorizontal && Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
      return;
    }

    touchDrag.isHorizontal = touchDrag.isHorizontal || Math.abs(deltaX) > Math.abs(deltaY) * 1.1;

    if (!touchDrag.isHorizontal) {
      return;
    }

    event.preventDefault();
    applyManualSwipe(-deltaX, 0.006);
    touchDrag.x = touch.clientX;
    touchDrag.y = touch.clientY;
  }

  function handleTouchEnd() {
    if (!touchDrag) {
      return;
    }

    const shouldSnap = touchDrag.isHorizontal;
    touchDrag = null;

    if (shouldSnap) {
      snapToCurrentManualIndex();
    }
  }

  function enterDetail() {
    isDetailMode = true;
    gestureDrag = null;
    tween(camera.position, {
      z: 620,
      duration: gsap ? 0.6 : 0,
      ease: "power2.out"
    });
  }

  function exitDetail() {
    isDetailMode = false;
    tween(camera.position, {
      z: 1500,
      duration: gsap ? 0.7 : 0,
      ease: "power2.out"
    });
  }

  function handleResize() {
    const width = mountEls.webgl.clientWidth;
    const height = mountEls.webgl.clientHeight;

    if (!width || !height) {
      return;
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    glRenderer.setSize(width, height);
    cssRenderer.setSize(width, height);
  }

  const clock = new THREE.Clock();

  function animate() {
    if (destroyed) {
      return;
    }

    animationFrameId = window.requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    if (particleSystem) {
      particleSystem.rotation.y -= 0.00018;
      particleSystem.rotation.x = reducedMotion ? 0 : Math.sin(time * 0.1) * 0.02;
      particleSystem.position.y = preset.stageFloat && !isDetailMode ? Math.sin(time * 0.22) * 14 : 0;
    }

    ringGroup.children.forEach((ring) => {
      if (ring.userData.axis === "x") {
        ring.rotation.x += 0.0018 * ring.userData.speed;
      } else {
        ring.rotation.z += 0.0018 * ring.userData.speed;
      }

      ring.rotation.y += 0.0009;
    });

    nodeGroup.children.forEach((node) => {
      node.position.y = node.userData.baseY + Math.sin(time * node.userData.speed + node.userData.offset) * (reducedMotion ? 8 : 28);
      const scalar = reducedMotion ? 0.9 : 0.7 + Math.sin(time * 2 + node.userData.offset) * 0.22;
      node.scale.setScalar(scalar);
    });

    hexGroup.children.forEach((hex) => {
      hex.rotation.z += hex.userData.rotSpeed;
      hex.rotation.y += hex.userData.rotSpeed * 0.5;
    });

    if (preset.stageFloat && !isDetailMode) {
      carouselGroup.position.y = Math.sin(time * 0.8) * 10;
    } else {
      carouselGroup.position.y += (0 - carouselGroup.position.y) * 0.14;
    }

    glRenderer.render(scene, camera);
    cssRenderer.render(scene, camera);
  }

  positionCards(preset);
  syncActiveRecord(records[activeIndex]?.id);
  window.addEventListener("resize", handleResize);
  interactionSurface.addEventListener("wheel", handleWheel, { passive: false });
  interactionSurface.addEventListener("touchstart", handleTouchStart, { passive: true });
  interactionSurface.addEventListener("touchmove", handleTouchMove, { passive: false });
  interactionSurface.addEventListener("touchend", handleTouchEnd);
  interactionSurface.addEventListener("touchcancel", handleTouchEnd);
  animate();

  return {
    syncActiveRecord,
    startGestureDrag,
    updateGestureDrag,
    endGestureDrag,
    enterDetail,
    exitDetail,
    destroy() {
      if (destroyed) {
        return;
      }

      destroyed = true;
      window.clearTimeout(wheelSnapTimeout);
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      interactionSurface.removeEventListener("wheel", handleWheel);
      interactionSurface.removeEventListener("touchstart", handleTouchStart);
      interactionSurface.removeEventListener("touchmove", handleTouchMove);
      interactionSurface.removeEventListener("touchend", handleTouchEnd);
      interactionSurface.removeEventListener("touchcancel", handleTouchEnd);
      [particleSystem, gridNear, gridFar, ringGroup, lineGroup, nodeGroup, hexGroup].forEach(disposeObject3D);
      glRenderer.dispose();
      glRenderer.forceContextLoss?.();
      mountEls.webgl.replaceChildren();
      mountEls.css3d.replaceChildren();
    }
  };
}
