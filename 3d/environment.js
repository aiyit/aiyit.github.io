// modules/environment.js
// 건물/설비 모듈과 동일한 패턴: "scene을 받아 요소를 만들어 붙이는" 순수 함수 형태로 설계.
// 다른 프로젝트(공장/건물 시각화)에서도 이 패턴을 그대로 재사용할 수 있습니다.

import * as THREE from "three";

const CLEARING_RADIUS = 9; // 플레이어가 서 있는 중앙 공터 반경
const WORLD_RADIUS = 90; // 숲이 형성되는 바깥 경계

/**
 * 바닥(잔디 베이스) + 풀 + 나무를 만들어 scene에 추가합니다.
 */
export function createEnvironment(scene) {
  createGround(scene);
  createGrassPatches(scene, 2200);
  createTrees(scene, 42);
  createSky(scene);
}

function createSky(scene) {
  scene.background = new THREE.Color(0x9fd6ff);
  scene.fog = new THREE.Fog(0xbfe3ff, 25, 130);
}

function createGround(scene) {
  const geo = new THREE.PlaneGeometry(WORLD_RADIUS * 2.4, WORLD_RADIUS * 2.4, 1, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x4c8c3c,
    roughness: 1,
    metalness: 0,
  });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.name = "ground";
  scene.add(ground);
}

/**
 * 인스턴싱된 풀 블레이드를 대량으로 뿌립니다. (성능을 위해 InstancedMesh 사용 - 모바일 카드보드 고려)
 */
function createGrassPatches(scene, count) {
  const bladeGeo = new THREE.PlaneGeometry(0.14, 0.55, 1, 2);
  bladeGeo.translate(0, 0.275, 0); // 하단이 지면에 닿도록 피벗 이동

  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x63a13a,
    side: THREE.DoubleSide,
    roughness: 1,
  });

  const grass = new THREE.InstancedMesh(bladeGeo, bladeMat, count);
  grass.name = "grass";

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = CLEARING_RADIUS * 0.4 + Math.random() * WORLD_RADIUS;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    dummy.position.set(x, 0, z);
    dummy.rotation.y = Math.random() * Math.PI;
    const scale = 0.6 + Math.random() * 0.9;
    dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.6), scale);
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);

    // 색상에 약간의 랜덤 편차를 줘서 단조롭지 않게
    const hueShift = (Math.random() - 0.5) * 0.06;
    color.setHSL(0.28 + hueShift, 0.55 + Math.random() * 0.2, 0.32 + Math.random() * 0.18);
    grass.setColorAt(i, color);
  }

  grass.instanceMatrix.needsUpdate = true;
  if (grass.instanceColor) grass.instanceColor.needsUpdate = true;

  scene.add(grass);
}

/**
 * 저폴리곤 나무를 중앙 공터를 피해서 배치합니다.
 */
function createTrees(scene, count) {
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 2.2, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 1 });

  const foliageGeo = new THREE.ConeGeometry(1.4, 2.6, 8);
  const foliageMatBase = new THREE.MeshStandardMaterial({ color: 0x2f7a3a, roughness: 0.9 });

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const radius = CLEARING_RADIUS + 6 + Math.random() * (WORLD_RADIUS - CLEARING_RADIUS - 6);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const scale = 0.8 + Math.random() * 0.9;
    tree.scale.setScalar(scale);
    tree.rotation.y = Math.random() * Math.PI * 2;

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.1;
    tree.add(trunk);

    // 잎은 2~3단으로 겹쳐서 좀 더 풍성하게
    const tiers = 2 + Math.floor(Math.random() * 2);
    const foliageMat = foliageMatBase.clone();
    const hueShift = (Math.random() - 0.5) * 0.05;
    const c = new THREE.Color(0x2f7a3a);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    foliageMat.color.setHSL(hsl.h + hueShift, hsl.s, hsl.l + (Math.random() - 0.5) * 0.08);

    for (let t = 0; t < tiers; t++) {
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 2.1 + t * 1.05;
      foliage.scale.setScalar(1 - t * 0.22);
      tree.add(foliage);
    }

    scene.add(tree);
  }
}

export const ENV_CONSTANTS = { CLEARING_RADIUS, WORLD_RADIUS };
