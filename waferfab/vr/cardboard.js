// vr/cardboard.js
// three.js core의 StereoCamera만 사용 (examples 의존 없음) -> 종이 카드보드 + 폰 조합에서도
// WebXR 지원 여부와 무관하게 항상 동작.

import * as THREE from "three";

const _euler = new THREE.Euler();
const _q0 = new THREE.Quaternion();
const _q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
const _zee = new THREE.Vector3(0, 0, 1);
const _size = new THREE.Vector2();

export class CardboardVR {
  constructor(camera) {
    this.camera = camera;
    this.enabled = false;

    this.stereo = new THREE.StereoCamera();
    this.stereo.eyeSep = 0.064;
    this.stereo.aspect = 0.5;

    this.deviceOrientation = null;
    this.screenOrientationAngle = 0;

    this._onDeviceOrientation = (e) => {
      this.deviceOrientation = e;
    };
    this._onScreenOrientationChange = () => {
      this.screenOrientationAngle =
        (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    };
  }

  async requestPermissionIfNeeded() {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result !== "granted") {
        throw new Error("기기 방향 센서 권한이 거부되었습니다.");
      }
    }
  }

  async enter(fullscreenTarget) {
    await this.requestPermissionIfNeeded();

    window.addEventListener("deviceorientation", this._onDeviceOrientation);
    window.addEventListener("orientationchange", this._onScreenOrientationChange);
    this._onScreenOrientationChange();

    try {
      await fullscreenTarget?.requestFullscreen?.();
    } catch (e) {}
    try {
      await screen.orientation?.lock?.("landscape");
    } catch (e) {}

    this.enabled = true;
  }

  exit() {
    this.enabled = false;
    window.removeEventListener("deviceorientation", this._onDeviceOrientation);
    window.removeEventListener("orientationchange", this._onScreenOrientationChange);
    try {
      screen.orientation?.unlock?.();
    } catch (e) {}
    if (document.fullscreenElement) document.exitFullscreen?.();
  }

  _updateCameraFromDeviceOrientation() {
    const o = this.deviceOrientation;
    if (!o || o.alpha === null) return;

    const alpha = THREE.MathUtils.degToRad(o.alpha);
    const beta = THREE.MathUtils.degToRad(o.beta);
    const gamma = THREE.MathUtils.degToRad(o.gamma);
    const orient = THREE.MathUtils.degToRad(this.screenOrientationAngle);

    _euler.set(beta, alpha, -gamma, "YXZ");
    this.camera.quaternion.setFromEuler(_euler);
    this.camera.quaternion.multiply(_q1);
    this.camera.quaternion.multiply(_q0.setFromAxisAngle(_zee, -orient));
  }

  render(renderer, scene) {
    this._updateCameraFromDeviceOrientation();
    this.camera.updateMatrixWorld(true);
    this.stereo.update(this.camera);

    renderer.getSize(_size);
    const halfWidth = _size.width / 2;

    renderer.setScissorTest(true);
    renderer.setScissor(0, 0, halfWidth, _size.height);
    renderer.setViewport(0, 0, halfWidth, _size.height);
    renderer.render(scene, this.stereo.cameraL);

    renderer.setScissor(halfWidth, 0, halfWidth, _size.height);
    renderer.setViewport(halfWidth, 0, halfWidth, _size.height);
    renderer.render(scene, this.stereo.cameraR);
    renderer.setScissorTest(false);
  }
}
