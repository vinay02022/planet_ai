from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=True)
    session_id = Column(String(100), nullable=False)  # For grouping messages
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    metadata = Column(JSON, nullable=True)  # Execution details, timings, etc.
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ChatMessage {self.role}: {self.content[:50]}>"
