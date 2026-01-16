from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
import uuid

from app.db.database import get_db
from app.models.chat import ChatMessage
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse, ChatHistory

router = APIRouter()


@router.post("/messages", response_model=ChatMessageResponse)
async def create_message(
    message: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Save a chat message."""
    db_message = ChatMessage(
        session_id=message.session_id,
        role=message.role,
        content=message.content,
        workflow_id=message.workflow_id,
        metadata=message.metadata,
    )

    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)

    return db_message


@router.get("/sessions/{session_id}", response_model=ChatHistory)
async def get_chat_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get chat history for a session."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = result.scalars().all()

    return ChatHistory(messages=messages, session_id=session_id)


@router.delete("/sessions/{session_id}")
async def clear_chat_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Clear chat history for a session."""
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id)
    )
    messages = result.scalars().all()

    for message in messages:
        await db.delete(message)

    await db.commit()

    return {"message": "Chat history cleared"}


@router.get("/sessions", response_model=List[str])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    """List all chat sessions."""
    from sqlalchemy import distinct

    result = await db.execute(
        select(distinct(ChatMessage.session_id))
    )
    sessions = [row[0] for row in result.fetchall()]

    return sessions
