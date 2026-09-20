# AI소프트웨어과 AI 상담원 - FastAPI Backend

## 1. 설치

Python 3.11 이상 권장.

    cd backend
    python -m venv .venv

Windows:

    .venv\Scripts\activate

설치:

    pip install -r requirements.txt

## 2. API Key 설정

.env.example을 복사해서 .env를 만들고 API Key를 입력합니다.

    OPENAI_API_KEY=...
    OPENAI_MODEL=gpt-5.6-luna

주의: .env 파일은 GitHub에 올리지 마십시오.

## 3. 실행

    uvicorn main:app --reload --host 0.0.0.0 --port 8000

확인:

    http://127.0.0.1:8000/api/health

## 4. 프론트엔드 연결

chatbot/chatbot.js의 API_BASE_URL을 다음처럼 설정합니다.

    const API_BASE_URL = "http://127.0.0.1:8000";

실제 배포 후에는 FastAPI 서버의 HTTPS 주소로 변경합니다.

## 5. 구조

GitHub Pages는 정적 HTML/CSS/JavaScript를 제공하고,
FastAPI 서버가 OpenAI API를 호출합니다.

브라우저에 OpenAI API Key를 넣지 않는 것이 핵심입니다.
