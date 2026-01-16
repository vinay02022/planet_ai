from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class DocumentCreate(BaseModel):
    filename: str


class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    status: str
    chunk_count: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentList(BaseModel):
    documents: List[DocumentResponse]
    total: int
