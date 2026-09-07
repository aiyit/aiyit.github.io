// modules/butterfly.js
// 상호작용/센서 모듈과 동일한 패턴: 클래스 단위로 캡슐화하여 index.html(최종 Scene)에서는
// createButterflies() 한 번만 호출하면 되도록 설계.

import * as THREE from "three";

const wingShape = buildWingShape();
const wingGeometry = new THREE.ShapeGeometry(wingShape);
const bodyGeometry = new THREE.CapsuleGeometry(0.045, 0.22, 2, 6);
bodyGeometry.rotateX(Math.PI / 2);

function buildWingShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.55, 0.5, 0.42, 0.95);
  shape.quadraticCurveTo(0.15, 1.1, 0, 0.55);
  shape.quadraticCurveTo(-0.05, 0.15, 0, 0);
  return shape;
}

export class Butterfly {
  constructor(color) {
    this.group = new THREE.Group();

    const material = new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      roughness: 0.45,
      metalness: 0.05,
      emissive: color,
      emissiveIntensity: 0.12,
    });

    this.leftWingPivot = new THREE.Group();
    this.rightWingPivot = new THREE.Group();

    const leftWing = new THREE.Mesh(wingGeometry, material);
    leftWing.scale.x = -1; // 좌우 대칭
    const rightWing = new THREE.Mesh(wingGeometry, material.clone());

    this.leftWingPivot.add(leftWing);
    this.rightWingPivot.add(rightWing);

    // 몸통 살짝 위, 날개 힌지는 몸통 옆에 위치
    this.leftWingPivot.position.set(-0.02, 0, 0);
    this.rightWingPivot.position.set(0.02, 0, 0);

    const body = new THREE.Mesh(
      bodyGeometry,
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 })
    );

    this.group.add(this.leftWingPivot, this.rightWingPivot, body);
    this.group.scale.setScalar(0.6 + Math.random() * 0.5);

    // 비행 경로 파라미터 (리사주 곡선 형태 - 자연스러운 불규칙 비행)
    const angle = Math.random() * Math.PI * 2;
    const distFromCenter = 3 + Math.random() * 16;
    this.center = new THREE.Vector3(
      Math.cos(angle) * distFromCenter,
      0,
      Math.sin(angle) * distFromCenter
    );
    this.radiusX = 2 + Math.random() * 4;
    this.radiusZ = 2 + Math.random() * 4;
    this.baseHeight = 1.2 + Math.random() * 2.2;
    this.bobAmp = 0.3 + Math.random() * 0.5;
    this.speed = 0.25 + Math.random() * 0.35;
    this.phase = Math.random() * Math.PI * 2;
    this.flapSpeed = 9 + Math.random() * 6;
    this.flapPhase = Math.random() * Math.PI * 2;

    this._sampleAhead = new THREE.Vector3();
  }

  _positionAt(t, out) {
    const a = t * this.speed + this.phase;
    out.set(
      this.center.x + Math.cos(a) * this.radiusX,
      this.baseHeight + Math.sin(a * 2.3) * this.bobAmp,
      this.center.z + Math.sin(a * 1.3) * this.radiusZ
    );
    return out;
  }

  update(elapsedSeconds) {
    this._positionAt(elapsedSeconds, this.group.position);
    this._positionAt(elapsedSeconds + 0.05, this._sampleAhead);

    if (this._sampleAhead.distanceToSquared(this.group.position) > 1e-6) {
      this.group.lookAt(this._sampleAhead);
    }

    const flap = Math.sin(elapsedSeconds * this.flapSpeed + this.flapPhase) * 0.9 + 0.15;
    this.leftWingPivot.rotation.z = flap;
    this.rightWingPivot.rotation.z = -flap;
  }
}

const PALETTE = [
  0xff5c5c, 0xff9d3c, 0xffe14d, 0x8be04b, 0x3ddc84, 0x2fd0c9, 0x35a7ff, 0x5c7cff,
  0x9d5cff, 0xe25cff, 0xff5cc4, 0xff5c8a, 0xffb347, 0x7bff5c, 0x5cf0ff,
];

/**
 * count 마리의 나비를 만들어 scene에 추가하고, update(t)를 호출할 배열을 반환합니다.
 */
export function createButterflies(scene, count = 15) {
  const butterflies = [];
  for (let i = 0; i < count; i++) {
    const color = PALETTE[i % PALETTE.length];
    const b = new Butterfly(color);
    scene.add(b.group);
    butterflies.push(b);
  }
  return butterflies;
}
