# Arquitectura Técnica — HimaxIA
**Innova Hack Santa Cruz 2026 · Asistente Virtual para Proveedores de Hipermaxi**

> Mapa técnico maestro del proyecto. Su objetivo es que **cualquier persona pueda continuar el desarrollo** sabiendo qué hace cada parte del código, cómo se conectan, cómo levantar el sistema y qué quedó pendiente.
>
> - Para la **lógica de negocio** (qué pide Hipermaxi, los SOPs) → `docs/base_problem_files/`.
> - Para el **estado de cada épica y el backlog** → `docs/planning/`.
> - Para los **entregables documentales** por épica → `docs/EP-XX/`.
> - Para la **arquitectura del código** (este documento) → seguí leyendo.

---

## 1. Vista general

HimaxIA es un asistente de IA embebido en el Portal Web de Proveedores de Hipermaxi. Se compone de **tres piezas de código** independientes:

```
┌─────────────────────────────────────────────────────────────────────┐
│  PORTAL DE HIPERMAXI (ASP.NET + jQuery + Bootstrap 3.3.7)             │
│  — no lo controlamos; el widget se inyecta vía <script src="...">     │
│                                                                       │
│   ┌─────────────────────────────┐                                     │
│   │  widget/  (Preact + Vite)   │  ← EP-04 · frontend embebido        │
│   │  - ChatLauncher / ChatWindow│                                     │
│   │  - CopilotOverlay (highlight)│                                    │
│   │  - WebSocketClient          │                                     │
│   └──────────────┬──────────────┘                                     │
└──────────────────┼────────────────────────────────────────────────────┘
                   │  WebSocket (JSON)
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  backend/  (FastAPI + Python)        ← EP-02 (RAG) + EP-03 (Agente)   │
│                                                                       │
│   WebSocket  /ws/chat/{session_id}                                    │
│       │                                                               │
│       ├─ 1. InputSanitizer        (security/)  — anti prompt-injection│
│       ├─ 2. QueryRewriter         (rag/)       — variantes de consulta │
│       ├─ 3. VectorStore.search    (rag/)       — ChromaDB, coseno      │
│       ├─ 4. assemble_context      (rag/)       — arma contexto RAG     │
│       ├─ 5. CopilotGeminiClient   — Gemini 2.5 Flash, JSON estructurado│
│       └─ 6. OutputGuardrail       (security/)  — valida la respuesta   │
└─────────────────────────────────────────────────────────────────────┘
                   ▲
                   │  pipeline de ingesta (offline, una vez)
┌──────────────────┴────────────────────────────────────────────────────┐
│  knowledge/raw/*.docx  →  parse → chunk → embed → ChromaDB              │
│  (los 6 SOPs oficiales de Hipermaxi)                                   │
└─────────────────────────────────────────────────────────────────────┘

frontend/index.html  → maqueta HTML independiente (referencia de diseño)
```

| Pieza | Carpeta | Stack | Épica(s) | Estado |
|---|---|---|---|---|
| **Widget embebido** | `widget/` | Preact + Vite, WebSocket nativo | EP-04 | ✅ Funcional |
| **Backend / Agente** | `backend/` | FastAPI, ChromaDB, Gemini, Groq | EP-02, EP-03 | 🔄 Funcional, no desplegado |
| **Maqueta de referencia** | `frontend/` | HTML estático | EP-01 (apoyo de diseño) | Referencia |
| **Mock server** | `widget/mock/` | Node `ws` | EP-04 (dev sin backend) | ✅ Funcional |

> ⚠️ **Punto crítico de integración (EP-05):** hoy el widget habla con el **mock server**, no con el backend real. Los contratos de mensajes **no coinciden todavía** — ver §5.

---

## 2. Backend (`backend/`) — EP-02 + EP-03

FastAPI que expone un canal WebSocket. Por cada mensaje del proveedor ejecuta un pipeline RAG y responde con JSON estructurado.

