# EP-SALVAVIDAS — Copiloto Contextual Mock

**Objetivo asociado:** Implementar un prototipo funcional del copiloto capaz de leer el estado del DOM del portal, detectar intenciones del proveedor y responder con acciones UI (highlight + tooltip) en tiempo real, usando un mock server para garantizar latencia controlada en el pitch.
**Estado:** In Progress — correcciones UI en Bloque Final
**Bloque:** Bloque 4 (Dom 00:00 – 05:30)
**Responsable principal:** Luis (BetoHerbas)
**Contexto:** El enfoque de integración widget↔backend-real (FastAPI + Gemini + ChromaDB) no era viable en el tiempo restante del Bloque 4. EP-SALVAVIDAS reemplaza esa integración con un mock server contextual que demuestra el comportamiento del agente con fidelidad suficiente para el pitch.

---

## Decisión que originó esta épica

**ADR-SALVAVIDAS-01 (31/05/2026 ~00:00):** Reemplazar la integración con el backend real por un mock server con comportamiento predecible. El pipeline Gemini + WebSocket FastAPI tenía latencia real de 2–4s y el payload de acciones copiloto no conectaba de forma estable con el widget. La demo en vivo requería latencia controlada (700–1300ms) y respuestas 100% predecibles.

---

## Stories & Sub-tasks

### EP-SALVAVIDAS-S01 — Mock server contextual

**Responsable:** Luis (BetoHerbas)

**Criterio de aceptación:** El mock server detecta la intención del mensaje, lee el contexto de página enviado desde el widget, y responde con una secuencia de `agent_response` + `copilot_action` relevante al estado real del formulario que el proveedor tiene en pantalla. Cubre los flujos de carga de factura y carga de producto. Latencia de primer mensaje ≤ 700ms.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-SALVAVIDAS-S01-T01 | `buildPageContext()` en `app.jsx` — inspecciona el DOM en tiempo real y serializa el estado de formularios activos antes de enviar el mensaje al servidor | Done — `widget/src/app.jsx` (commit 09dfcea) |
| EP-SALVAVIDAS-S01-T02 | `buildDoubtFlow(context)` en mock server — detecta intención de duda y resalta el primer issue del contexto de página con highlight + tooltip + explicación | Done — `widget/mock/mock_server.js` (commit 09dfcea) |
| EP-SALVAVIDAS-S01-T03 | `buildInvoiceCopilotFlow(context)` en mock server — detecta intención de carga de factura y adapta la respuesta según la página activa | Done — `widget/mock/mock_server.js` (commit 09dfcea) |
| EP-SALVAVIDAS-S01-T04 | `sendDynamicFlow(ws, messages)` — envío escalonado con delay incremental (700ms + i×650ms) para simular razonamiento del agente | Done — `widget/mock/mock_server.js` (commit 09dfcea) |
| EP-SALVAVIDAS-S01-T05 | Launcher anti-solapamiento `maybeMoveLauncherAwayFromTarget(el)` — desplaza el botón flotante cuando el elemento resaltado está en la esquina inferior derecha | Done — `widget/src/app.jsx` + `widget/src/styles/widget.css` (commit 09dfcea) |
| EP-SALVAVIDAS-S01-T06 | Copilot UI actions: `highlight`, `navigate`, `show_alert` — acciones que el agente puede ejecutar sobre el DOM del portal | Done — `widget/src/app.jsx` (commit be12451) |
| EP-SALVAVIDAS-S01-T07 | Historial de conversación (últimas 5 msgs), detección de FAQ, smart page context adjunto al payload | Done — `widget/src/app.jsx` + `widget/mock/mock_server.js` (commit e315041) |
| EP-SALVAVIDAS-S01-T08 | Escalación a soporte humano con contact card — cuando el mock no reconoce la intención después de 2 intentos, muestra área de contacto correspondiente | Done — `widget/mock/mock_server.js` + `widget/src/components/MessageList.jsx` (commit 85c63b6) |

---

## Páginas del portal mock cubiertas

| Página | Issues detectados por `buildPageContext()` | Acciones del copiloto |
|---|---|---|
| `productos.html` | Descripción vacía, código de barra vacío, etiqueta vacía, imagen no cargada | Highlight campo problemático + tooltip + navegación a factura.html |
| `factura.html` | Factura no adjuntada, formato no PDF | Highlight `#zona-cargar-factura` → `#btn-carga-completada` |
| `index.html` | Usuario vacío, contraseña vacía | Highlight `#usuario` + focus |

---

## Commits de referencia

| Commit | Descripción | Autor |
|---|---|---|
| `09dfcea` | Copiloto base: `buildPageContext`, `buildDoubtFlow`, `buildInvoiceCopilotFlow`, launcher anti-solapamiento | Luis (BetoHerbas) |
| `357af73` | Documentación del commit 09dfcea | Diego |
| `be12451` | Copilot UI actions: highlight, navigate, show_alert | Luis (BetoHerbas) |
| `e315041` | Conversation history, FAQ detection, smart page context | Luis (BetoHerbas) |
| `85c63b6` | Escalación a soporte humano con contact card | Luis (BetoHerbas) |

---

## Entregables

- `docs/EP-SALVAVIDAS/EP-SALVAVIDAS-S01-T01_copiloto-contextual-mock.md` — documentación técnica completa
- `widget/mock/mock_server.js` — mock server con comportamiento contextual
- `widget/src/app.jsx` — widget con `buildPageContext`, copilot actions, historial y escalación

---

*Documento generado: 31 de mayo 2026 · Innova Hack Santa Cruz 2026*
*Mantenido por: Diego (Product Owner)*
