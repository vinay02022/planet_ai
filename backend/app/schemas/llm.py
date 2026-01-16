from pydantic import BaseModel
from typing import Optional, List


class LLMRequest(BaseModel):
    query: str
    context: Optional[str] = None
    system_prompt: Optional[str] = None
    provider: str = "openai"  # openai or gemini
    model: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 2000


class LLMResponse(BaseModel):
    success: bool
    response: Optional[str] = None
    error: Optional[str] = None
    provider: str
    model: str
    usage: Optional[dict] = None
