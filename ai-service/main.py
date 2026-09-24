import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from agent import run_agent

load_dotenv()

app = FastAPI(
    title="NOVA Guide AI Agent Microservice",
    description="LangChain & FastAPI Agent Microservice for Guide & Tour Operations",
    version="1.0.0",
)

# Configure CORS Middleware allowing frontend at http://localhost:5173
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "NOVA Guide AI Agent Microservice",
        "chat_endpoint": "POST /agent/chat",
    }


@app.post("/agent/chat", response_model=ChatResponse)
def agent_chat(request: ChatRequest):
    """POST endpoint for user interaction with NOVA Guide AI Agent."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        reply_content = run_agent(request.message.strip())
        return ChatResponse(reply=reply_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Agent error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
