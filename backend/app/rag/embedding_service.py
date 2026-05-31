"""
embedding_service.py — Genera embeddings con Gemini text-embedding-004.

Usa el Strategy Pattern (IEmbeddingModel) para permitir intercambiar
el modelo sin cambiar el resto del pipeline. La implementación por
defecto usa Gemini API con task_type diferenciado para documentos vs queries.

Decisión de diseño:
- Se usa text-embedding-004 (Gemini) en lugar de nomic-embed-text (Ollama)
  para eliminar la necesidad de levantar un servicio Ollama en Docker.
- Si se necesita cambiar a otro proveedor, implementar IEmbeddingModel
  y pasarlo al VectorStoreRepository.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from google import genai
from google.genai import types


# ──────────────────────────────────────────────
# Interfaz abstracta (Strategy Pattern)
# ──────────────────────────────────────────────

class IEmbeddingModel(ABC):
    """Interfaz para intercambiar modelos de embeddings."""

    @abstractmethod
    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Genera embeddings para una lista de textos (documentos)."""
        ...

    @abstractmethod
    def embed_query(self, query: str) -> list[float]:
        """Genera embedding para un query de búsqueda."""
        ...

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Nombre del modelo para registro en metadata."""
        ...

    @property
    @abstractmethod
    def dimensions(self) -> int:
        """Dimensiones del vector de embedding."""
        ...


# ──────────────────────────────────────────────
# Implementación: Gemini text-embedding-004
# ──────────────────────────────────────────────

class GeminiEmbeddingModel(IEmbeddingModel):
    """
    Embeddings vía Gemini API gemini-embedding-001 (nuevo SDK google-genai).

    Usa task_type diferenciado:
    - RETRIEVAL_DOCUMENT para indexar chunks (ingesta)
    - RETRIEVAL_QUERY para queries de búsqueda (runtime)

    Esto mejora la calidad del retrieval porque el modelo
    optimiza el embedding según el contexto de uso.
    """

    _MODEL_ID = "gemini-embedding-001"
    _DIMENSIONS = 768
    _BATCH_SIZE = 100  # Máximo de textos por request a la API

    def __init__(self, api_key: str):
        self._client = genai.Client(api_key=api_key)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """
        Genera embeddings para documentos en batches.
        Usa task_type=RETRIEVAL_DOCUMENT.
        """
        all_embeddings: list[list[float]] = []

        for i in range(0, len(texts), self._BATCH_SIZE):
            batch = texts[i : i + self._BATCH_SIZE]
            result = self._client.models.embed_content(
                model=self._MODEL_ID,
                contents=batch,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_DOCUMENT",
                    output_dimensionality=self._DIMENSIONS,
                ),
            )
            for emb in result.embeddings:
                all_embeddings.append(emb.values)

        return all_embeddings

    def embed_query(self, query: str) -> list[float]:
        """
        Genera embedding para un query de búsqueda.
        Usa task_type=RETRIEVAL_QUERY.
        """
        result = self._client.models.embed_content(
            model=self._MODEL_ID,
            contents=query,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY",
                output_dimensionality=self._DIMENSIONS,
            ),
        )
        return result.embeddings[0].values

    @property
    def model_name(self) -> str:
        return "gemini-embedding-001"

    @property
    def dimensions(self) -> int:
        return self._DIMENSIONS
