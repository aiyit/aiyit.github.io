// 배포 후 실제 FastAPI 주소로 변경하세요.
// 예: https://aiyit-chatbot.onrender.com
const API_BASE_URL = "https://YOUR-BACKEND-DOMAIN";

const messages = document.getElementById("chatMessages");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const history = [];

function addMessage(role, text) {
  const row = document.createElement("div");
  row.className = "msg " + role;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  row.appendChild(bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

function addWelcome() {
  addMessage("bot",
    "안녕하세요! 👋\n여주대학교 AI소프트웨어과 AI 상담원입니다.\n\n학과, 교육과정, 입학, 졸업 후 진로 등에 대해 질문해 주세요.");
}

async function sendMessage(question) {
  const text = question.trim();
  if (!text || sendButton.disabled) return;

  addMessage("user", text);
  input.value = "";
  sendButton.disabled = true;
  sendButton.textContent = "답변 중…";

  history.push({ role: "user", content: text });

  try {
    const response = await fetch(API_BASE_URL + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: history.slice(-10) })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "서버 오류");

    addMessage("bot", data.answer);
    history.push({ role: "assistant", content: data.answer });
  } catch (error) {
    addMessage("bot",
      "현재 AI 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.\n\n개발자 확인: " + error.message);
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "전송";
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll("#quickButtons button").forEach(button => {
  button.addEventListener("click", () => sendMessage(button.dataset.question));
});

addWelcome();
