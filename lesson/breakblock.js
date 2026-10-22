/* =====================================================================
 * 벽돌깨기(Breakout) 게임 스크립트
 * ---------------------------------------------------------------------
 * [필요한 HTML 요소]
 *   - <canvas id="gameCanvas">  : 게임이 그려지는 캔버스
 *   - #scoreVal                 : 점수 표시 요소
 *   - #livesVal                 : 남은 목숨 표시 요소
 *   - #startBtn                 : 시작/이어하기 버튼
 * [조작법]
 *   - 키보드: ← → 또는 A / D
 *   - 마우스: 캔버스 위에서 움직이면 패들이 따라옴
 * ===================================================================== */

// ---------------------------------------------------------------------
// 1. 캔버스 설정
// ---------------------------------------------------------------------
const canvas = document.getElementById("gameCanvas");   // 캔버스 요소 가져오기
const ctx = canvas.getContext("2d");                    // 2D 그리기 도구(컨텍스트)

// ---------------------------------------------------------------------
// 2. 게임 상태 변수
// ---------------------------------------------------------------------
let score = 0;              // 현재 점수
let lives = 3;              // 남은 목숨
let isPlaying = false;      // 게임 진행 중 여부 (true면 애니메이션 루프 계속 실행)
let animationId = null;     // requestAnimationFrame이 반환하는 ID (중단 시 필요)

// ---------------------------------------------------------------------
// 3. 공(ball) 변수
// ---------------------------------------------------------------------
let x = canvas.width / 2;   // 공의 현재 x 좌표 (가로 중앙에서 시작)
let y = canvas.height - 30; // 공의 현재 y 좌표 (바닥 근처에서 시작)
let dx = 3;                 // 프레임당 x 방향 이동량 (양수: 오른쪽)
let dy = -3;                // 프레임당 y 방향 이동량 (음수: 위쪽)
const ballRadius = 8;       // 공의 반지름

// ---------------------------------------------------------------------
// 4. 패들(paddle) 변수
// ---------------------------------------------------------------------
const paddleHeight = 12;    // 패들 높이
const paddleWidth = 75;     // 패들 너비
let paddleX = (canvas.width - paddleWidth) / 2;  // 패들 왼쪽 끝 x 좌표 (중앙 정렬)

// 키 입력 상태 (눌려 있는 동안 true)
let rightPressed = false;
let leftPressed = false;

// ---------------------------------------------------------------------
// 5. 벽돌(brick) 설정
// ---------------------------------------------------------------------
const brickRowCount = 5;     // 벽돌 행(가로줄) 수
const brickColumnCount = 7;  // 벽돌 열(세로줄) 수
const brickWidth = 54;       // 벽돌 너비
const brickHeight = 16;      // 벽돌 높이
const brickPadding = 8;      // 벽돌 사이 간격
const brickOffsetTop = 25;   // 캔버스 위쪽 여백
const brickOffsetLeft = 21;  // 캔버스 왼쪽 여백

// 행별 색상과 점수 (위쪽 행일수록 높은 점수)
const rowConfig = [
    { color: "#00f3ff", points: 50 },  // 1행: 하늘색
    { color: "#ffff00", points: 40 },  // 2행: 노랑
    { color: "#0066ff", points: 30 },  // 3행: 파랑
    { color: "#00ff66", points: 20 },  // 4행: 초록
    { color: "#ff2a6d", points: 10 }   // 5행: 분홍
];

// 벽돌 2차원 배열: bricks[열][행]
let bricks = [];

/**
 * 벽돌 배열을 초기화한다.
 * - status: 1이면 살아있음(그려짐), 0이면 파괴됨
 * - x, y는 drawBricks()에서 매 프레임 계산해 채워 넣음
 */
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {
                x: 0, y: 0,
                status: 1,
                color: rowConfig[r].color,
                points: rowConfig[r].points
            };
        }
    }
}

// ---------------------------------------------------------------------
// 6. 입력 이벤트 처리
// ---------------------------------------------------------------------

// 키를 누를 때: 해당 방향 플래그를 true로
document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") leftPressed = true;
});

// 키를 뗄 때: 해당 방향 플래그를 false로
document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") leftPressed = false;
});

// 마우스 이동: 마우스 x 좌표를 캔버스 기준 좌표로 변환해 패들 중앙에 맞춤
canvas.addEventListener("mousemove", (e) => {
    // 화면 기준 좌표(clientX)에서 캔버스 왼쪽 가장자리를 빼서 캔버스 내부 좌표를 구함
    let relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;  // 마우스가 패들의 중앙에 오도록
    }
});

// ---------------------------------------------------------------------
// 7. 충돌 감지 (공 ↔ 벽돌)
// ---------------------------------------------------------------------
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {  // 살아있는 벽돌만 검사
                // 공의 중심점이 벽돌 사각형 안에 들어왔는지 확인
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;                 // 세로 방향 반사
                    b.status = 0;             // 벽돌 파괴
                    score += b.points;        // 점수 가산
                    document.getElementById("scoreVal").textContent = score;

                    // 모든 벽돌을 깼는지 확인 (현재 점수가 만점과 같으면 클리어)
                    if (score === totalMaxScore()) {
                        alert("🏆 축하합니다! 모든 벽돌을 파괴했습니다!");
                        stopGame();
                        resetGame();
                    }
                }
            }
        }
    }
}

