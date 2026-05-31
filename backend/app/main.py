"""
main.py — FastAPI app con WebSocket para el Copiloto Virtual de Hipermaxi.

Endpoints:
  GET  /health          — Health check + estado del vector store
  POST /ingest          — Trigger de ingesta (solo en modo dev)
  WS   /ws/chat/{sid}  — Canal de chat del copiloto (WebSocket)

Flujo del WebSocket:
  1. Cliente envía  {"message": "..."}
  2. Backend sanitiza el input
  3. Backend recupera contexto RAG
  4. Backend llama a Gemini con contexto inyectado
  5. Backend valida y envía respuesta JSON

Protocolo de mensajes WebSocket:
  Entrada:  {"message": str, "session_id": str}
  Salida:   {"mensaje": str, "accion_ui": {...}, "sop_referencia": str,
             "requiere_escalamiento": bool, "confianza": float,
             "sources": [...], "alerts": [...]}
"""
from __future__ import annotations

import json
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

# Cargar .env desde el directorio del proyecto (un nivel arriba de /backend)
load_dotenv(Path(__file__).parent.parent.parent / ".env")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .gemini_client import CopilotGeminiClient
from .rag.context_assembler import assemble_context
from .rag.embedding_service import GeminiEmbeddingModel
from .rag.query_rewriter import QueryRewriter
from .rag.vector_store import VectorStoreRepository
from .security.input_sanitizer import InputSanitizer
from .security.output_guardrail import OutputGuardrail
from .security.system_instruction import SYSTEM_INSTRUCTION

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Config desde variables de entorno
# ──────────────────────────────────────────────

GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
VECTOR_STORE_DIR: str = os.environ.get("VECTOR_STORE_DIR", "knowledge/vector_store")
SCORE_THRESHOLD: float = float(os.environ.get("RAG_SCORE_THRESHOLD", "0.65"))
TOP_K: int = int(os.environ.get("RAG_TOP_K", "5"))
MAX_HISTORY_TURNS: int = 6  # Últimos 6 mensajes (3 pares user/assistant)

# ──────────────────────────────────────────────
# Shared services (inicializados en lifespan)
# ──────────────────────────────────────────────

_embedding_model: GeminiEmbeddingModel | None = None
_vector_store: VectorStoreRepository | None = None
_gemini_client: CopilotGeminiClient | None = None
_query_rewriter: QueryRewriter | None = None
_sanitizer = InputSanitizer()
_guardrail = OutputGuardrail()

