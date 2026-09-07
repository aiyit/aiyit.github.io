// pc/pc-controller.js
// PC 인터페이스 전용: mousemove + keydown/keyup 만 사용.
// VR 모드에서는 main.js가 이 컨트롤러의 update()를 호출하지 않도록 분리되어 있음.

import * as THREE from "three";

const MOVE_SPEED = 4.2; // m/s
const LOOK_SENSITIVITY = 0.0022;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

export class PCController {
  constructor(camera, domElement, worldRadius = 85) {
    this.camera = camera;
    this.domElement = domElement;
    this.worldRadius = worldRadius;
    this.enabled = true;

    this.euler = new THREE.Euler(0, 0, 0, "YXZ");
    this.keys = { forward: false, back: false, left: false, right: false };

    this._onClick = () => {
      if (this.enabled) this.domElement.requestPointerLock?.();
    };
    this._onMouseMove = (e) => {
      if (document.pointerLockElement !== this.domElement) return;
      this.euler.y -= e.movementX * LOOK_SENSITIVITY;
      this.euler.x -= e.movementY * LOOK_SENSITIVITY;
      this.euler.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.euler.x));
      this.camera.quaternion.setFromEuler(this.euler);
    };
    this._onKeyDown = (e) => this._setKey(e.code, true);
    this._onKeyUp = (e) => this._setKey(e.code, false);

    domElement.addEventListener("click", this._onClick);
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("keydown", this._onKeyDown);
    document.addEventListener("keyup", this._onKeyUp);
  }

  _setKey(code, value) {
    switch (code) {
      case "KeyW":
      case "ArrowUp":
        this.keys.forward = value;
        break;
      case "KeyS":
      case "ArrowDown":
        this.keys.back = value;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.keys.left = value;
        break;
      case "KeyD":
      case "ArrowRight":
        this.keys.right = value;
        break;
    }
  }

  setEnabled(value) {
    this.enabled = value;
    if (!value && document.pointerLockElement === this.domElement) {
      document.exitPointerLock?.();
    }
  }

  update(delta) {
    if (!this.enabled) return;

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, this.camera.up).negate();

    const move = new THREE.Vector3();
    if (this.keys.forward) move.add(forward);
    if (this.keys.back) move.sub(forward);
    if (this.keys.right) move.add(right);
    if (this.keys.left) move.sub(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED * delta);
      this.camera.position.add(move);

      // 월드 경계 밖으로 나가지 않도록 클램프
      const distFromCenter = Math.hypot(this.camera.position.x, this.camera.position.z);
      if (distFromCenter > this.worldRadius) {
        const scale = this.worldRadius / distFromCenter;
        this.camera.position.x *= scale;
        this.camera.position.z *= scale;
      }
    }
  }

  dispose() {
    this.domElement.removeEventListener("click", this._onClick);
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("keydown", this._onKeyDown);
    document.removeEventListener("keyup", this._onKeyUp);
  }
}