/**
 * 모든 벽돌을 깼을 때 얻을 수 있는 최대 점수를 계산한다.
 * = (열 개수 × 행별 점수)의 합
 */
function totalMaxScore() {
    let total = 0;
    for (let r = 0; r < brickRowCount; r++) {
        total += brickColumnCount * rowConfig[r].points;
    }
    return total;
}

// ---------------------------------------------------------------------
// 8. 그리기 함수들
// ---------------------------------------------------------------------

/** 공 그리기: 흰색 원 + 하늘색 네온 글로우 */
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);  // 중심(x,y), 반지름, 0~360도
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 8;                          // 번짐 효과 강도
    ctx.shadowColor = "#00f3ff";                 // 번짐 색상
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;                          // 다른 도형에 효과가 번지지 않도록 초기화
}

/** 패들 그리기: 캔버스 바닥에서 8px 위에 파란 사각형 */
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);
    ctx.fillStyle = "#1769aa";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#1769aa";
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

/** 벽돌 그리기: 위치를 계산해 저장한 뒤 살아있는 벽돌만 그림 */
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                // 열/행 번호로 실제 좌표 계산 (벽돌 크기 + 간격 + 여백)
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                // 충돌 감지에서 쓰도록 좌표를 객체에 저장
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].color;
                ctx.shadowBlur = 4;
                ctx.shadowColor = bricks[c][r].color;  // 벽돌 색과 같은 글로우
                ctx.fill();
                ctx.closePath();
                ctx.shadowBlur = 0;
            }
        }
    }
}

// ---------------------------------------------------------------------
// 9. 메인 게임 루프 (매 프레임 실행)
// ---------------------------------------------------------------------
function draw() {
    // (1) 이전 프레임 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // (2) 현재 상태 그리기 + 벽돌 충돌 검사
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // (3) 좌우 벽 충돌: 다음 위치가 벽을 넘으면 x 방향 반전
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    // (4) 위쪽 벽 충돌: y 방향 반전
    if (y + dy < ballRadius) {
        dy = -dy;
    }
    // (5) 아래쪽 도달: 패들 위인지 바닥인지 판정
    else if (y + dy > canvas.height - ballRadius - 8) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            // 패들에 맞음: 맞은 위치(패들 중앙 기준 거리)에 따라 반사 각도 조절
            let hitPoint = x - (paddleX + paddleWidth / 2);
            dx = hitPoint * 0.15;   // 가장자리에 맞을수록 x 속도가 커짐
            dy = -dy;               // 위로 튕김
        } else {
            // 패들을 놓침: 목숨 감소
            lives--;
            document.getElementById("livesVal").textContent = lives;

            if (!lives) {
                // 목숨이 0 → 게임 오버
                alert("💥 GAME OVER");
                stopGame();
                resetGame();
                return;  // 루프 종료
            } else {
                // 목숨이 남음 → 공/패들 위치만 초기화하고 일시정지
                resetBallAndPaddle();
                isPlaying = false;
                document.getElementById("startBtn").textContent = "▶ 이어하기 / 재시작";
                document.getElementById("startBtn").style.display = "block";
                cancelAnimationFrame(animationId);
                return;  // 루프 종료
            }
        }
    }

    // (6) 키보드 입력에 따른 패들 이동 (화면 밖으로 나가지 않도록 제한)
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 6;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 6;
    }

    // (7) 공 위치 갱신
    x += dx;
    y += dy;

    // (8) 진행 중이면 다음 프레임 예약 (브라우저 주사율에 맞춰 반복)
    if (isPlaying) {
        animationId = requestAnimationFrame(draw);
    }
}

// ---------------------------------------------------------------------
// 10. 초기화 / 시작 / 정지 함수
// ---------------------------------------------------------------------

/** 공과 패들을 시작 위치·초기 속도로 되돌림 (점수/벽돌은 유지) */
function resetBallAndPaddle() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
}

/** 게임 전체 초기화: 점수, 목숨, 벽돌, 공, 패들 */
function resetGame() {
    score = 0;
    lives = 3;
    document.getElementById("scoreVal").textContent = score;
    document.getElementById("livesVal").textContent = lives;
    initBricks();
    resetBallAndPaddle();
}

/** 게임 시작 (시작 버튼의 onclick 등에서 호출) */
function startGame() {
    if (!isPlaying) {                       // 중복 실행 방지
        if (lives <= 0) {
            resetGame();                    // 목숨이 없으면 새 게임으로 초기화
        }
        isPlaying = true;
        document.getElementById("startBtn").style.display = "none";  // 버튼 숨김
        draw();                             // 루프 시작
    }
}

/** 게임 정지: 플래그를 끄고 시작 버튼을 다시 표시 */
function stopGame() {
    isPlaying = false;
    document.getElementById("startBtn").textContent = "🎮 게임 시작하기";
    document.getElementById("startBtn").style.display = "block";
}

// ---------------------------------------------------------------------
// 11. 최초 로드 시 실행: 벽돌 생성 후 정지 상태의 첫 화면을 그림
// ---------------------------------------------------------------------
initBricks();
ctx.clearRect(0, 0, canvas.width, canvas.height);
drawBricks();
drawBall();
drawPaddle();
