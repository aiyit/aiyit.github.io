// modules/environment.js
// 클린룸 반도체 팹 공간: 바닥, 조명, 중앙 사용자 플랫폼, 6개 스테이션을 잇는 순환 통로.

import * as THREE from "three";

export const RING_RADIUS = 13; // 6개 스테이션이 배치되는 원의 반지름
export const HUB_RADIUS = 3.2; // 중앙 사용자 플랫폼 반지름

export function createSkyAndFog(scene) {
  scene.background = new THREE.Color(0x0c1930);
  scene.fog = new THREE.Fog(0x0c1930, 26, 60);
}

export function createLights(scene) {
  const hemi = new THREE.HemisphereLight(0xdfeeff, 0x0a1428, 1.0);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(14, 22, 10);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x4f8fff, 0.35);
  fill.position.set(-16, 10, -12);
  scene.add(fill);

  // 중앙 사용자 위치를 은은하게 비추는 포인트 라이트 (시선 유도)
  const hubLight = new THREE.PointLight(0x66b2ff, 1.2, 14, 2);
  hubLight.position.set(0, 5, 0);
  scene.add(hubLight);
}

function ringGeometry(innerR, outerR) {
  return new THREE.RingGeometry(innerR, outerR, 96);
}

export function createFloor(scene) {
  // 메인 바닥 (클린룸 타일 느낌: 밝은 회색 + 격자)
  const floorGeo = new THREE.CircleGeometry(RING_RADIUS + 6, 96);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8e3,
    roughness: 0.55,
    metalness: 0.15,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // 중앙 사용자 플랫폼 (약간 밝게 강조)
  const hub = new THREE.Mesh(
    new THREE.CircleGeometry(HUB_RADIUS, 64),
    new THREE.MeshStandardMaterial({ color: 0xe9f2ff, roughness: 0.35, metalness: 0.25 })
  );
  hub.rotation.x = -Math.PI / 2;
  hub.position.y = 0.01;
  scene.add(hub);

  const hubRing = new THREE.Mesh(
    ringGeometry(HUB_RADIUS - 0.06, HUB_RADIUS),
    new THREE.MeshStandardMaterial({
      color: 0x2f8fff,
      emissive: 0x2f8fff,
      emissiveIntensity: 0.8,
      roughness: 0.4,
    })
  );
  hubRing.rotation.x = -Math.PI / 2;
  hubRing.position.y = 0.02;
  scene.add(hubRing);

  // 6개 스테이션을 잇는 순환 통로(발광 트랙)
  const track = new THREE.Mesh(
    ringGeometry(RING_RADIUS - 1.6, RING_RADIUS - 1.35),
    new THREE.MeshStandardMaterial({
      color: 0x2f8fff,
      emissive: 0x1560c9,
      emissiveIntensity: 0.6,
      roughness: 0.5,
    })
  );
  track.rotation.x = -Math.PI / 2;
  track.position.y = 0.015;
  scene.add(track);

  // 각 스테이션 아래 원형 받침대(플랫폼)
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 2) - i * (Math.PI / 3);
    const x = Math.cos(angle) * RING_RADIUS;
    const z = -Math.sin(angle) * RING_RADIUS;
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.7, 0.28, 48),
      new THREE.MeshStandardMaterial({ color: 0xf3f6fa, roughness: 0.4, metalness: 0.3 })
    );
    pad.position.set(x, 0.14, z);
    scene.add(pad);

    const padEdge = new THREE.Mesh(
      new THREE.TorusGeometry(2.68, 0.05, 12, 48),
      new THREE.MeshStandardMaterial({
        color: 0x2f8fff,
        emissive: 0x2f8fff,
        emissiveIntensity: 0.7,
      })
    );
    padEdge.rotation.x = Math.PI / 2;
    padEdge.position.set(x, 0.29, z);
    scene.add(padEdge);
  }
}

/** 천장의 은은한 돔 (완전 개방감보다는 실내 팹 느낌을 살리기 위한 최소 장치) */
export function createCeilingGlow(scene) {
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.1),
    new THREE.MeshBasicMaterial({ color: 0x0c1930, side: THREE.BackSide })
  );
  scene.add(dome);
}

export function buildEnvironment(scene) {
  createSkyAndFog(scene);
  createLights(scene);
  createCeilingGlow(scene);
  createFloor(scene);
}

/** 스테이션 배치 각도/좌표 계산 (stations.js와 공유) */
export function stationPosition(index) {
  const angle = Math.PI / 2 - index * (Math.PI / 3);
  return {
    x: Math.cos(angle) * RING_RADIUS,
    z: -Math.sin(angle) * RING_RADIUS,
    angle,
  };
}
