from typing import List, Dict, Any
import httpx

from app.core.config import settings


class WebSearchService:
    def __init__(self):
        self.serpapi_key = settings.SERPAPI_KEY
        self.brave_api_key = settings.BRAVE_API_KEY

    async def search(
        self,
        query: str,
        num_results: int = 5,
        provider: str = "serpapi",
    ) -> Dict[str, Any]:
        """Perform web search using the specified provider."""
        if provider == "serpapi":
            return await self._search_serpapi(query, num_results)
        elif provider == "brave":
            return await self._search_brave(query, num_results)
        else:
            raise ValueError(f"Unknown search provider: {provider}")

    async def _search_serpapi(
        self, query: str, num_results: int
    ) -> Dict[str, Any]:
        """Search using SerpAPI."""
        if not self.serpapi_key:
            return {
                "success": False,
                "error": "SerpAPI key not configured",
                "results": [],
            }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://serpapi.com/search",
                    params={
                        "q": query,
                        "api_key": self.serpapi_key,
                        "num": num_results,
                        "engine": "google",
                    },
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()

            results = []
            for item in data.get("organic_results", [])[:num_results]:
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                })

            return {
                "success": True,
                "results": results,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "results": [],
            }

    async def _search_brave(
        self, query: str, num_results: int
    ) -> Dict[str, Any]:
        """Search using Brave Search API."""
        if not self.brave_api_key:
            return {
                "success": False,
                "error": "Brave API key not configured",
                "results": [],
            }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.search.brave.com/res/v1/web/search",
                    params={
                        "q": query,
                        "count": num_results,
                    },
                    headers={
                        "X-Subscription-Token": self.brave_api_key,
                        "Accept": "application/json",
                    },
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()

            results = []
            for item in data.get("web", {}).get("results", [])[:num_results]:
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "snippet": item.get("description", ""),
                })

            return {
                "success": True,
                "results": results,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "results": [],
            }

    def format_search_results_as_context(
        self, results: List[Dict[str, Any]]
    ) -> str:
        """Format search results as context for LLM."""
        if not results:
            return ""

        context_parts = ["Web Search Results:\n"]
        for i, result in enumerate(results, 1):
            context_parts.append(
                f"{i}. {result['title']}\n"
                f"   URL: {result['url']}\n"
                f"   {result['snippet']}\n"
            )

        return "\n".join(context_parts)