### 2.1 Estructura de archivos

```
backend/
├── app/
│   ├── main.py                  ← FastAPI: endpoints + WebSocket + orquestación del pipeline
│   ├── gemini_client.py         ← Cliente del Copiloto: Gemini 2.5 Flash, salida JSON estructurada
│   ├── chat_client.py           ← Cliente alternativo del Chatbot: Groq (Llama 3.3 70B). *No usado por main.py hoy*
│   ├── rag/
│   │   ├── document_parser.py   ← .docx → ParsedDocument (secciones, pasos, imágenes con hash MD5)
│   │   ├── chunking_service.py  ← secciones → Chunks (≤400 tokens, overlap 50, respeta jerarquía)
│   │   ├── embedding_service.py ← Chunk → vector (Gemini text-embedding-004; Strategy Pattern IEmbeddingModel)
│   │   ├── vector_store.py      ← ChromaDB PersistentClient: upsert idempotente, search coseno, adyacentes
│   │   ├── query_rewriter.py    ← consulta del usuario → 2-3 variantes con vocabulario de SOP (Gemini flash-lite)
│   │   └── context_assembler.py ← fusiona/ordena/trunca chunks → contexto con etiquetas <contexto_sop>
│   └── security/
│       ├── input_sanitizer.py   ← normaliza unicode, trunca, detecta patrones de inyección
│       ├── output_guardrail.py  ← valida campos, SOP conocido, acción válida, anti-leak, XSS, rango confianza
│       └── system_instruction.py← System Instruction blindado (identidad, boundaries, fallback, reglas de negocio)
├── scripts/
│   ├── ingest.py                ← pipeline offline: parse → chunk → embed → store (CLI)
│   └── test_retrieval.py        ← prueba de recuperación semántica (matriz de cobertura, ver EP-02-S05-T04)
├── knowledge/
│   ├── raw/                     ← .docx originales de los 6 SOPs (fuente de la ingesta)
│   ├── images/                  ← imágenes extraídas de los .docx (por SOP)
│   └── vector_store/            ← ChromaDB persistido (gitignored — se regenera con ingest.py)
├── requirements.txt
└── Dockerfile
```

### 2.2 Flujo de una consulta (runtime)

`main.py → websocket_chat()` ejecuta, por cada mensaje:

1. **Recibe** `{"message": "..."}` por el WebSocket.
2. **Sanitiza** (`InputSanitizer.sanitize`) → texto limpio + alertas de seguridad.
3. **Reescribe** la consulta en variantes (`QueryRewriter.rewrite`) para acercar el vocabulario del usuario al de los SOPs.
4. **Recupera** (`VectorStore.search`) con cada variante; fusiona por mayor score. Umbral `RAG_SCORE_THRESHOLD` (0.65). *Fallback:* si nada supera el umbral, top-3 sin umbral.
5. **Ensambla contexto** (`assemble_context`, incluye chunks adyacentes).
6. **Genera** (`CopilotGeminiClient.generate_response`) con contexto + historial de sesión (últimos 6 turnos en memoria).
7. **Valida** la salida (`OutputGuardrail.validate`) y la enriquece con `sources` y `alerts`.
8. **Responde** el JSON y actualiza el historial de la sesión (en memoria, máx. 20 mensajes).

