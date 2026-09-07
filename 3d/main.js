// js/main.js
// 최종 Scene 통합: modules/(building,machine,sensor 자리에 해당하는) environment, butterfly 와
// pc/vr 인터페이스를 조립하기만 하는 "조립 전용" 파일로 유지 (로직은 각 모듈에 위임).

import * as THREE from "three";
import { createEnvironment, ENV_CONSTANTS } from "../modules/environment.js";
import { createButterflies } from "../modules/butterfly.js";
import { PCController } from "../pc/pc-controller.js";
import { CardboardVR } from "../vr/cardboard.js";

const canvas = document.getElementById("scene-canvas");
const loadingEl = document.getElementById("loading");
const hudEl = document.getElementById("hud");
const vrHint = document.querySelector(".vr-hint");
const pcHint = document.querySelector(".pc-hint");
const vrButton = document.getElementById("vr-button");
const exitVrButton = document.getElementById("exit-vr-button");
const orientationWarning = document.getElementById("orientation-warning");

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ---------- 기본 씬 구성 ----------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 1.6, 6); // 사람 눈높이

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 조명: 카드보드 성능을 고려해 그림자 없이 hemisphere + directional 조합만 사용
scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x3a6b2a, 1.1));
const sun = new THREE.DirectionalLight(0xfff2d9, 1.1);
sun.position.set(10, 18, 6);
scene.add(sun);

// ---------- 모듈 조립 ----------
createEnvironment(scene);
const butterflies = createButterflies(scene, 15);

const pcController = new PCController(canvas, canvas, ENV_CONSTANTS.WORLD_RADIUS - 4);
const cardboardVR = new CardboardVR(camera);

const clock = new THREE.Clock();

// ---------- UI 상태 ----------
loadingEl.classList.add("hidden");
hudEl.classList.remove("hidden");

if (isMobile) {
  vrButton.classList.remove("hidden");
  pcHint.classList.add("hidden");
} else {
  // PC에서도 테스트해볼 수 있도록 버튼은 유지하되, 안내 문구만 PC 기준으로 둠
  vrButton.classList.remove("hidden");
}

vrButton.addEventListener("click", async () => {
  try {
    await cardboardVR.enter(document.getElementById("app"));
    pcController.setEnabled(false);
    vrButton.classList.add("hidden");
    exitVrButton.classList.remove("hidden");
    pcHint.classList.add("hidden");
    vrHint.classList.remove("hidden");
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
  const elapsed = clock.elapsedTime;

  for (const b of butterflies) b.update(elapsed);

  if (cardboardVR.enabled) {
    cardboardVR.render(renderer, scene);
  } else {
    pcController.update(delta);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }
}

animate();
