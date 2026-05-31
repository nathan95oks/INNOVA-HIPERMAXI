"""
ingest.py — Ejecuta el pipeline completo: parse → chunk → embed → store.

Uso:
    python scripts/ingest.py --source knowledge/raw/ --api-key $GEMINI_API_KEY

Opciones:
    --source        Directorio con archivos .docx
    --api-key       Gemini API key (o usar variable GEMINI_API_KEY)
    --persist-dir   Directorio de persistencia de ChromaDB (default: knowledge/vector_store)
    --max-tokens    Máximo de tokens por chunk (default: 400)
    --overlap       Tokens de overlap entre sub-chunks (default: 50)
    --sop           Si se especifica, solo procesa ese SOP (ej: SOP-05)
    --dry-run       Parsea y muestra estadísticas sin indexar
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

# Agregar el directorio raíz del backend al path para imports
_BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(_BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(_BACKEND_DIR.parent / ".env")

from app.rag.document_parser import parse_docx
from app.rag.chunking_service import chunk_document
from app.rag.embedding_service import GeminiEmbeddingModel
from app.rag.vector_store import VectorStoreRepository


def _print_separator(char: str = "─", width: int = 60) -> None:
    print(char * width)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Pipeline de ingesta RAG para SOPs de Hipermaxi",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--source",
        required=True,
        help="Directorio con archivos .docx",
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("GEMINI_API_KEY", ""),
        help="Gemini API key (default: variable de entorno GEMINI_API_KEY)",
    )
    parser.add_argument(
        "--persist-dir",
        default="knowledge/vector_store",
        help="Directorio de persistencia ChromaDB (default: knowledge/vector_store)",
    )
    parser.add_argument(
        "--max-tokens",
        type=int,
        default=400,
        help="Máximo de tokens por chunk (default: 400)",
    )
    parser.add_argument(
        "--overlap",
        type=int,
        default=50,
        help="Tokens de overlap entre sub-chunks (default: 50)",
    )
    parser.add_argument(
        "--sop",
        default=None,
        help="Procesar solo un SOP específico (ej: SOP-05)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parsea y muestra estadísticas sin indexar en ChromaDB",
    )
    args = parser.parse_args()

    # Validar API key (no requerida en dry-run)
    if not args.dry_run and not args.api_key:
        print("❌ Se requiere --api-key o la variable de entorno GEMINI_API_KEY")
        sys.exit(1)

    source_dir = Path(args.source)
    if not source_dir.exists():
        print(f"❌ Directorio no encontrado: {source_dir}")
        sys.exit(1)

    docx_files = sorted(source_dir.glob("*.docx"))
    if not docx_files:
        print(f"❌ No se encontraron archivos .docx en {source_dir}")
        sys.exit(1)

    print(f"📄 Encontrados {len(docx_files)} documentos .docx")
    if args.dry_run:
        print("   [DRY RUN — no se indexará en ChromaDB]")

    # Inicializar servicios (solo si no es dry-run)
    vector_store: VectorStoreRepository | None = None
    if not args.dry_run:
        embedding_model = GeminiEmbeddingModel(api_key=args.api_key)
        vector_store = VectorStoreRepository(
            embedding_model=embedding_model,
            persist_dir=args.persist_dir,
        )
        print(f"   Modelo: {embedding_model.model_name}")
        print(f"   Persistencia: {args.persist_dir}")

    total_chunks = 0
    processed = 0
    errors = 0

    for docx_path in docx_files:
        _print_separator()
        print(f"📖 Procesando: {docx_path.name}")

        try:
            # ── Fase 1: Parse ──
            doc = parse_docx(docx_path)
            print(f"   SOP: {doc.sop_code} — {doc.title}")
            print(f"   Secciones extraídas: {len(doc.sections)}")

            # Filtrar por SOP si se especificó
            if args.sop and doc.sop_code != args.sop:
                print(f"   ⏭ Saltando (--sop={args.sop})")
                continue

            # ── Fase 2: Chunk ──
            chunks = chunk_document(
                doc,
                max_tokens=args.max_tokens,
                overlap_tokens=args.overlap,
            )
            token_counts = [c.token_count for c in chunks]
            print(f"   Chunks generados: {len(chunks)}")
            print(
                f"   Tokens: min={min(token_counts)}, "
                f"max={max(token_counts)}, "
                f"avg={sum(token_counts) // len(token_counts)}"
            )

            # Mostrar muestra de chunks en dry-run
            if args.dry_run:
                print("   Muestra de chunks:")
                for chunk in chunks[:3]:
                    preview = chunk.content[:80].replace("\n", " ")
                    print(f"     [{chunk.chunk_id}] {preview}...")
                if len(chunks) > 3:
                    print(f"     ... y {len(chunks) - 3} más")
                total_chunks += len(chunks)
                processed += 1
                continue

            # ── Fase 3: Embed + Store ──
            assert vector_store is not None
            count = vector_store.upsert_chunks(chunks)
            print(f"   ✅ {count} chunks indexados en ChromaDB")
            total_chunks += count
            processed += 1

        except Exception as exc:
            print(f"   ❌ Error procesando {docx_path.name}: {exc}")
            errors += 1
            continue

    _print_separator("═")
    action = "analizados" if args.dry_run else "indexados"
    print(f"🎯 Pipeline completado:")
    print(f"   Documentos procesados: {processed}/{len(docx_files)}")
    print(f"   Chunks {action}: {total_chunks}")
    if errors:
        print(f"   ⚠ Errores: {errors}")
    if not args.dry_run:
        print(f"   Colección: {VectorStoreRepository.COLLECTION_NAME}")
        print(f"   Persistencia: {args.persist_dir}")


if __name__ == "__main__":
    main()
