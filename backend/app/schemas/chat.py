from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class ChatMessageCreate(BaseModel):
    session_id: str
    role: str  # user, assistant
    content: str
    workflow_id: Optional[UUID] = None
    metadata: Optional[Dict[str, Any]] = None


class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: str
    role: str
    content: str
    workflow_id: Optional[UUID]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistory(BaseModel):
    messages: List[ChatMessageResponse]
    session_id: str
