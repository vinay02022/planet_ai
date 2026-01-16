from fastapi import APIRouter

from app.services.llm import LLMService
from app.schemas.llm import LLMRequest, LLMResponse

router = APIRouter()


@router.post("/generate", response_model=LLMResponse)
async def generate_response(request: LLMRequest):
    """Generate a response using the specified LLM."""
    service = LLMService()

    result = await service.generate(
        query=request.query,
        context=request.context,
        system_prompt=request.system_prompt,
        provider=request.provider,
        model=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
    )

    return LLMResponse(**result)
