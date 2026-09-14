// modules/stations.js
// 사진 속 6개 공정(단결정 성장 → 잉곳 가공 → Wafer 절단 → CMP 연마 → 세정 → 검사)을
// 각각 여러 개의 프리미티브를 조합한 "장비처럼 보이는" 그룹으로 구성.
// 실제 GLB 모델을 나중에 붙이고 싶다면, 이 파일의 각 create*() 함수만 교체하면 됨.

import * as THREE from "three";
import { stationPosition } from "./environment.js";
import { createStationLabel } from "./labels.js";

const METAL = new THREE.MeshStandardMaterial({ color: 0xe6edf5, roughness: 0.35, metalness: 0.55 });
const METAL_DARK = new THREE.MeshStandardMaterial({ color: 0x2c3646, roughness: 0.4, metalness: 0.6 });
const ACCENT = new THREE.MeshStandardMaterial({
  color: 0x2f8fff,
  emissive: 0x1560c9,
  emissiveIntensity: 0.7,
  roughness: 0.4,
});
const GLASS_BLUE = new THREE.MeshPhysicalMaterial({
  color: 0x5fc3ff,
  transparent: true,
  opacity: 0.45,
  roughness: 0.1,
  transmission: 0.4,
  metalness: 0,
});
const SCREEN = new THREE.MeshStandardMaterial({
  color: 0x0b1c33,
  emissive: 0x38e8ff,
  emissiveIntensity: 0.9,
});

// 공통 부속: 제어 패널 (장비 옆에 붙는 작은 조작반)
function controlPanel() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.1, 0.45), METAL_DARK);
  body.position.y = 0.55;
  g.add(body);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 0.02), SCREEN);
  screen.position.set(0, 0.85, 0.24);
  g.add(screen);
  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), ACCENT);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(-0.15 + i * 0.15, 0.55, 0.24);
    g.add(btn);
  }
  return g;
}

// 1. 단결정 성장 (CZ 결정성장로) — 원통형 노(furnace) + 내부 주황 글로우 + 상부 인상봉 기구
function createCrystalGrowth() {
  const g = new THREE.Group();

  const furnace = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 2.1, 24), METAL);
  furnace.position.y = 1.05;
  g.add(furnace);

  const band1 = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.05, 10, 32), METAL_DARK);
  band1.rotation.x = Math.PI / 2;
  band1.position.y = 1.6;
  g.add(band1);
  const band2 = band1.clone();
  band2.position.y = 0.6;
  g.add(band2);

  // 내부에서 새어 나오는 용융 실리콘 글로우
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xff7a29, emissive: 0xff5a00, emissiveIntensity: 1.6 })
  );
  glow.position.y = 0.35;
  g.add(glow);
  const glowLight = new THREE.PointLight(0xff7a29, 1.4, 4, 2);
  glowLight.position.y = 0.5;
  g.add(glowLight);

  // 상부 인상 기구 (결정을 끌어올리는 지지대 + 로프)
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), METAL_DARK);
  tower.position.set(0, 2.9, -0.5);
  g.add(tower);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.1), METAL_DARK);
  beam.position.set(0, 3.6, -0.05);
  g.add(beam);
  const puller = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 8), METAL);
  puller.position.set(0, 2.6, 0.5);
  g.add(puller);
  const seed = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.5, 16), 
    new THREE.MeshStandardMaterial({ color: 0xdedede, roughness: 0.2, metalness: 0.1 }));
  seed.position.set(0, 1.7, 0.5);
  g.add(seed);

  const panel = controlPanel();
  panel.position.set(1.4, 0, 0.2);
  panel.rotation.y = -0.4;
  g.add(panel);

  return g;
}

