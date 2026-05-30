"""
chunking_service.py — Fragmentación semántica que respeta la jerarquía del SOP.

Estrategia:
- UNIDAD BASE = Sección del parser (ParsedSection)
- Si sección > MAX_TOKENS (400): split por párrafos con overlap
- Si sección < MIN_TOKENS (80): merge con la siguiente del mismo padre
- Cada chunk lleva metadata con su ruta jerárquica completa

Nunca parte un paso por la mitad. Enriquece cada chunk con su ruta
jerárquica para que el LLM pueda citar la fuente exacta.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import tiktoken

from .document_parser import ParsedDocument, ParsedSection

# Tokenizador para conteo preciso (compatible con la mayoría de modelos)
_ENCODER = tiktoken.get_encoding("cl100k_base")


# ──────────────────────────────────────────────
# Data Model
# ──────────────────────────────────────────────

@dataclass
class Chunk:
    """Fragmento indexable con contexto jerárquico completo."""

    chunk_id: str  # "{sop_code}::chunk_{index}"
    document_id: str  # sop_code del documento padre
    chunk_index: int  # Posición ordinal dentro del SOP
    content: str  # Texto del fragmento
    token_count: int  # Tokens contados con tiktoken
    metadata: dict = field(default_factory=dict)
    # metadata keys:
    #   sop_code: str
    #   section_heading: str
    #   section_path: str          — "Etapa 1 > Paso 3 > Verificar código"
    #   parent_heading: str | None
    #   has_images: bool
    #   image_paths: list[str]
    #   is_split: bool             — True si el chunk es parte de una sección dividida
    #   is_merged: bool            — True si el chunk combina secciones pequeñas
    #   split_part: int            — Índice de la parte dentro de la sección dividida


# ──────────────────────────────────────────────
# Internal helpers
# ──────────────────────────────────────────────

def _count_tokens(text: str) -> int:
    """Cuenta tokens usando tiktoken (cl100k_base)."""
    return len(_ENCODER.encode(text))


def _build_section_path(section: ParsedSection) -> str:
    """Construye la ruta jerárquica: 'Etapa 1 > Paso 3 > Sub-paso a)'."""
    parts: list[str] = []
    if section.parent_heading:
        parts.append(section.parent_heading)
    parts.append(section.heading)
    return " > ".join(parts)


def _section_to_text(section: ParsedSection, include_heading: bool = True) -> str:
    """Convierte una sección en texto con formato preservado."""
    lines: list[str] = []
    if include_heading:
        prefix = "#" * min(section.level, 3)
        lines.append(f"{prefix} {section.heading}")
    lines.extend(section.content)
    return "\n".join(lines)


def _build_chunk(
    sop_code: str,
    index: int,
    content: str,
    token_count: int,
    section: ParsedSection,
    extra_metadata: Optional[dict] = None,
) -> Chunk:
    """Factoría de Chunk con metadata estandarizada."""
    meta = {
        "sop_code": sop_code,
        "section_heading": section.heading,
        "section_path": _build_section_path(section),
        "parent_heading": section.parent_heading,
        "has_images": bool(section.images),
        "image_paths": section.images,
    }
    if extra_metadata:
        meta.update(extra_metadata)
    return Chunk(
        chunk_id=f"{sop_code}::chunk_{index}",
        document_id=sop_code,
        chunk_index=index,
        content=content,
        token_count=token_count,
        metadata=meta,
    )


def _split_large_section(
    section: ParsedSection,
    sop_code: str,
    max_tokens: int,
    overlap_tokens: int,
    start_index: int,
) -> list[Chunk]:
    """
    Divide una sección que excede max_tokens en sub-chunks por párrafo.
    Garantiza overlap semántico entre chunks consecutivos.
    Siempre incluye el heading como prefijo de contexto.
    """
    chunks: list[Chunk] = []
    paragraphs = section.content
    section_path = _build_section_path(section)

    # Siempre incluir el heading como contexto en cada sub-chunk
    heading_prefix = f"[{sop_code}] {section_path}\n"
    heading_tokens = _count_tokens(heading_prefix)
    available_tokens = max_tokens - heading_tokens

    current_paragraphs: list[str] = []
    current_tokens = 0

    for para in paragraphs:
        para_tokens = _count_tokens(para)

        if current_tokens + para_tokens > available_tokens and current_paragraphs:
            # Emitir chunk actual
            content = heading_prefix + "\n".join(current_paragraphs)
            chunks.append(_build_chunk(
                sop_code=sop_code,
                index=start_index + len(chunks),
                content=content,
                token_count=_count_tokens(content),
                section=section,
                extra_metadata={"is_split": True, "split_part": len(chunks)},
            ))

            # Overlap: mantener los últimos N tokens de párrafos
            overlap_paras: list[str] = []
            overlap_count = 0
            for prev_para in reversed(current_paragraphs):
                prev_tokens = _count_tokens(prev_para)
                if overlap_count + prev_tokens > overlap_tokens:
                    break
                overlap_paras.insert(0, prev_para)
                overlap_count += prev_tokens

            current_paragraphs = overlap_paras
            current_tokens = overlap_count

        current_paragraphs.append(para)
        current_tokens += para_tokens

    # Último sub-chunk
    if current_paragraphs:
        content = heading_prefix + "\n".join(current_paragraphs)
        chunks.append(_build_chunk(
            sop_code=sop_code,
            index=start_index + len(chunks),
            content=content,
            token_count=_count_tokens(content),
            section=section,
            extra_metadata={"is_split": True, "split_part": len(chunks)},
        ))

    return chunks


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

def chunk_document(
    doc: ParsedDocument,
    max_tokens: int = 400,
    min_tokens: int = 80,
    overlap_tokens: int = 50,
) -> list[Chunk]:
    """
    Fragmenta un ParsedDocument en chunks semánticos.

    Reglas:
    1. Cada sección → 1 chunk (si cabe en max_tokens)
    2. Sección grande → split por párrafos con overlap
    3. Sección pequeña → merge con la siguiente del mismo padre
    4. Cada chunk lleva su ruta jerárquica como metadata

    Args:
        doc: Documento parseado
        max_tokens: Máximo de tokens por chunk (default: 400)
        min_tokens: Mínimo de tokens para un chunk independiente (default: 80)
        overlap_tokens: Tokens de overlap entre sub-chunks (default: 50)

    Returns:
        Lista ordenada de Chunks con metadata enriquecida
    """
    chunks: list[Chunk] = []
    pending_merge: ParsedSection | None = None

    for section in doc.sections:
        # ── Intentar merge con sección pendiente ──
        if pending_merge is not None:
            combined_text = (
                _section_to_text(pending_merge)
                + "\n"
                + _section_to_text(section)
            )
            combined_tokens = _count_tokens(combined_text)

            same_parent = (
                pending_merge.parent_heading == section.parent_heading
            )

            if combined_tokens <= max_tokens and same_parent:
                # Merge exitoso: combinar contenido
                pending_merge.content.extend(
                    [f"## {section.heading}"] + section.content
                )
                pending_merge.images.extend(section.images)

                if combined_tokens >= min_tokens:
                    # Ya es suficiente, emitir
                    content = _section_to_text(pending_merge)
                    chunks.append(_build_chunk(
                        sop_code=doc.sop_code,
                        index=len(chunks),
                        content=content,
                        token_count=combined_tokens,
                        section=pending_merge,
                        extra_metadata={"is_merged": True},
                    ))
                    pending_merge = None
                # else: seguir acumulando en pending_merge
                continue
            else:
                # No se puede combinar: emitir la pendiente tal cual
                content = _section_to_text(pending_merge)
                chunks.append(_build_chunk(
                    sop_code=doc.sop_code,
                    index=len(chunks),
                    content=content,
                    token_count=_count_tokens(content),
                    section=pending_merge,
                ))
                pending_merge = None

        # ── Procesar la sección actual ──
        text = _section_to_text(section)
        tokens = _count_tokens(text)

        if tokens > max_tokens:
            # Sección grande → split por párrafos
            sub_chunks = _split_large_section(
                section, doc.sop_code, max_tokens, overlap_tokens, len(chunks)
            )
            chunks.extend(sub_chunks)
        elif tokens < min_tokens:
            # Sección pequeña → marcar para merge con la siguiente
            pending_merge = section
        else:
            # Tamaño óptimo → emitir directamente
            chunks.append(_build_chunk(
                sop_code=doc.sop_code,
                index=len(chunks),
                content=text,
                token_count=tokens,
                section=section,
            ))

    # Emitir cualquier sección pendiente de merge que haya quedado
    if pending_merge is not None:
        content = _section_to_text(pending_merge)
        chunks.append(_build_chunk(
            sop_code=doc.sop_code,
            index=len(chunks),
            content=content,
            token_count=_count_tokens(content),
            section=pending_merge,
        ))

    return chunks
