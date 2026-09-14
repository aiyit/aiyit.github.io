// modules/labels.js
// 캔버스에 그려서 텍스처로 만드는 방식 -> 별도 폰트 로딩/HTML 오버레이 동기화 없이
// 3D 공간 안에 "항상 카메라를 향하는" 번호 배지 + 공정명 라벨을 배치할 수 있음.

import * as THREE from "three";

const ACCENT = "#2f8fff";
const ACCENT_DARK = "#0d3a7a";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeLabelTexture(number, title, subtitle) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");

  // 배지(원형 번호)
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(80, 100, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 76px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(number), 80, 106);

  // 제목 패널 (반투명 글래스)
  ctx.fillStyle = "rgba(8, 20, 45, 0.82)";
  roundRect(ctx, 158, 46, 460, 108, 18);
  ctx.fill();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 3;
  roundRect(ctx, 158, 46, 460, 108, 18);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 40px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(title, 182, 92);

  ctx.fillStyle = "#8fc4ff";
  ctx.font = "400 26px 'Segoe UI', sans-serif";
  ctx.fillText(subtitle, 182, 132);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 항상 카메라를 향하는 라벨 스프라이트를 만들어 group에 붙여서 반환합니다.
 */
export function createStationLabel(number, title, subtitle, height = 4.2) {
  const texture = makeLabelTexture(number, title, subtitle);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.4, 1.06, 1);
  sprite.position.y = height;
  sprite.renderOrder = 10;
  return sprite;
}

/** 바닥 순환 화살표 등, 단순 텍스트 배지가 필요할 때 쓰는 축소 버전 */
export function createBadgeSprite(text, color = ACCENT_DARK) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(128, 128, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 120px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 134);

  const tex = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1, 1, 1);
  return sprite;
}
