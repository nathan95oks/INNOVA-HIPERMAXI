"""
context_assembler.py — Ensambla el contexto recuperado para inyectarlo
en la llamada a Gemini API.

Responsabilidades:
1. Deduplicar chunks con overlap
2. Expandir contexto con chunks adyacentes (opcional)
3. Ordenar por (sop_code, chunk_index) para coherencia narrativa
4. Formatear con delimitadores XML para separación clara
5. Truncar por presupuesto de tokens si es necesario

El contexto se estructura con etiquetas <contexto_sop> para que
el System Instruction pueda referenciarlas sin ambigüedad.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .vector_store import VectorStoreRepository


@dataclass
class AssembledContext:
    """Contexto listo para inyectar en el prompt de Gemini."""

    formatted_text: str  # Texto formateado con delimitadores XML
    sources: list[dict]  # Referencias para citación
    total_tokens_estimate: int  # Estimación de tokens del contexto
    sop_codes_used: set[str] = field(default_factory=set)  # SOPs involucrados


def assemble_context(
    retrieved_chunks: list[dict],
    max_context_tokens: int = 4000,
    include_adjacent: bool = True,
    vector_store: VectorStoreRepository | None = None,
) -> AssembledContext:
    """
    Ensambla chunks recuperados en un bloque de contexto estructurado.

    Args:
        retrieved_chunks: Chunks devueltos por VectorStoreRepository.search()
        max_context_tokens: Presupuesto máximo de tokens para el contexto
        include_adjacent: Si True, recupera chunks vecinos para más contexto
        vector_store: Referencia al vector store (necesario si include_adjacent)

    Returns:
        AssembledContext listo para inyectar en el prompt
    """
    if not retrieved_chunks:
        return AssembledContext(
            formatted_text="[NO SE ENCONTRÓ INFORMACIÓN RELEVANTE EN LOS SOPs]",
            sources=[],
            total_tokens_estimate=0,
            sop_codes_used=set(),
        )

    # ── 1. Deduplicar por chunk_id ──
    seen_ids: set[str] = set()
    unique_chunks: list[dict] = []
    for chunk in retrieved_chunks:
        if chunk["id"] not in seen_ids:
            seen_ids.add(chunk["id"])
            unique_chunks.append(chunk)

    # ── 2. Expandir con chunks adyacentes ──
    if include_adjacent and vector_store is not None:
        for chunk in list(unique_chunks):
            adjacent = vector_store.get_adjacent_chunks(chunk["id"], window=2)
            for adj in adjacent:
                if adj["id"] not in seen_ids:
                    seen_ids.add(adj["id"])
                    adj["score"] = chunk["score"] * 0.8  # Score reducido
                    unique_chunks.append(adj)

    # ── 3. Ordenar por SOP y posición en el documento ──
    def _sort_key(c: dict) -> tuple[str, int]:
        meta = c.get("metadata", {})
        sop = meta.get("sop_code", "ZZZ")
        # Extraer chunk_index del ID
        try:
            idx = int(c["id"].split("chunk_")[-1])
        except (ValueError, IndexError):
            idx = 999
        return (sop, idx)

    unique_chunks.sort(key=_sort_key)

    # ── 4. Formatear con delimitadores XML ──
    sections: list[str] = []
    sources: list[dict] = []
    sop_codes: set[str] = set()

    for chunk in unique_chunks:
        meta = chunk.get("metadata", {})
        sop_code = meta.get("sop_code", "UNKNOWN")
        section_path = meta.get("section_path", "")
        score = chunk.get("score", 0)

        sop_codes.add(sop_code)

        block = (
            f'<contexto_sop fuente="{sop_code}" '
            f'seccion="{section_path}" '
            f'relevancia="{score}">\n'
            f'{chunk["content"]}\n'
            f"</contexto_sop>"
        )
        sections.append(block)

        sources.append({
            "sop_code": sop_code,
            "section": section_path,
            "score": score,
            "chunk_id": chunk["id"],
        })

    formatted = "\n\n".join(sections)

    # ── 5. Estimar tokens y truncar si necesario ──
    # Aproximación: 1 token ≈ 4 caracteres en español
    estimated_tokens = len(formatted) // 4

    if estimated_tokens > max_context_tokens:
        # Reordenar por score descendente y recortar
        scored_pairs = list(zip(sections, sources))
        scored_pairs.sort(key=lambda x: x[1]["score"], reverse=True)

        truncated_sections: list[str] = []
        truncated_sources: list[dict] = []
        running_tokens = 0

        for section_text, source in scored_pairs:
            section_tokens = len(section_text) // 4
            if running_tokens + section_tokens <= max_context_tokens:
                truncated_sections.append(section_text)
                truncated_sources.append(source)
                running_tokens += section_tokens

        formatted = "\n\n".join(truncated_sections)
        sources = truncated_sources
        estimated_tokens = running_tokens

    return AssembledContext(
        formatted_text=formatted,
        sources=sources,
        total_tokens_estimate=estimated_tokens,
        sop_codes_used=sop_codes,
    )