# Historial de conversación por session_id (en memoria; suficiente para MVP)
_sessions: dict[str, list[dict]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializa y cierra los servicios compartidos."""
    global _embedding_model, _vector_store, _gemini_client, _query_rewriter

    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY no configurada — el copiloto no funcionará")
    else:
        _embedding_model = GeminiEmbeddingModel(api_key=GEMINI_API_KEY)
        _vector_store = VectorStoreRepository(
            embedding_model=_embedding_model,
            persist_dir=VECTOR_STORE_DIR,
        )
        _gemini_client = CopilotGeminiClient(
            api_key=GEMINI_API_KEY,
            system_instruction=SYSTEM_INSTRUCTION,
        )
        _query_rewriter = QueryRewriter(api_key=GEMINI_API_KEY)
        chunks_count = _vector_store.count()
        logger.info(
            "Servicios inicializados. Vector store: %d chunks en '%s'",
            chunks_count,
            VECTOR_STORE_DIR,
        )

    yield

    # Cleanup (ChromaDB no requiere cierre explícito)
    logger.info("Apagando aplicación")


# ──────────────────────────────────────────────
# FastAPI app
# ──────────────────────────────────────────────

app = FastAPI(
    title="Copiloto Virtual Hipermaxi",
    description="Motor RAG para el Portal de Proveedores de Hipermaxi",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# HTTP Endpoints
# ──────────────────────────────────────────────

@app.get("/health")
async def health_check() -> dict[str, Any]:
    """Health check con estado del vector store."""
    chunks_count = _vector_store.count() if _vector_store else 0
    return {
        "status": "ok",
        "vector_store": {
            "chunks": chunks_count,
            "ready": chunks_count > 0,
        },
        "gemini_configured": bool(GEMINI_API_KEY),
    }


class IngestRequest(BaseModel):
    source_dir: str
    max_tokens: int = 400
    overlap_tokens: int = 50


@app.post("/ingest")
async def trigger_ingest(req: IngestRequest) -> dict[str, Any]:
    """
    Lanza el pipeline de ingesta de documentos .docx.
    Solo disponible en modo desarrollo (DEV_MODE=true).
    """
    if os.environ.get("DEV_MODE", "false").lower() != "true":
        raise HTTPException(status_code=403, detail="Ingesta solo disponible en modo dev")

    if not _vector_store or not _embedding_model:
        raise HTTPException(status_code=503, detail="Servicios no inicializados")

    from pathlib import Path
    from .rag.document_parser import parse_docx
    from .rag.chunking_service import chunk_document

    source_path = Path(req.source_dir)
    if not source_path.exists():
        raise HTTPException(status_code=404, detail=f"Directorio no encontrado: {req.source_dir}")

    docx_files = list(source_path.glob("*.docx"))
    if not docx_files:
        raise HTTPException(status_code=404, detail="No se encontraron archivos .docx")

    results = []
    total_chunks = 0

    for docx_path in docx_files:
        doc = parse_docx(docx_path)
        chunks = chunk_document(doc, max_tokens=req.max_tokens, overlap_tokens=req.overlap_tokens)
        count = _vector_store.upsert_chunks(chunks)
        total_chunks += count
        results.append({
            "file": docx_path.name,
            "sop_code": doc.sop_code,
            "sections": len(doc.sections),
            "chunks_indexed": count,
        })

    return {"total_chunks": total_chunks, "documents": results}


# ──────────────────────────────────────────────
# WebSocket Chat
# ──────────────────────────────────────────────

@app.websocket("/ws/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """
    Canal de chat del copiloto.

    Protocolo de mensajes:
      Entrada: {"message": str}
      Salida:  {"mensaje": str, "accion_ui": {...}, "sop_referencia": str,
                "requiere_escalamiento": bool, "confianza": float,
                "sources": [...], "alerts": [...]}
      Error:   {"error": str}
    """
    await websocket.accept()
    logger.info("Nueva sesión WebSocket: %s", session_id)

    # Inicializar historial de sesión
    if session_id not in _sessions:
        _sessions[session_id] = []

    try:
        while True:
            # ── Recibir mensaje ──
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
                user_message = payload.get("message", "").strip()
            except (json.JSONDecodeError, AttributeError):
                await websocket.send_text(
                    json.dumps({"error": "Formato de mensaje inválido. Se esperaba JSON con campo 'message'."})
                )
                continue

            if not user_message:
                await websocket.send_text(
                    json.dumps({"error": "El mensaje no puede estar vacío."})
                )
                continue

            # ── Capa 1: Sanitizar input ──
            clean_message, alerts = _sanitizer.sanitize(user_message)

            if alerts:
                logger.warning(
                    "Sesión %s — alertas de seguridad: %s",
                    session_id,
                    alerts,
                )

            # ── Capa 2: RAG Retrieval (multi-query) ──
            if _vector_store is None or _gemini_client is None:
                await websocket.send_text(
                    json.dumps({
                        "error": "El copiloto no está disponible. Verifique la configuración del servidor."
                    })
                )
                continue

            # Reformular la consulta en variantes con vocabulario de SOPs
            queries = _query_rewriter.rewrite(clean_message) if _query_rewriter else [clean_message]

            # Buscar con cada variante y fusionar por score más alto
            best_by_id: dict[str, dict] = {}
            for q in queries:
                for r in _vector_store.search(q, top_k=TOP_K, score_threshold=SCORE_THRESHOLD):
                    if r["id"] not in best_by_id or r["score"] > best_by_id[r["id"]]["score"]:
                        best_by_id[r["id"]] = r

            retrieved = sorted(best_by_id.values(), key=lambda x: x["score"], reverse=True)[:TOP_K * 2]

            # Fallback: si el retrieval no encontró nada, usar top-3 sin umbral
            # y dejar que Gemini evalúe si son relevantes
            if not retrieved:
                logger.info("Sesión %s — sin resultados sobre umbral, usando fallback sin threshold", session_id)
                fallback = _vector_store.search(clean_message, top_k=3, score_threshold=0.0)
                retrieved = fallback

            context = assemble_context(
                retrieved_chunks=retrieved,
                include_adjacent=True,
                vector_store=_vector_store,
            )

            # ── Generación: Llamada a Gemini ──
            conversation_history = _sessions[session_id][-MAX_HISTORY_TURNS:]

            try:
                raw_response = _gemini_client.generate_response(
                    user_message=clean_message,
                    context=context,
                    conversation_history=conversation_history,
                )
            except Exception as exc:
                logger.error("Error en Gemini API: %s", exc, exc_info=True)
                await websocket.send_text(
                    json.dumps({
                        "error": "Error al procesar tu consulta. Por favor intenta de nuevo."
                    })
                )
                continue

            # ── Capa 3: Output Guardrails ──
            validated_response, is_valid = _guardrail.validate(raw_response)

            if not is_valid:
                logger.warning(
                    "Sesión %s — respuesta de Gemini no pasó guardrails",
                    session_id,
                )

            # Enriquecer con metadata de fuentes y alertas
            validated_response["sources"] = context.sources
            validated_response["alerts"] = alerts if alerts else []

            # ── Actualizar historial de conversación ──
            _sessions[session_id].append({
                "role": "user",
                "content": clean_message,
            })
            _sessions[session_id].append({
                "role": "model",
                "content": validated_response["mensaje"],
            })

            # Limitar tamaño del historial en memoria
            if len(_sessions[session_id]) > 20:
                _sessions[session_id] = _sessions[session_id][-20:]

            # ── Enviar respuesta ──
            await websocket.send_text(json.dumps(validated_response, ensure_ascii=False))

    except WebSocketDisconnect:
        logger.info("Sesión %s desconectada", session_id)
        # Limpiar historial de sesión al desconectarse
        _sessions.pop(session_id, None)
    except Exception as exc:
        logger.error(
            "Error inesperado en sesión %s: %s",
            session_id,
            exc,
            exc_info=True,
        )
        try:
            await websocket.send_text(
                json.dumps({"error": "Error interno del servidor."})
            )
        except Exception:
            pass
