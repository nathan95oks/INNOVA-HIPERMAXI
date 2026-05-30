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

import google.generativeai as genai


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
    Embeddings vía Gemini API text-embedding-004.

    Usa task_type diferenciado:
    - RETRIEVAL_DOCUMENT para indexar chunks (ingesta)
    - RETRIEVAL_QUERY para queries de búsqueda (runtime)

    Esto mejora la calidad del retrieval porque el modelo
    optimiza el embedding según el contexto de uso.
    """

    _MODEL_ID = "models/text-embedding-004"
    _DIMENSIONS = 768
    _BATCH_SIZE = 100  # Máximo de textos por request a la API

    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """
        Genera embeddings para documentos en batches.
        Usa task_type=RETRIEVAL_DOCUMENT.
        """
        all_embeddings: list[list[float]] = []

        for i in range(0, len(texts), self._BATCH_SIZE):
            batch = texts[i : i + self._BATCH_SIZE]
            result = genai.embed_content(
                model=self._MODEL_ID,
                content=batch,
                task_type="RETRIEVAL_DOCUMENT",
            )
            # embed_content retorna un dict con "embedding"
            # Para un solo texto retorna list[float],
            # para multiples retorna list[list[float]]
            embeddings = result["embedding"]
            if isinstance(embeddings[0], float):
                # Solo un texto en el batch
                all_embeddings.append(embeddings)
            else:
                all_embeddings.extend(embeddings)

        return all_embeddings

    def embed_query(self, query: str) -> list[float]:
        """
        Genera embedding para un query de búsqueda.
        Usa task_type=RETRIEVAL_QUERY.
        """
        result = genai.embed_content(
            model=self._MODEL_ID,
            content=query,
            task_type="RETRIEVAL_QUERY",
        )
        return result["embedding"]

    @property
    def model_name(self) -> str:
        return "text-embedding-004"

    @property
    def dimensions(self) -> int:
        return self._DIMENSIONS
