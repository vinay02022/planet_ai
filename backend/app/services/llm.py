from typing import Optional, Dict, Any
import openai
import google.generativeai as genai

from app.core.config import settings


class LLMService:
    def __init__(self):
        # Initialize OpenAI client
        if settings.OPENAI_API_KEY:
            self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.openai_client = None

        # Initialize Gemini
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)

    async def generate(
        self,
        query: str,
        context: Optional[str] = None,
        system_prompt: Optional[str] = None,
        provider: str = "openai",
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> Dict[str, Any]:
        """Generate a response using the specified LLM."""
        if provider == "openai":
            return await self._generate_openai(
                query, context, system_prompt, model, temperature, max_tokens
            )
        elif provider == "gemini":
            return await self._generate_gemini(
                query, context, system_prompt, model, temperature, max_tokens
            )
        else:
            raise ValueError(f"Unknown LLM provider: {provider}")

    async def _generate_openai(
        self,
        query: str,
        context: Optional[str],
        system_prompt: Optional[str],
        model: Optional[str],
        temperature: float,
        max_tokens: int,
    ) -> Dict[str, Any]:
        """Generate response using OpenAI."""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")

        model = model or settings.OPENAI_CHAT_MODEL

        # Build messages
        messages = []

        # System prompt
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        else:
            messages.append({
                "role": "system",
                "content": "You are a helpful AI assistant. Answer questions accurately and concisely."
            })

        # User message with context
        user_content = query
        if context:
            user_content = f"""Based on the following context, answer the question.

Context:
{context}

Question: {query}

Answer:"""

        messages.append({"role": "user", "content": user_content})

        try:
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

            return {
                "success": True,
                "response": response.choices[0].message.content,
                "provider": "openai",
                "model": model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "provider": "openai",
                "model": model,
            }

    async def _generate_gemini(
        self,
        query: str,
        context: Optional[str],
        system_prompt: Optional[str],
        model: Optional[str],
        temperature: float,
        max_tokens: int,
    ) -> Dict[str, Any]:
        """Generate response using Gemini."""
        if not settings.GOOGLE_API_KEY:
            raise ValueError("Google API key not configured")

        model_name = model or settings.GEMINI_MODEL

        try:
            # Initialize model
            gemini_model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                ),
            )

            # Build prompt
            prompt = ""
            if system_prompt:
                prompt += f"Instructions: {system_prompt}\n\n"

            if context:
                prompt += f"""Based on the following context, answer the question.

Context:
{context}

Question: {query}

Answer:"""
            else:
                prompt += query

            response = gemini_model.generate_content(prompt)

            return {
                "success": True,
                "response": response.text,
                "provider": "gemini",
                "model": model_name,
                "usage": None,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "provider": "gemini",
                "model": model_name,
            }
