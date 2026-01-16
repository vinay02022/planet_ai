from sqlalchemy import Column, String, DateTime, Text, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    definition = Column(JSON, nullable=False)  # Stores nodes and edges
    is_valid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Workflow {self.name}>"
