// js/main.js
// 조립 전용 파일: 로직은 각 모듈(environment, stations, pc-controller, cardboard)에 위임.

import * as THREE from "three";
import { buildEnvironment, HUB_RADIUS } from "../modules/environment.js";
import { createStations } from "../modules/stations.js";
import { PCController } from "../pc/pc-controller.js";
import { CardboardVR } from "../vr/cardboard.js";

const canvas = document.getElementById("scene-canvas");
const loadingEl = document.getElementById("loading");
const titlePanel = document.getElementById("title-panel");
const processRail = document.getElementById("process-rail");
const hudEl = document.getElementById("hud");
const vrHint = document.querySelector(".vr-hint");
const pcHint = document.querySelector(".pc-hint");
const vrButton = document.getElementById("vr-button");
const exitVrButton = document.getElementById("exit-vr-button");
const orientationWarning = document.getElementById("orientation-warning");

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ---------- 기본 씬 구성 ----------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.6, 0); // 중앙, 사람 눈높이 — 360° 관찰 시점

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ---------- 모듈 조립 ----------
buildEnvironment(scene);
const stations = createStations(scene);

const pcController = new PCController(camera, canvas, HUB_RADIUS + 10);
const cardboardVR = new CardboardVR(camera);

const clock = new THREE.Clock();

// ---------- UI 상태 ----------
loadingEl.classList.add("hidden");
titlePanel.classList.remove("hidden");
processRail.classList.remove("hidden");
hudEl.classList.remove("hidden");
vrButton.classList.remove("hidden");
if (isMobile) pcHint.classList.add("hidden");

vrButton.addEventListener("click", async () => {
  try {
    await cardboardVR.enter(document.getElementById("app"));
    pcController.setEnabled(false);
    vrButton.classList.add("hidden");
    exitVrButton.classList.remove("hidden");
    pcHint.classList.add("hidden");
    vrHint.classList.remove("hidden");
    titlePanel.classList.add("hidden");
    processRail.classList.add("hidden");
    checkOrientation();
  } catch (err) {
    alert("VR 모드를 시작할 수 없습니다: " + err.message);
  }
});

exitVrButton.addEventListener("click", () => {
  cardboardVR.exit();
  pcController.setEnabled(true);
  vrButton.classList.remove("hidden");
  exitVrButton.classList.add("hidden");
  vrHint.classList.add("hidden");
  titlePanel.classList.remove("hidden");
  processRail.classList.remove("hidden");
  if (!isMobile) pcHint.classList.remove("hidden");
  orientationWarning.classList.add("hidden");
});

function checkOrientation() {
  if (!cardboardVR.enabled) return;
  const isPortrait = window.innerHeight > window.innerWidth;
  orientationWarning.classList.toggle("hidden", !isPortrait);
}
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- 애니메이션 루프 ----------
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (cardboardVR.enabled) {
    cardboardVR.render(renderer, scene);
  } else {
    pcController.update(delta);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }
}

animate();