// 2. 잉곳 가공 (외경 연삭기) — 회전 척 위 원통형 잉곳 + 연삭 휠
function createIngotGrinding() {
  const g = new THREE.Group();

  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.1), METAL_DARK);
  bed.position.y = 0.25;
  g.add(bed);

  const ingot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.7, 24), 
    new THREE.MeshStandardMaterial({ color: 0x9aa4ad, roughness: 0.5, metalness: 0.3 }));
  ingot.rotation.z = Math.PI / 2;
  ingot.position.set(-0.1, 0.85, 0);
  g.add(ingot);

  const chuckL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.25, 20), METAL);
  chuckL.rotation.z = Math.PI / 2;
  chuckL.position.set(-1.0, 0.85, 0);
  g.add(chuckL);
  const chuckR = chuckL.clone();
  chuckR.position.set(0.8, 0.85, 0);
  g.add(chuckR);

  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 28), METAL_DARK);
  wheel.position.set(0.3, 1.5, 0.55);
  g.add(wheel);
  const wheelArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.7, 0.15), METAL);
  wheelArm.position.set(0.3, 1.2, 0.55);
  g.add(wheelArm);

  const panel = controlPanel();
  panel.position.set(-1.5, 0, 0.4);
  panel.rotation.y = 0.5;
  g.add(panel);

  return g;
}

// 3. Wafer 절단 (다이아몬드 와이어쏘) — 좌우 롤러 + 팽팽한 와이어 다발 + 절단 대상 잉곳
function createWaferSaw() {
  const g = new THREE.Group();

  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 1.0), METAL_DARK);
  frame.position.y = 0.5;
  g.add(frame);

  const rollerL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.0, 20), METAL);
  rollerL.rotation.x = Math.PI / 2;
  rollerL.position.set(-1.1, 1.3, 0);
  g.add(rollerL);
  const rollerR = rollerL.clone();
  rollerR.position.set(1.1, 1.3, 0);
  g.add(rollerR);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.3, 0.15), METAL_DARK);
  legL.position.set(-1.1, 0.65, 0);
  g.add(legL);
  const legR = legL.clone();
  legR.position.set(1.1, 0.65, 0);
  g.add(legR);

  // 다이아몬드 와이어 다발 (가는 실린더 여러 개)
  const wireMat = new THREE.MeshStandardMaterial({ color: 0xcfe8ff, metalness: 0.7, roughness: 0.2 });
  for (let i = 0; i < 14; i++) {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.2, 6), wireMat);
    wire.rotation.z = Math.PI / 2;
    wire.position.set(0, 1.06 + i * 0.03, 0);
    g.add(wire);
  }

  const ingot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 20),
    new THREE.MeshStandardMaterial({ color: 0x9aa4ad, roughness: 0.5, metalness: 0.3 }));
  ingot.position.set(0, 1.4, 0);
  g.add(ingot);

  const panel = controlPanel();
  panel.position.set(1.6, 0, 0.3);
  panel.rotation.y = -0.5;
  g.add(panel);

  return g;
}

// 4. CMP 연마 (화학기계적 연마) — 대형 회전 연마정반 + 헤드 암 + 슬러리 공급관
function createCMPPolish() {
  const g = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.5, 32), METAL_DARK);
  base.position.y = 0.25;
  g.add(base);

  const platen = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 40), 
    new THREE.MeshStandardMaterial({ color: 0x445266, roughness: 0.6, metalness: 0.3 }));
  platen.position.y = 0.55;
  g.add(platen);

  const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.6, 16), METAL);
  armPost.position.set(-0.9, 1.05, 0);
  g.add(armPost);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.14, 0.14), METAL);
  arm.position.set(-0.25, 1.75, 0);
  g.add(arm);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24), METAL_DARK);
  head.position.set(0.3, 1.6, 0);
  g.add(head);

  // 슬러리 공급관
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 12), ACCENT);
  pipe.rotation.z = Math.PI / 2.4;
  pipe.position.set(0.55, 1.35, 0.5);
  g.add(pipe);

  const panel = controlPanel();
  panel.position.set(-1.8, 0, 0.3);
  panel.rotation.y = 0.5;
  g.add(panel);

  return g;
}

