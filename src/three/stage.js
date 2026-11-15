import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Initializes the Three.js 3D Presentation Stage.
 * Supports:
 *  1) Real card artwork mapped onto beveled 3D metallic cards
 *  2) External .glb / .gltf 3D models (e.g. from itch.io/game-assets/tag-3d)
 *  3) Per-slide GSAP choreography & cursor parallax
 */
export function initThreeStage({
  canvasId = "webgl-3d",
  cards = [],
  slidePoses = [],
  optionalGltfModel = null,
} = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Studio Lighting
  scene.add(new THREE.HemisphereLight(0x6ee7b7, 0x061818, 1.4));

  const keyLight = new THREE.DirectionalLight(0xfff5d6, 3.0);
  keyLight.position.set(4, 5, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x34d399, 2.2);
  rimLight.position.set(-5, -3, 3);
  scene.add(rimLight);

  const goldSpot = new THREE.PointLight(0xf3e5ab, 18, 25);
  goldSpot.position.set(2.5, 2.0, 4.5);
  scene.add(goldSpot);

  // Geometry Helpers
  function createRoundedShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }

  function createRoundedSlab(w, h, r, depth) {
    const geo = new THREE.ExtrudeGeometry(createRoundedShape(w, h, r), {
      depth,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.022,
      bevelThickness: 0.022,
    });
    geo.center();
    return geo;
  }

  function createUVCardFace(w, h, r) {
    const geo = new THREE.ShapeGeometry(createRoundedShape(w, h, r), 24);
    const pos = geo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uvs[i * 2] = (pos.getX(i) + w / 2) / w;
      uvs[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    return geo;
  }

  const textureLoader = new THREE.TextureLoader();

  function createTextured3DCard(imageUrl, edgeColorHex = 0x1e293b) {
    const group = new THREE.Group();
    const w = 3.35;
    const h = 2.11;
    const r = 0.15;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: edgeColorHex,
      metalness: 0.85,
      roughness: 0.25,
    });
    group.add(new THREE.Mesh(createRoundedSlab(w, h, r, 0.045), bodyMat));

    const tex = textureLoader.load(imageUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;

    const faceMat = new THREE.MeshStandardMaterial({
      map: tex,
      metalness: 0.22,
      roughness: 0.28,
      transparent: true,
    });
    const faceMesh = new THREE.Mesh(
      createUVCardFace(w + 0.02, h + 0.02, r),
      faceMat
    );
    faceMesh.position.z = 0.046;
    group.add(faceMesh);

    return group;
  }

  const cardStage = new THREE.Group();
  scene.add(cardStage);

  const cardObjects = {};
  cards.forEach((cfg) => {
    const obj = createTextured3DCard(cfg.image, cfg.edgeColor);
    cardObjects[cfg.id] = obj;
    cardStage.add(obj);
  });

  // Optional .glb / .gltf Model Loader (for itch.io 3D game assets)
  if (optionalGltfModel && optionalGltfModel.url) {
    const loader = new GLTFLoader();
    loader.load(optionalGltfModel.url, (gltf) => {
      const model = gltf.scene;
      const s = optionalGltfModel.scale || 1;
      model.scale.setScalar(s);
      if (optionalGltfModel.position) {
        model.position.set(...optionalGltfModel.position);
      }
      cardStage.add(model);
    });
  }

  // Orbiting 3D Reward Gems
  const gems = [];
  const gemGeo = new THREE.OctahedronGeometry(0.13, 0);
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0xf3e5ab,
    metalness: 0.9,
    roughness: 0.15,
  });
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Mesh(gemGeo, gemMat);
    g.position.set(
      (Math.random() - 0.5) * 9,
      (Math.random() - 0.5) * 5,
      -1.8 - Math.random() * 2.5
    );
    g.userData = {
      speed: 0.4 + Math.random() * 0.6,
      baseY: g.position.y,
      phase: Math.random() * Math.PI * 2,
    };
    scene.add(g);
    gems.push(g);
  }

  function applyCardPose(card, pose, instant = false) {
    if (!card || !pose) return;
    if (instant || !window.gsap) {
      card.position.set(pose.x, pose.y, pose.z);
      card.rotation.set(pose.rx, pose.ry, pose.rz);
      card.scale.setScalar(pose.s);
      return;
    }
    window.gsap.to(card.position, {
      x: pose.x,
      y: pose.y,
      z: pose.z,
      duration: 1.15,
      ease: "power3.out",
    });
    window.gsap.to(card.rotation, {
      x: pose.rx,
      y: pose.ry,
      z: pose.rz,
      duration: 1.15,
      ease: "power3.out",
    });
    window.gsap.to(card.scale, {
      x: pose.s,
      y: pose.s,
      z: pose.s,
      duration: 1.15,
      ease: "power3.out",
    });
  }

  function setSlide(index, instant = false) {
    if (!slidePoses.length) return;
    const p = slidePoses[index % slidePoses.length];
    Object.keys(p).forEach((id) => {
      applyCardPose(cardObjects[id], p[id], instant);
    });
  }

  setSlide(0, true);

  let targetMouseX = 0;
  let targetMouseY = 0;
  window.addEventListener("mousemove", (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.28;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.2;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    const elapsed = clock.getElapsedTime();
    cardStage.position.y = Math.sin(elapsed * 1.4) * 0.06;
    cardStage.rotation.y += (targetMouseX - cardStage.rotation.y) * 0.05;
    cardStage.rotation.x += (targetMouseY - cardStage.rotation.x) * 0.05;

    gems.forEach((g) => {
      g.rotation.x += 0.008 * g.userData.speed;
      g.rotation.y += 0.012 * g.userData.speed;
      g.position.y =
        g.userData.baseY +
        Math.sin(elapsed * g.userData.speed + g.userData.phase) * 0.22;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return { setSlide, scene, cardObjects };
}
