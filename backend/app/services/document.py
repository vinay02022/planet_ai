import os
import uuid
import fitz  # PyMuPDF
from typing import List, Optional
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.document import Document, DocumentStatus
from app.core.config import settings
from app.services.embedding import EmbeddingService


class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.embedding_service = EmbeddingService()

    async def upload_document(self, file: UploadFile) -> Document:
        """Upload and save a document."""
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        # Save file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # Create document record
        document = Document(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=len(content),
            mime_type=file.content_type or "application/pdf",
            status=DocumentStatus.PENDING,
        )

        self.db.add(document)
        await self.db.commit()
        await self.db.refresh(document)

        return document

    async def process_document(self, document_id: str) -> Document:
        """Process a document: extract text, create chunks, and generate embeddings."""
        # Get document
        result = await self.db.execute(
            select(Document).where(Document.id == document_id)
        )
        document = result.scalar_one_or_none()

        if not document:
            raise ValueError(f"Document {document_id} not found")

        try:
            # Update status
            document.status = DocumentStatus.PROCESSING
            await self.db.commit()

            # Extract text
            text = self._extract_text(document.file_path)

            # Create chunks
            chunks = self._create_chunks(text)

            # Generate embeddings and store in ChromaDB
            chunk_count = await self.embedding_service.store_document_chunks(
                document_id=str(document.id),
                document_name=document.original_filename,
                chunks=chunks,
            )

            # Update document
            document.status = DocumentStatus.READY
            document.chunk_count = chunk_count
            await self.db.commit()
            await self.db.refresh(document)

            return document

        except Exception as e:
            document.status = DocumentStatus.ERROR
            document.error_message = str(e)
            await self.db.commit()
            raise

    def _extract_text(self, file_path: str) -> str:
        """Extract text from PDF using PyMuPDF."""
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            raise ValueError(f"Failed to extract text: {str(e)}")
        return text

    def _create_chunks(
        self, text: str, chunk_size: int = 1000, overlap: int = 200
    ) -> List[str]:
        """Split text into overlapping chunks."""
        if not text:
            return []

        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size

            # Find a good break point (end of sentence or paragraph)
            if end < text_length:
                # Look for paragraph break
                break_point = text.rfind("\n\n", start, end)
                if break_point == -1:
                    # Look for sentence break
                    break_point = text.rfind(". ", start, end)
                if break_point != -1 and break_point > start:
                    end = break_point + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - overlap

        return chunks

    async def get_document(self, document_id: str) -> Optional[Document]:
        """Get a document by ID."""
        result = await self.db.execute(
            select(Document).where(Document.id == document_id)
        )
        return result.scalar_one_or_none()

    async def get_all_documents(self) -> List[Document]:
        """Get all documents."""
        result = await self.db.execute(select(Document).order_by(Document.created_at.desc()))
        return result.scalars().all()

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and its embeddings."""
        document = await self.get_document(document_id)
        if not document:
            return False

        # Delete from ChromaDB
        await self.embedding_service.delete_document(document_id)

        # Delete file
        if os.path.exists(document.file_path):
            os.remove(document.file_path)

        # Delete from database
        await self.db.delete(document)
        await self.db.commit()

        return True