// 5. 세정 (오염물 제거) — 세정액이 담긴 반투명 탱크 여러 개 + 배관
function createCleaning() {
  const g = new THREE.Group();

  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.7, 0.9), METAL_DARK);
  frame.position.y = 0.85;
  g.add(frame);

  for (let i = 0; i < 3; i++) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.3, 24), GLASS_BLUE);
    tank.position.set(-0.65 + i * 0.65, 1.1, 0.5);
    g.add(tank);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 24), METAL);
    cap.position.set(-0.65 + i * 0.65, 1.78, 0.5);
    g.add(cap);
  }

  const pipeTop = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.08), ACCENT);
  pipeTop.position.set(0, 1.9, 0.5);
  g.add(pipeTop);

  const panel = controlPanel();
  panel.position.set(1.5, 0, -0.2);
  panel.rotation.y = -0.5;
  g.add(panel);

  return g;
}

// 6. 검사 (품질 검사) — 소형 챔버 + 모니터 화면 + 카메라 암
function createInspection() {
  const g = new THREE.Group();

  const chamber = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 1.1), METAL);
  chamber.position.y = 0.75;
  g.add(chamber);
  const chamberGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.55, 0.05),
    new THREE.MeshPhysicalMaterial({ color: 0xbfe4ff, transparent: true, opacity: 0.35, roughness: 0.05 })
  );
  chamberGlass.position.set(0, 0.85, 0.58);
  g.add(chamberGlass);

  const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 12), METAL_DARK);
  armPost.position.set(0, 1.5, 0.3);
  g.add(armPost);
  const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.28, 16), METAL_DARK);
  cam.rotation.x = Math.PI / 2.5;
  cam.position.set(0, 1.95, 0.5);
  g.add(cam);

  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.06), METAL_DARK);
  monitor.position.set(1.4, 1.4, -0.1);
  monitor.rotation.y = -0.6;
  g.add(monitor);
  const monitorScreen = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.48, 0.02), SCREEN);
  monitorScreen.position.set(1.4, 1.4, -0.07);
  monitorScreen.rotation.y = -0.6;
  g.add(monitorScreen);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 10), METAL);
  stand.position.set(1.4, 0.7, -0.1);
  g.add(stand);

  return g;
}

const STATION_DEFS = [
  { build: createCrystalGrowth, title: "단결정 성장", subtitle: "실리콘 잉곳 제조 · CZ 결정성장로" },
  { build: createIngotGrinding, title: "잉곳 가공", subtitle: "외경 연삭 · 도가니 / 회전축 / 콘트롤러" },
  { build: createWaferSaw, title: "Wafer 절단", subtitle: "다이아몬드 와이어쏘 · 와이어롤 / 가이드롤러" },
  { build: createCMPPolish, title: "CMP 연마", subtitle: "초평탄화 · 헤드암 / 플레이트 / 슬러리공급관" },
  { build: createCleaning, title: "세정", subtitle: "오염물 제거 · 세정탱크 / 화학탱크 / 노즐" },
  { build: createInspection, title: "검사", subtitle: "품질 검사 · 검사장비 / 카메라 / 센서" },
];

/**
 * 6개 스테이션을 원형으로 배치하여 scene에 추가합니다.
 * 각 장비는 중앙(사용자 시점)을 바라보도록 회전됩니다.
 */
export function createStations(scene) {
  const stations = [];

  STATION_DEFS.forEach((def, i) => {
    const { x, z, angle } = stationPosition(i);
    const group = def.build();
    group.position.set(x, 0.28, z);
    // 장비 정면(+z 방향으로 모델링)이 중앙을 바라보도록 회전
    group.rotation.y = angle + Math.PI / 2;
    scene.add(group);

    const label = createStationLabel(i + 1, def.title, def.subtitle);
    label.position.set(x * 0.82, 4.0, z * 0.82);
    scene.add(label);

    stations.push({ index: i + 1, title: def.title, position: new THREE.Vector3(x, 0, z), group, label });
  });

  return stations;
}
