from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("")
async def chat(req: ChatRequest):
    from backend.services.ai_engine import ai_engine
    from backend.services.graph_engine import graph_engine
    return ai_engine.chat_response(req.message, graph_engine)
