from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Workflow Builder API"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/workflow_db"

    # ChromaDB - Use persistent local storage for cloud deployment
    CHROMA_HOST: Optional[str] = None
    CHROMA_PORT: int = 8000
    CHROMA_COLLECTION_NAME: str = "documents"
    CHROMA_PERSIST_DIR: str = "./chroma_data"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"

    # Gemini
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Web Search
    SERPAPI_KEY: str = ""
    BRAVE_API_KEY: str = ""

    # CORS - Add production URLs
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",
    ]

    # Frontend URL for CORS (set in production)
    FRONTEND_URL: Optional[str] = None

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Add frontend URL to CORS if set
if settings.FRONTEND_URL:
    settings.CORS_ORIGINS.append(settings.FRONTEND_URL)

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
