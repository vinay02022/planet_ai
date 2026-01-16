from fastapi import APIRouter
from typing import Optional, List

from app.services.search import WebSearchService
from app.services.embedding import EmbeddingService
from app.schemas.search import (
    WebSearchRequest,
    WebSearchResponse,
    SearchResult,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    KnowledgeSearchResult,
)

router = APIRouter()


@router.post("/web", response_model=WebSearchResponse)
async def web_search(request: WebSearchRequest):
    """Perform a web search."""
    service = WebSearchService()

    result = await service.search(
        query=request.query,
        num_results=request.num_results,
        provider=request.provider,
    )

    return WebSearchResponse(
        success=result["success"],
        results=[SearchResult(**r) for r in result.get("results", [])],
        error=result.get("error"),
    )


@router.post("/knowledge", response_model=KnowledgeSearchResponse)
async def knowledge_search(request: KnowledgeSearchRequest):
    """Search in the knowledge base (vector store)."""
    service = EmbeddingService()

    try:
        results = await service.search_similar(
            query=request.query,
            document_ids=request.document_ids,
            top_k=request.top_k,
        )

        return KnowledgeSearchResponse(
            success=True,
            results=[
                KnowledgeSearchResult(
                    content=r["content"],
                    document_id=r["document_id"],
                    document_name=r["document_name"],
                    score=r["score"],
                )
                for r in results
            ],
        )
    except Exception as e:
        return KnowledgeSearchResponse(
            success=False,
            error=str(e),
        )
