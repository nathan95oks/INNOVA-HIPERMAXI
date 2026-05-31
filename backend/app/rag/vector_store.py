"""
vector_store.py — Wrapper de ChromaDB para el pipeline RAG.

Persistente en disco para sobrevivir reinicios del contenedor Docker.
Usa similitud coseno y soporta filtrado por sop_code.

Decisión de diseño:
- ChromaDB en modo PersistentClient (no in-memory) para que la colección
  sobreviva reinicios sin re-ejecutar el pipeline de ingesta.
- La operación de upsert es idempotente: si el chunk_id ya existe, lo
  actualiza en lugar de duplicar.
- Método get_adjacent_chunks() permite expandir contexto recuperando
  los chunks vecinos en el orden original del documento.
"""
from __future__ import annotations

import chromadb
from chromadb.config import Settings

from .chunking_service import Chunk
from .embedding_service import IEmbeddingModel


class VectorStoreRepository:
    """
    Gestiona la colección de ChromaDB.
    Persistente en disco, idempotente en escritura.
    """

    COLLECTION_NAME = "hipermaxi_sops"

    def __init__(
        self,
        embedding_model: IEmbeddingModel,
        persist_dir: str = "knowledge/vector_store",
    ):
        self.embedding_model = embedding_model
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={
                "hnsw:space": "cosine",
                "embedding_model": embedding_model.model_name,
            },
        )

    # ──────────────────────────────────────────
    # Write operations
    # ──────────────────────────────────────────

    def upsert_chunks(self, chunks: list[Chunk]) -> int:
        """
        Inserta o actualiza chunks en la colección.
        Idempotente: si el chunk_id ya existe, lo actualiza.

        Returns:
            Número de chunks insertados/actualizados.
        """
        if not chunks:
            return 0

        # Generar embeddings en batch
        texts = [chunk.content for chunk in chunks]
        embeddings = self.embedding_model.embed_texts(texts)

        # Preparar datos para ChromaDB
        ids = [chunk.chunk_id for chunk in chunks]
        metadatas: list[dict] = []
        for chunk in chunks:
            meta = {**chunk.metadata}
            # ChromaDB no soporta listas en metadata → serializar con pipe
            if "image_paths" in meta and isinstance(meta["image_paths"], list):
                meta["image_paths"] = "|".join(meta["image_paths"])
            metadatas.append(meta)

        # Upsert en batch (idempotente por chunk_id)
        self.collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        return len(ids)

    def delete_by_sop(self, sop_code: str) -> None:
        """Elimina todos los chunks de un SOP específico (para re-ingesta)."""
        self.collection.delete(where={"sop_code": sop_code})

    # ──────────────────────────────────────────
    # Read operations
    # ──────────────────────────────────────────

    def search(
        self,
        query: str,
        top_k: int = 5,
        score_threshold: float = 0.75,
        filter_sop: str | None = None,
    ) -> list[dict]:
        """
        Búsqueda semántica por similitud coseno.

        Args:
            query: Texto de búsqueda del usuario
            top_k: Máximo de resultados
            score_threshold: Similitud mínima (0-1). Chunks debajo se descartan.
            filter_sop: Si se especifica, filtra por sop_code

        Returns:
            Lista de dicts con: id, content, metadata, score
            Ordenada por score descendente.
        """
        query_embedding = self.embedding_model.embed_query(query)

        where_filter = None
        if filter_sop:
            where_filter = {"sop_code": filter_sop}

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )

        # ChromaDB retorna distances (coseno); convertir a similarity
        # Para espacio coseno: similarity = 1 - distance
        output: list[dict] = []
        if not results["ids"] or not results["ids"][0]:
            return output

        for i in range(len(results["ids"][0])):
            distance = results["distances"][0][i]
            similarity = 1 - distance

            if similarity >= score_threshold:
                output.append({
                    "id": results["ids"][0][i],
                    "content": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "score": round(similarity, 4),
                })

        return output

    def get_adjacent_chunks(
        self,
        chunk_id: str,
        window: int = 1,
    ) -> list[dict]:
        """
        Recupera chunks adyacentes para expandir contexto.
        Útil cuando el proveedor está en un paso y necesita
        el paso anterior/siguiente.

        Args:
            chunk_id: ID del chunk central (ej: "SOP-05::chunk_3")
            window: Número de chunks a cada lado (default: 1)

        Returns:
            Lista de dicts con: id, content, metadata
        """
        # Parsear sop_code y chunk_index del ID
        try:
            parts = chunk_id.split("::")
            sop_code = parts[0]
            chunk_idx = int(parts[1].replace("chunk_", ""))
        except (IndexError, ValueError):
            return []

        adjacent_ids = [
            f"{sop_code}::chunk_{chunk_idx + offset}"
            for offset in range(-window, window + 1)
            if offset != 0 and chunk_idx + offset >= 0
        ]

        if not adjacent_ids:
            return []

        try:
            results = self.collection.get(
                ids=adjacent_ids,
                include=["documents", "metadatas"],
            )
            return [
                {
                    "id": results["ids"][i],
                    "content": results["documents"][i],
                    "metadata": results["metadatas"][i],
                }
                for i in range(len(results["ids"]))
            ]
        except Exception:
            return []

    # ──────────────────────────────────────────
    # Info
    # ──────────────────────────────────────────

    def count(self) -> int:
        """Retorna el total de chunks en la colección."""
        return self.collection.count()
