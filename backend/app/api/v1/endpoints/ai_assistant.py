import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.ai_assistant import ChatRequest
from app.schemas.common import SuccessResponse
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["ai-assistant"])


@router.post("/chat")
async def chat(
    data: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    messages = [{"role": m.role, "content": m.content} for m in data.messages]
    return StreamingResponse(ai_service.stream_chat(db, messages), media_type="text/event-stream")


@router.post("/insights/{department_id}", response_model=SuccessResponse[str])
async def generate_insights(
    department_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    insights = await ai_service.generate_insights(db, department_id)
    return SuccessResponse(data=insights)
