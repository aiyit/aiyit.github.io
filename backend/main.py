import os
from typing import List, Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")

if not API_KEY:
    raise RuntimeError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")

client = OpenAI(api_key=API_KEY)

app = FastAPI(
    title="여주대학교 AI소프트웨어과 AI 상담원 API",
    version="1.0.0"
)

ALLOWED_ORIGINS = [
    "https://ai.yit.ac.kr",
    "https://aiyit.github.io",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
)

SYSTEM_PROMPT = """
당신은 여주대학교 AI소프트웨어과 홈페이지의 공식 AI 상담원입니다.

답변 원칙:
1. 한국어로 쉽고 정확하게 답합니다.
2. AI소프트웨어과와 관련된 질문에는 학과 안내를 우선합니다.
3. 확인되지 않은 입학전형, 모집인원, 장학금 금액, 등록금, 취업률 등의 수치를 임의로 만들지 않습니다.
4. 현재 제공된 정보만으로 확정할 수 없는 내용은 '공식 모집요강 또는 학교 공지를 확인해야 합니다'라고 안내합니다.
5. 질문이 학과와 무관하면 간단히 답하고, 필요하면 학과 관련 질문으로 유도합니다.
6. 개인정보, 비밀번호, API 키 등의 민감정보를 요구하거나 저장하지 않습니다.
7. 답변은 지나치게 길지 않게 하되, 학생이 이해하기 쉽도록 핵심을 구조화합니다.

현재 홈페이지에서 확인 가능한 학과 개요:
- 여주대학교 AI소프트웨어과
- 인공지능, 소프트웨어 기초, 데이터 분석, 웹/앱 개발, AI 융합 서비스 등을 실무 중심으로 교육
- Python 프로그래밍, AI 개념, 3D/VR 콘텐츠 및 디지털 트윈 관련 실습 자료가 홈페이지에 제공됨
- 홈페이지에는 AI 개념, 3D 시뮬레이션, 반도체 공정, 전기 배전반 3D 시뮬레이션 등의 학습 콘텐츠가 있음

중요:
학과 홈페이지에 명시되지 않은 구체적인 입시 조건이나 장학금 정보는 추측하지 마십시오.
"""

class HistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: Optional[List[HistoryItem]] = None

class ChatResponse(BaseModel):
    answer: str

@app.get("/api/health")
def health():
    return {"status": "ok", "model": MODEL}

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        input_messages = [{"role": "developer", "content": SYSTEM_PROMPT}]

        if request.history:
            input_messages.extend(
                {"role": item.role, "content": item.content}
                for item in request.history[-10:]
            )
        else:
            input_messages.append({"role": "user", "content": request.message})

        # history가 전달되더라도 마지막 사용자 질문이 누락되지 않도록 보정
        if not input_messages or input_messages[-1].get("content") != request.message:
            input_messages.append({"role": "user", "content": request.message})

        response = client.responses.create(
            model=MODEL,
            input=input_messages
        )

        answer = response.output_text.strip()
        if not answer:
            raise HTTPException(status_code=502, detail="AI가 빈 답변을 반환했습니다.")

        return ChatResponse(answer=answer)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI 서버 오류: {str(exc)}")
