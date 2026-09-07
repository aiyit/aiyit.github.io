// vr/cardboard.js
// 구글 카드보드 실사용을 고려한 구현 노트:
// - 최신 브라우저는 WebVR API를 제거했고, WebXR의 immersive-vr 세션은 보통 ARCore/ARKit 등
//   실제 XR 런타임이 있어야 열립니다. 종이 카드보드처럼 "폰 + 렌즈"만 있는 환경에서는
//   immersive-vr 세션 자체가 열리지 않는 경우가 많습니다.
// - 그래서 실무적으로 널리 쓰이는 방식대로, DeviceOrientation 이벤트로 시점을 돌리고
//   THREE.StereoCamera(코어 포함, examples 의존 없음)로 화면을 좌/우 두 개로 분할 렌더링합니다.
// - 이 방식은 카드보드 뷰어에 넣었을 때 바로 동작하며, 별도의 WebXR 지원 여부에 좌우되지 않습니다.

import * as THREE from "three";

const _euler = new THREE.Euler();
const _q0 = new THREE.Quaternion();
const _q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -90deg around X
const _zee = new THREE.Vector3(0, 0, 1);
const _size = new THREE.Vector2();

export class CardboardVR {
  constructor(camera) {
    this.camera = camera;
    this.enabled = false;

    this.stereo = new THREE.StereoCamera();
    this.stereo.eyeSep = 0.064; // 평균 성인 동공간거리(m)
    this.stereo.aspect = 0.5; // 화면을 좌우로 절반씩 나눠 쓰므로 0.5 고정

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

  /** iOS 13+는 반드시 사용자 제스처(버튼 클릭) 안에서 권한 요청을 호출해야 함 */
  async requestPermissionIfNeeded() {
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
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
    } catch (e) {
      /* 일부 브라우저/환경은 전체화면 API를 막을 수 있음 - 치명적이지 않으므로 무시 */
    }
    try {
      await screen.orientation?.lock?.("landscape");
    } catch (e) {
      /* 자동 회전 잠금 미지원 기기는 사용자가 직접 가로로 돌리도록 안내 */
    }

    this.enabled = true;
  }

  exit() {
    this.enabled = false;
    window.removeEventListener("deviceorientation", this._onDeviceOrientation);
    window.removeEventListener("orientationchange", this._onScreenOrientationChange);

    try {
      screen.orientation?.unlock?.();
    } catch (e) {}
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
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
    this.camera.quaternion.multiply(_q1); // 기기 좌표계 -> three.js 카메라 좌표계 보정
    this.camera.quaternion.multiply(_q0.setFromAxisAngle(_zee, -orient));
  }

  /** VR 모드일 때 main.js의 애니메이션 루프에서 renderer.render() 대신 호출 */
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
