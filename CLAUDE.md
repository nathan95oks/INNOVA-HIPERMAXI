# HimaxIA — Asistente Virtual de Soporte para Proveedores de Hipermaxi
**Innova Hack Santa Cruz 2026**

Agente de IA embebido en el Portal Web de Proveedores de Hipermaxi (https://portal.hipermaxi.com/) que resuelve consultas operativas y guía procesos paso a paso en dos modalidades: **Consulta** (respuestas en lenguaje natural) y **Copiloto** (guía activa sobre el DOM del portal).

---

## Comandos esenciales

```bash
# Widget (directorio: widget/)
npm run dev        # servidor de desarrollo con HMR
npm run build      # bundle de producción → widget/dist/
npm run mock       # mock WebSocket server para pruebas sin backend real
npm run preview    # previsualiza el bundle compilado
```

> Todos los comandos se ejecutan desde `widget/`. No hay comandos en la raíz del repo.

---

## Estructura del proyecto

```
INNOVA-HIPERMAXI/
├── CLAUDE.md              ← Este archivo
├── docs/
│   ├── README.md          ← Guía completa de la documentación (leer antes de tocar docs/)
│   ├── base_problem_files/ ← SOPs reales de Hipermaxi — NO modificar
│   ├── planning/          ← Backlog Scrum por épica — actualizar al cerrar cada épica
│   ├── EP-01/             ← Entregables completados de EP-01 (referencia de estructura)
│   ├── EP-02/             ← Entregables del pipeline RAG
│   └── EP-SALVAVIDAS/     ← Copiloto contextual mock — Bloque 4 (completado)
└── widget/                ← Código fuente del widget (EP-04)
    ├── src/
    │   ├── components/    ← ChatLauncher, ChatWindow, ConfirmModal, InputBar, MessageList, TypingIndicator
    │   ├── lib/           ← WebSocketClient.js
    │   ├── styles/        ← widget.css (todo bajo selector #hx-widget)
    │   └── main.jsx       ← punto de entrada, monta el widget en el DOM
    ├── mock/              ← mock_server.js — servidor WebSocket para desarrollo local
    ├── dist/              ← bundle compilado (generado por `npm run build`)
    └── index.html         ← página de prueba con Bootstrap 3.3.7 + jQuery (replica el portal)
```

---

## Arquitectura del widget

El widget se inyecta en el portal de Hipermaxi via `<script src="widget.js">`. El portal corre sobre **ASP.NET + jQuery + Bootstrap 3.3.7** — el widget no modifica ese código.

```
widget-bundle (Preact + Vite)
    ├── ChatLauncher       — botón flotante toggle
    ├── ChatWindow         — contenedor del chat
    │     ├── MessageList  — historial de mensajes
    │     ├── InputBar     — campo de texto + envío
    │     └── TypingIndicator
    ├── CopilotOverlay
    │     ├── HighlightHelper  — resalta elementos del DOM del portal por selector CSS
    │     └── ConfirmModal     — confirmación human-in-the-loop (OBLIGATORIA antes de acciones irreversibles)
    └── WebSocketClient    — conexión persistente con el backend (FastAPI)
```

**Contrato de mensajes WebSocket** (acordado con EP-03 backend):
```json
{ "type": "user_message" | "agent_response" | "copilot_action", "payload": {} }
```

---

## Reglas no negociables

1. **Todos los estilos del widget van bajo `#hx-widget`** — evita colisiones con Bootstrap 3.3.7 del portal.
2. **El ConfirmModal aparece SIEMPRE antes de acciones irreversibles** (confirmar AVD, enviar factura, guardar producto). No hay excepciones.
3. **No modificar nada en `docs/base_problem_files/`** — son los documentos originales de Hipermaxi.
4. **El bundle compilado debe ser < 150KB (gzip)** — usar Preact, no React.
5. **No usar Socket.io** — WebSockets nativos son suficientes para el MVP.

---

## Documentación: qué leer y cuándo

| Necesidad | Archivo |
|---|---|
| Entender qué pide Hipermaxi | `docs/base_problem_files/transcripcion_desafio_hipermaxi.md` |
| Lógica de negocio de cualquier proceso | `docs/base_problem_files/<SOP>.md` (fuente de verdad) |
| Estado global del proyecto y épicas | `docs/planning/propuesta-equipo-almuerzo.md` |
| Qué hacer en EP-04 (widget) | `docs/planning/EP-04_widget-embebido.md` |
| Qué hacer en EP-09 (modelo de negocio) | `docs/planning/EP-09_modelo-de-negocio.md` |
| Cómo nombrar y organizar entregables | `docs/README.md` |
| Ejemplo de entregables bien estructurados | `docs/EP-01/` |

**Mapa SOP → Nivel del asistente:**

| SOP | Nivel | Módulo del portal |
|---|---|---|
| SOP-SR-01, SOP-SR-03 | Nivel 1 — Público (sin sesión) | Pantalla de login |
| SOP-SR-02, SOP-04 | Nivel 2 — Privado Base | Portal autenticado / Catálogo |
| SOP-05, SOP-06 | Nivel 3 — Transaccional | Compras / Facturas / AVD |

---

## Equipo y responsabilidades

| Persona | Rol | Épicas activas |
|---|---|---|
| Diego | Product Owner | EP-09 (Modelo de Negocio), coordinación pitch |
| Melina | UI/UX + Scrum Master | EP-04-S01 (diseño), slides del pitch |
| Carla | Frontend | EP-04 (widget — implementación) |
| Adrián | Backend | EP-03 (Agente IA), EP-06 (derivación soporte) |
| Luis | Backend | EP-02 (RAG), EP-03, EP-08 (costos) |
| Nathanael | Backend / Infra | EP-02, EP-03, EP-05 (integración portal) |

---

## Convención de nombrado de entregables

```
docs/EP-{epic}/EP-{epic}-S{story}-T{task}_{descripcion-kebab-case}.{ext}

Ejemplo: docs/EP-01/EP-01-S02-T01_diagrama-flujo-as-is.md
```

Al completar una épica: actualizar `docs/planning/EP-XX_*.md` (estados a `Done`) y `propuesta-equipo-almuerzo.md` (emoji de estado a ✅).