### 2.3 Endpoints

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/health` | Estado del servicio + nº de chunks en el vector store + si Gemini está configurado |
| `POST` | `/ingest` | Dispara la ingesta (solo si `DEV_MODE=true`) |
| `WS` | `/ws/chat/{session_id}` | Canal de chat del copiloto |

### 2.4 Variables de entorno

Se cargan desde un `.env` en la **raíz del repo** (un nivel arriba de `backend/`). Ver `backend/README.md`.

| Variable | Default | Descripción |
|---|---|---|
| `GEMINI_API_KEY` | *(vacío)* | **Requerida.** Sin ella el copiloto no se inicializa. |
| `VECTOR_STORE_DIR` | `knowledge/vector_store` | Directorio de persistencia de ChromaDB |
| `RAG_SCORE_THRESHOLD` | `0.65` | Umbral mínimo de similitud coseno para aceptar un chunk |
| `RAG_TOP_K` | `5` | Chunks a recuperar por variante de consulta |
| `DEV_MODE` | `false` | Habilita el endpoint `POST /ingest` |
| `CORS_ORIGINS` | `*` | Orígenes permitidos (CSV) |

### 2.5 Notas de diseño relevantes para continuar

- **Dos clientes LLM coexisten:** `gemini_client.py` (el que usa `main.py`) y `chat_client.py` (Groq, alternativo/experimental). Decidir cuál es el oficial antes de desplegar.
- **Historial en memoria:** `_sessions` es un `dict` en RAM. Se pierde al reiniciar y no escala horizontalmente. Para producción → store externo (Redis/DB). Relacionado con **EP-07 (Trazabilidad)**.
- **`embedding_service.py` usa Strategy Pattern** (`IEmbeddingModel`): cambiar de proveedor de embeddings no toca el resto del pipeline.

---

## 3. Widget (`widget/`) — EP-04

Bundle Preact que se inyecta en el portal. Detalle de UI/UX en `widget/DESIGN.md`; reglas de estilo en `CLAUDE.md`.

```
widget/src/
├── main.jsx                 ← monta el widget en #hx-widget e inyecta estilos
├── app.jsx                  ← estado global, WebSocket, dispatcher de acciones de copiloto
├── components/
│   ├── ChatLauncher.jsx     ← botón flotante
│   ├── ChatWindow.jsx       ← ventana de chat (header/body/footer)
│   ├── MessageList.jsx      ← historial de mensajes (incluye tarjeta de escalación)
│   ├── InputBar.jsx         ← input de texto
│   ├── TypingIndicator.jsx  ← "escribiendo..."
│   ├── ConfirmModal.jsx     ← confirmación human-in-the-loop (OBLIGATORIA antes de acciones irreversibles)
│   └── CopilotBubble.jsx    ← estado colapsado del chat mientras hay un elemento resaltado
├── lib/WebSocketClient.js   ← conexión persistente con reconexión
└── styles/widget.css        ← todo bajo #hx-widget (evita colisión con Bootstrap 3.3.7)
```

- **Páginas de prueba** (replican el portal real): `index.html` (login), `landing.html`, `productos.html`, `factura.html`.
- **Copiloto:** `app.jsx` resalta selectores CSS del portal (`hx-highlight`) y muestra tooltips. Es un **demo estático** (pasos pre-mapeados por SOP), no inspección dinámica del DOM — ver ADR-03-01 en `docs/planning/propuesta-equipo-almuerzo.md`.
- **Reglas no negociables:** estilos bajo `#hx-widget`, `ConfirmModal` antes de acciones irreversibles, bundle < 150KB gzip, Preact (no React), WebSocket nativo (no Socket.io).

Comandos (desde `widget/`): `npm run dev`, `npm run build`, `npm run mock`, `npm run preview`. Tests e2e Playwright en `widget/tests/e2e/`.

---

## 4. Mock server (`widget/mock/mock_server.js`) — EP-04

Servidor WebSocket en Node (`ws`) que simula al agente para desarrollar el widget sin backend. Detecta la intención por palabras clave y envía flujos pre-armados (`buildInvoiceCopilotFlow`, `buildEscalationFlow`, etc.) con timing dinámico entre mensajes. **Es la referencia viva del contrato que el widget espera.**

---

## 5. ⚠️ Contrato de mensajes — divergencia mock vs backend real (EP-05)

Hoy hay **dos contratos distintos** y es el principal trabajo de integración pendiente (EP-05):

