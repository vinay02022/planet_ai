from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.db.database import get_db
from app.services.document import DocumentService
from app.schemas.document import DocumentResponse, DocumentList

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document and process it in the background."""
    # Validate file type
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: PDF, DOCX"
        )

    service = DocumentService(db)

    # Upload document
    document = await service.upload_document(file)

    # Process in background
    background_tasks.add_task(
        process_document_task,
        document_id=str(document.id),
        db_url=str(db.bind.url) if db.bind else None,
    )

    return document


async def process_document_task(document_id: str, db_url: str = None):
    """Background task to process document."""
    from app.db.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        service = DocumentService(db)
        try:
            await service.process_document(document_id)
        except Exception as e:
            print(f"Error processing document {document_id}: {e}")


@router.get("", response_model=DocumentList)
async def list_documents(db: AsyncSession = Depends(get_db)):
    """List all documents."""
    service = DocumentService(db)
    documents = await service.get_all_documents()
    return DocumentList(documents=documents, total=len(documents))


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a document by ID."""
    service = DocumentService(db)
    document = await service.get_document(str(document_id))

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a document."""
    service = DocumentService(db)
    success = await service.delete_document(str(document_id))

    if not success:
        raise HTTPException(status_code=404, detail="Document not found")

    return {"message": "Document deleted successfully"}


@router.post("/{document_id}/reprocess", response_model=DocumentResponse)
async def reprocess_document(
    document_id: UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Reprocess a document."""
    service = DocumentService(db)
    document = await service.get_document(str(document_id))

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Process in background
    background_tasks.add_task(
        process_document_task,
        document_id=str(document_id),
    )

    return document
