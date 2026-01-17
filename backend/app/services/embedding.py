import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Optional, Dict, Any
import openai
import google.generativeai as genai
import os

from app.core.config import settings


class EmbeddingService:
    def __init__(self):
        # Initialize ChromaDB client
        # Use HTTP client if CHROMA_HOST is set, otherwise use persistent local storage
        if settings.CHROMA_HOST:
            self.chroma_client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True,
                )
            )
        else:
            # Use persistent local storage for cloud deployment
            os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(
                path=settings.CHROMA_PERSIST_DIR,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True,
                )
            )
        self.collection_name = settings.CHROMA_COLLECTION_NAME

        # Initialize OpenAI client
        if settings.OPENAI_API_KEY:
            self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.openai_client = None

        # Initialize Gemini
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)

    def _get_or_create_collection(self):
        """Get or create the ChromaDB collection."""
        return self.chroma_client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    async def generate_embeddings(
        self, texts: List[str], model: str = "openai"
    ) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        if model == "openai":
            return await self._openai_embeddings(texts)
        elif model == "gemini":
            return await self._gemini_embeddings(texts)
        else:
            raise ValueError(f"Unknown embedding model: {model}")

    async def _openai_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI."""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")

        response = self.openai_client.embeddings.create(
            model=settings.OPENAI_EMBEDDING_MODEL,
            input=texts,
        )
        return [item.embedding for item in response.data]

    async def _gemini_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Gemini."""
        if not settings.GOOGLE_API_KEY:
            raise ValueError("Google API key not configured")

        embeddings = []
        for text in texts:
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document",
            )
            embeddings.append(result["embedding"])
        return embeddings

    async def store_document_chunks(
        self,
        document_id: str,
        document_name: str,
        chunks: List[str],
        model: str = "openai",
    ) -> int:
        """Store document chunks with their embeddings in ChromaDB."""
        if not chunks:
            return 0

        collection = self._get_or_create_collection()

        # Generate embeddings
        embeddings = await self.generate_embeddings(chunks, model)

        # Prepare data for ChromaDB
        ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {"document_id": document_id, "document_name": document_name, "chunk_index": i}
            for i in range(len(chunks))
        ]

        # Add to collection
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
        )

        return len(chunks)

    async def search_similar(
        self,
        query: str,
        document_ids: Optional[List[str]] = None,
        top_k: int = 5,
        model: str = "openai",
    ) -> List[Dict[str, Any]]:
        """Search for similar chunks in ChromaDB."""
        collection = self._get_or_create_collection()

        # Generate query embedding
        query_embedding = await self.generate_embeddings([query], model)

        # Build where filter
        where_filter = None
        if document_ids:
            where_filter = {"document_id": {"$in": document_ids}}

        # Search
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )

        # Format results
        formatted_results = []
        if results and results["documents"]:
            for i, doc in enumerate(results["documents"][0]):
                formatted_results.append({
                    "content": doc,
                    "document_id": results["metadatas"][0][i]["document_id"],
                    "document_name": results["metadatas"][0][i]["document_name"],
                    "score": 1 - results["distances"][0][i],  # Convert distance to similarity
                })

        return formatted_results

    async def delete_document(self, document_id: str) -> bool:
        """Delete all chunks for a document from ChromaDB."""
        try:
            collection = self._get_or_create_collection()
            # Delete by metadata filter
            collection.delete(where={"document_id": document_id})
            return True
        except Exception:
            return False
