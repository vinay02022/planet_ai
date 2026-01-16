from fastapi import APIRouter
from .documents import router as documents_router
from .workflows import router as workflows_router
from .llm import router as llm_router
from .search import router as search_router
from .chat import router as chat_router

api_router = APIRouter()

api_router.include_router(documents_router, prefix="/documents", tags=["Documents"])
api_router.include_router(workflows_router, prefix="/workflows", tags=["Workflows"])
api_router.include_router(llm_router, prefix="/llm", tags=["LLM"])
api_router.include_router(search_router, prefix="/search", tags=["Search"])
api_router.include_router(chat_router, prefix="/chat", tags=["Chat"])