**a) Widget ↔ Mock server** (`{type, payload}`):
```jsonc
// Widget → servidor
{ "type": "user_message", "payload": { "text": "...", "level": 2, "history": [...], "context": {...} } }
// Servidor → widget
{ "type": "agent_response",  "payload": { "text": "..." } }
{ "type": "copilot_action",  "payload": { "action": "highlight", "target": "#sel", "message": "..." } }
{ "type": "escalation",      "payload": { "text": "...", "contacts": [...] } }
```

**b) Backend real** (`main.py`):
```jsonc
// Widget → backend (esperado)
{ "message": "..." }                          // ruta WS: /ws/chat/{session_id}
// Backend → widget
{ "mensaje": "...", "accion_ui": { "tipo": "highlight", "selector": "#sel", "datos": {} },
  "sop_referencia": "SOP-05", "requiere_escalamiento": false, "confianza": 0.0,
  "sources": [...], "alerts": [...] }
```

**Estado de compatibilidad:** `widget/src/app.jsx → handleServerMessage()` **ya entiende ambos formatos de salida** (detecta `msg.mensaje` para el backend real y `msg.type` para el mock). Lo que falta para EP-05:
1. Alinear el **mensaje de entrada**: el widget envía `{type:"user_message", payload:{text}}`, el backend espera `{message}`.
2. Definir la **ruta WS con `session_id`** en `WebSocketClient.js`.
3. Confirmar el **mapeo de `accion_ui.tipo`** (`highlight` / `show_alert` / `navigate`) que el widget ya dispatcha.

> El planning de EP-03 (`docs/planning/EP-03_agente-ia.md`) documenta el contrato `{type, payload}` como acordado, pero la implementación de `main.py` divergió a `{message}`/`{mensaje}`. **Tomar la implementación real como fuente de verdad** al cerrar EP-05.

---

## 6. Cómo levantar todo el sistema

### Solo widget (desarrollo de UI, sin IA real)
```bash
cd widget
npm install
npm run mock      # terminal 1 — mock WebSocket en ws://localhost:8765
npm run dev       # terminal 2 — http://localhost:5173
```

### Backend real (IA con RAG)
```bash
# 1. Configurar .env en la raíz del repo con GEMINI_API_KEY (ver backend/README.md)
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Ingestar los SOPs una vez (genera el vector store)
python scripts/ingest.py --source knowledge/raw/ --api-key $GEMINI_API_KEY

# 3. Levantar la API
uvicorn app.main:app --reload --port 8000
# Verificar: curl http://localhost:8000/health
```

---

## 7. Mapa épica → código (para continuidad)

| Épica | Estado | Dónde vive el código | Doc de referencia |
|---|---|---|---|
| EP-01 Análisis | ✅ | — (análisis) | `docs/EP-01/` |
| EP-02 Base de Conocimiento (RAG) | ✅ | `backend/app/rag/`, `backend/scripts/` | `docs/EP-02/`, `docs/planning/EP-02_*` |
| EP-03 Agente IA | 🔄 | `backend/app/main.py`, `gemini_client.py`, `security/` | `docs/planning/EP-03_*` |
| EP-04 Widget | ✅ | `widget/` | `docs/EP-04/`, `widget/DESIGN.md` |
| EP-05 Integración portal | 🔒 | **pendiente** — reconciliar contrato (§5) | — |
| EP-06 Derivación a soporte | 🔄 | escalación: mock + `MessageList.jsx`; GLPI real pendiente | `docs/EP-SALVAVIDAS/` |
| EP-07 Trazabilidad | 🔒 | `_sessions` en memoria (`main.py`) — falta persistencia | — |
| EP-08 Costos | 🔒 | — | `docs/planning/EP-09_*` (sección costos) |
| EP-09 Modelo de negocio | 🔄 | — | `docs/EP-09/` |

---

*Última actualización: 2026-05-31 · Mantener este documento al cambiar el contrato WS, las variables de entorno o la estructura del backend.*
