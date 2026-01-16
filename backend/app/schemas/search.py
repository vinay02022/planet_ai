from pydantic import BaseModel
from typing import Optional, List


class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str


class WebSearchRequest(BaseModel):
    query: str
    num_results: int = 5
    provider: str = "serpapi"  # serpapi or brave


class WebSearchResponse(BaseModel):
    success: bool
    results: List[SearchResult] = []
    error: Optional[str] = None


class KnowledgeSearchRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None
    top_k: int = 5


class KnowledgeSearchResult(BaseModel):
    content: str
    document_id: str
    document_name: str
    score: float


class KnowledgeSearchResponse(BaseModel):
    success: bool
    results: List[KnowledgeSearchResult] = []
    error: Optional[str] = None
