# VirtualSpace - Cardboard VR 테스트 콘텐츠 (나비 정원)

앞서 정리한 개발 아키텍처를 그대로 반영한 예제입니다.

```
VirtualSpace/
├── index.html              ← 최종 Scene (조립만 담당)
├── pc/
│   └── pc-controller.js    ← PC: 마우스룩(Pointer Lock) + WASD 이동
├── vr/
│   └── cardboard.js        ← 모바일 VR: 기기방향센서 + 좌우 스테레오 분할
├── modules/
│   ├── environment.js      ← 바닥/풀(InstancedMesh)/나무 생성
│   └── butterfly.js        ← 나비 15마리 생성, 비행경로/날갯짓 애니메이션
├── css/style.css
└── js/main.js               ← scene/camera/renderer 생성 + 위 모듈들을 연결
```

## 실행 방법

three.js를 ES Module(import map)로 불러오기 때문에 `file://`로 직접 열면
브라우저 CORS 정책 때문에 모듈 로딩이 막힙니다. 아래 중 하나로 로컬 서버를 띄워주세요.

```bash
# 방법 1: 파이썬
cd VirtualSpace
python3 -m http.server 8080

# 방법 2: VSCode "Live Server" 확장

# 방법 3: 배포 시에는 그대로 GitHub Pages에 올리면 됩니다 (설정 그대로 동작)
```

PC 브라우저에서는 `http://localhost:8080` 접속 후 화면을 클릭하면 마우스 시점 이동 +
WASD 이동이 가능합니다.

모바일에서 카드보드로 테스트하려면:
1. PC와 같은 와이파이에 연결된 상태에서 `http://<PC의 IP>:8080` 으로 접속
   (단, iOS의 기기 방향센서 권한 요청은 **HTTPS 또는 localhost**에서만 동작하므로,
   실제 폰 테스트 시에는 ngrok 등으로 HTTPS 터널을 열거나 GitHub Pages(HTTPS)에 배포해서 테스트하는 것을 권장합니다.)
2. "📱 VR 모드 (Cardboard)" 버튼을 누르면
   - iOS는 기기 방향센서 권한 팝업이 뜹니다 → 허용
   - 화면이 좌우 2분할 스테레오 화면으로 전환되고 전체화면 + 가로모드로 전환을 시도합니다
   - 폰을 카드보드 뷰어에 끼우고 고개를 돌리면 시점이 그대로 따라옵니다

## 왜 WebXR이 아니라 DeviceOrientation + 수동 스테레오인가?

최신 브라우저는 예전 WebVR API를 제거했고, WebXR의 `immersive-vr` 세션은
보통 ARCore/ArKit 같은 실제 XR 런타임이 있어야 열립니다. 종이 카드보드처럼
"폰 + 렌즈"만 있는 환경에서는 `immersive-vr` 세션 요청 자체가 거부되는 경우가 많습니다.

그래서 이 데모는 실무에서 널리 쓰이는 방식대로:
- `deviceorientation` 이벤트로 카메라 회전을 계산하고
- three.js **core**에 포함된 `THREE.StereoCamera` (examples 추가 의존성 불필요)로
  화면을 좌/우로 나눠 렌더링합니다.

이 방식은 WebXR 지원 여부와 무관하게 카드보드 뷰어에 넣었을 때 바로 동작하며,
현재 구조 그대로도 추후 WebXR을 지원하는 기기가 있다면 `vr/cardboard.js`만
`renderer.xr` 기반으로 교체해서 확장할 수 있습니다 (PC/모듈 코드는 그대로 재사용).

## 콘텐츠 구성

- 중앙 공터(반경 9m)를 비워두고 그 바깥에 저폴리곤 나무 42그루를 원형으로 배치
- 풀은 `InstancedMesh`로 2,200개를 한 번에 그려 모바일 성능 확보
- 나비 15마리는 각각 다른 색상(HSL 팔레트) + 서로 다른 리사주(Lissajous) 비행 경로 +
  날개 힌지 회전으로 날갯짓 애니메이션

## 다음 단계 제안 (학생 실습용 확장 포인트)

1. `modules/interaction.js` 추가: 나비를 클릭/응시하면 반응(소리, 개체 수 카운트 등)
2. `modules/ui.js` 추가: 잡은 나비 수, 남은 시간 등을 HUD에 표시
3. `models/*.glb`를 GLTFLoader로 불러와 저폴리곤 나무를 실제 3D 모델로 교체
4. `machine.js`, `sensor.js`처럼 이후 스마트팩토리 콘텐츠로 확장 시,
   지금의 environment.js / butterfly.js와 동일한 "scene을 받아 요소를 추가하는 함수" 패턴을
   그대로 따르면 index.html/main.js는 거의 수정하지 않아도 됩니다.
