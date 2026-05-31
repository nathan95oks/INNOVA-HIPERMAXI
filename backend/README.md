# Backend — HimaxIA (FastAPI + RAG)

Motor del asistente: WebSocket + pipeline RAG (ChromaDB + Gemini) sobre los 6 SOPs de Hipermaxi.

> Para la **arquitectura completa** (qué hace cada módulo, flujo runtime, contrato de mensajes) ver **[`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)**.

---

## Requisitos

- Python 3.11+
- Una **API key de Gemini** (`GEMINI_API_KEY`)
- Los `.docx` de los 6 SOPs en `knowledge/raw/` (ya incluidos)

---

## 1. Instalación

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Configuración (`.env`)

El backend lee el `.env` desde la **raíz del repo** (un nivel arriba de `backend/`):

```bash
# /.env  (en la raíz del proyecto, NO en backend/)
GEMINI_API_KEY=tu_api_key_aqui

# Opcionales (con sus defaults)
VECTOR_STORE_DIR=knowledge/vector_store
RAG_SCORE_THRESHOLD=0.65
RAG_TOP_K=5
DEV_MODE=false
CORS_ORIGINS=*
```

> `.env` está en `.gitignore` — nunca lo subas al repo.

## 3. Ingesta de los SOPs (una vez)

Genera el vector store a partir de los `.docx`. Necesario antes de levantar la API:

```bash
python scripts/ingest.py --source knowledge/raw/ --api-key $GEMINI_API_KEY

# Probar sin indexar (estadísticas de parseo/chunking):
python scripts/ingest.py --source knowledge/raw/ --dry-run

# Procesar un solo SOP:
python scripts/ingest.py --source knowledge/raw/ --sop SOP-05
```

El vector store queda persistido en `knowledge/vector_store/` (gitignored — se regenera con este comando).

## 4. Levantar la API

```bash
uvicorn app.main:app --reload --port 8000
```

Verificar que está lista (debe reportar `chunks > 0`):

```bash
curl http://localhost:8000/health
```

## 5. Probar el retrieval

```bash
python scripts/test_retrieval.py
```

Mide la calidad de la recuperación semántica contra los casos de uso. Resultados esperados y criterio de éxito (score ≥ 0.75) en `../docs/EP-02/EP-02-S05-T04_matriz-cobertura-pruebas-rag.md`.

---

## Endpoints

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/health` | Estado + nº de chunks indexados |
| `POST` | `/ingest` | Ingesta vía HTTP (solo con `DEV_MODE=true`) |
| `WS` | `/ws/chat/{session_id}` | Canal de chat del copiloto |

Contrato de mensajes del WebSocket: ver §5 de [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).

---

## Docker

```bash
docker build -t himaxia-backend .
docker run -p 8000:8000 --env-file ../.env himaxia-backend
```

> El vector store debe existir dentro de la imagen o montarse como volumen; de lo contrario ejecutar la ingesta dentro del contenedor.
