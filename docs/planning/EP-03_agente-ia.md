# EP-03 — Agente IA — Motor Conversacional

**Objetivo asociado:** Implementar el motor que procesa mensajes del proveedor, recupera contexto de la base de conocimiento (EP-02) y responde en lenguaje natural (Modalidad Consulta). La Modalidad Copiloto se entrega como guía estática de demostración para el pitch, con documentación de pruebas para su evolución futura.
**Estado:** In Progress
**Bloque:** Bloque 3 (Sáb 18:00 – 20:30) + Bloque 4 (Sáb 21:00 – Dom 12:00)
**Responsables principales:** Adrián / Luis / Nathanael
**Bloquea:** EP-05 (Integración con el Portal Web), EP-06 (Derivación a Soporte Humano), EP-08 (Costos de Implementación)
**Depende de:** EP-02 — Pipeline RAG completo y endpoint `POST /knowledge/search` operativo

---

## Scope Decision — Cambio de Enfoque (31/05/2026 - 01:22)

> **⚠️ Decisión de alcance activa para el hackathon:**
>
> Presentar el copiloto con interacción real sobre el DOM del portal no es viable en el tiempo restante. El nuevo enfoque divide EP-03 en dos capas:
>
> 1. **Modalidad Consulta** — completamente funcional: RAG + LLM responde preguntas en lenguaje natural, segmentado por los 3 niveles del asistente.
> 2. **Modalidad Copiloto — Demo estático** — el widget lee pasos pre-mapeados por SOP y resalta selectores CSS conocidos del portal. No hay interacción dinámica con el DOM ni inferencia en tiempo real. Suficiente para demostrar el concepto en el pitch.
> 3. **Documentación de pruebas de escalabilidad** — el plan de tests que el equipo ejecutaría para evolucionar del demo al copiloto real. Esto es el argumento de escalabilidad ante el jurado.

---

## Architectural Context

EP-03 implementa la capa de razonamiento del sistema. Consume el pipeline RAG de EP-02 para recuperar contexto relevante y lo envía al LLM junto con el historial de la sesión para generar respuestas. El backend expone una API WebSocket que el widget de EP-04 consume directamente.

```
AgentService (FastAPI)
    ├── ConversationService        — orquesta el flujo consulta: RAG → prompt assembly → LLM
    │     ├── POST /knowledge/search  (EP-02) — recuperación semántica de chunks
    │     └── LLMClient              — llamada al modelo generativo configurado
    ├── CopilotGuideService        — provee pasos estáticos y selectores CSS por SOP
    │     └── GET /copilot/steps/{sop_code} — endpoint consumido por widget EP-04
    ├── EscalationService          — detecta casos fuera del alcance del agente
    │     └── POST /agent/escalate
    └── WebSocketManager           — gestiona conexiones y rutea mensajes al servicio correcto
```

**Contrato de mensajes WebSocket** (acordado con EP-04):
```json
{ "type": "user_message" | "agent_response" | "copilot_action", "payload": {} }
```

**Segmentación por nivel:**

| Nivel | Activación | SOPs en contexto |
|---|---|---|
| Nivel 1 | Widget cargado en pantalla de login (sin sesión) | SOP-SR-01, SOP-SR-03 |
| Nivel 2 | Usuario autenticado, módulo general / catálogo | SOP-SR-02, SOP-04 |
| Nivel 3 | Usuario en módulo de Compras / Facturas / AVD | SOP-05, SOP-06 |

El parámetro `nivel` viaja en cada `user_message` desde el widget. El `ConversationService` filtra los chunks recuperados por `sop_code` correspondiente al nivel antes de armar el prompt.

---

## Stories & Sub-tasks

### EP-03-S01 — Motor conversacional — Modalidad Consulta

**Story Points:** 5
**Responsable:** Adrián / Luis

**Criterio de aceptación:** Dado un mensaje en lenguaje natural y un `nivel` (1, 2 o 3), el sistema recupera los chunks relevantes del vector store (EP-02), ensambla un prompt con contexto y retorna una respuesta coherente con el SOP correspondiente al nivel. Verificado con los 6 casos de uso UC-01 a UC-06. Tiempo de respuesta end-to-end < 5 segundos en el entorno de demo.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-03-S01-T01 | `ConversationService.query(message: str, session_id: str, nivel: int) -> AgentResponse` — orquesta RAG + prompt assembly + LLM call | To Do |
| EP-03-S01-T02 | Integración con `POST /knowledge/search` (EP-02): filtra chunks por `sop_code` según `nivel`, toma top-3 por score | To Do |
| EP-03-S01-T03 | Prompt template: system prompt con instrucciones de rol + contexto RAG + historial de sesión (últimas 3 interacciones) + pregunta del usuario | To Do |
| EP-03-S01-T04 | `LLMClient.complete(prompt: str) -> str` — wrapper configurable; `[TODO: confirmar modelo LLM: Llama 4 local / Qwen vía Ollama / API externa]` | To Do |
| EP-03-S01-T05 | Endpoint `POST /agent/chat` — recibe `{ message: str, session_id: str, nivel: int }`, retorna `{ response: str, sources: List[str] }` | To Do |

---

### EP-03-S02 — Copiloto de demostración — Guía estática por SOP

**Story Points:** 3
**Responsable:** Nathanael

**Criterio de aceptación:** Dado un `sop_code`, el endpoint retorna una lista ordenada de pasos con el selector CSS del elemento del portal que el proveedor debe completar. El widget EP-04 usa estos selectores para activar `HighlightHelper` y resaltar el campo correspondiente. Cubre los 6 SOPs. No requiere LLM ni inferencia — los pasos son datos estáticos definidos a mano a partir de los SOPs reales.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-03-S02-T01 | Mapa estático `SOP_STEPS_MAP`: diccionario `{ sop_code: List[CopilotStep] }` donde cada `CopilotStep` tiene `{ step_index, instruction, css_selector, is_irreversible }` | To Do |
| EP-03-S02-T02 | Mapeo de selectores CSS reales del portal para los 6 SOPs: `[TODO: inspeccionar portal.hipermaxi.com en sesión autenticada para extraer selectores de los formularios]` | To Do |
| EP-03-S02-T03 | `CopilotGuideService.get_steps(sop_code: str) -> List[CopilotStep]` — retorna pasos del mapa estático | To Do |
| EP-03-S02-T04 | Endpoint `GET /copilot/steps/{sop_code}` — retorna `{ sop_code, steps: List[CopilotStep] }` | To Do |
| EP-03-S02-T05 | Integración con EP-04: el widget llama al endpoint al detectar `nivel` = 2 o 3 y activa `HighlightHelper` con los `css_selector` de cada paso | To Do |

---

### EP-03-S03 — WebSocket server y ruteo de mensajes

**Story Points:** 3
**Responsable:** Adrián

**Criterio de aceptación:** El servidor WebSocket acepta conexiones del widget EP-04, rutea mensajes tipo `user_message` al `ConversationService`, y responde con `agent_response` o `copilot_action` según el caso. El contrato de mensajes es el definido en CLAUDE.md. Verificado con 3 escenarios: consulta simple (Nivel 1), guía copiloto (Nivel 2), acción irreversible con alerta (Nivel 3).

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-03-S03-T01 | WebSocket endpoint en FastAPI: `ws://host/ws/{session_id}` — acepta y mantiene conexiones persistentes | To Do |
| EP-03-S03-T02 | Router de mensajes: `user_message` → `ConversationService.query()` → emite `agent_response`; trigger copiloto → emite `copilot_action` con payload de pasos | To Do |
| EP-03-S03-T03 | Payload `copilot_action`: `{ "type": "copilot_action", "payload": { "sop_code": str, "steps": List[CopilotStep], "current_step": int } }` | To Do |
| EP-03-S03-T04 | Test de contrato E2E con `mock_server.js` de EP-04: escenario consulta SOP-SR-01, escenario copiloto SOP-04, escenario acción irreversible SOP-05 | To Do |

---

### EP-03-S04 — Documentación de pruebas para escalabilidad

**Story Points:** 2
**Responsable:** Diego (revisión) / Adrián (redacción técnica)

**Criterio de aceptación:** Documento `docs/EP-03/EP-03-S04-T01_plan-pruebas-escalabilidad.md` que un evaluador externo pueda leer y entender qué validaciones se necesitan para pasar del demo al copiloto real. Cubre: evaluación del pipeline RAG, selección y benchmark del LLM, y pruebas de interacción DOM real. Incluye criterios de éxito medibles (métricas, umbrales) para cada área.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-03-S04-T01 | Plan de pruebas RAG: suite de 10+ queries por nivel (UC-01 a UC-06 + edge cases), métricas objetivo (precision@3, recall, MRR), umbral mínimo de score ≥ 0.75 | To Do |
| EP-03-S04-T02 | Plan de pruebas LLM: criterios de selección de modelo (latencia p95 < 3s, coherencia con SOP, formato de respuesta), comparativa de modelos candidatos `[TODO: Llama 4 vs Qwen vs Gemma — benchmarks de latencia en Ollama local]` | To Do |
| EP-03-S04-T03 | Plan de pruebas Copiloto real: escenarios de DOM interaction para cada SOP (elemento presente, elemento ausente, navegación dinámica con Wijmo), precondiciones de sesión | To Do |
| EP-03-S04-T04 | Roadmap técnico: 4 pasos concretos para evolucionar del demo estático al copiloto real (1. DOM inspector dinámico, 2. LLM con tool calling para acciones, 3. session state sync portal↔widget, 4. ConfirmModal integrado con validación backend) | To Do |

---

### EP-03-S05 — Escalación a soporte humano

**Story Points:** 2
**Responsable:** Adrián

**Criterio de aceptación:** Cuando el agente no puede responder con confianza (score de chunks < 0.6 o intent no reconocido después de 2 intentos), escala al área correspondiente y notifica al widget para mostrar el mensaje de derivación. El área de destino (Compras / Facturación / TI) se determina por el `nivel` activo.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-03-S05-T01 | `EscalationService.should_escalate(chunks: List[ChunkResult], attempt: int) -> bool` — evalúa score y número de intentos | To Do |
| EP-03-S05-T02 | Lógica de destino: Nivel 1 → Soporte TI (soportehub@hipermaxi.com), Nivel 2 → Compras, Nivel 3 → Facturación/Compras según SOP activo | To Do |
| EP-03-S05-T03 | Endpoint `POST /agent/escalate` — recibe `{ session_id, nivel, reason }`, retorna `{ area, contact, message }` | To Do |

---

## Implementation Notes

**Selección del LLM:** `[TODO: confirmar modelo antes de implementar EP-03-S01-T04]`. Candidatos evaluados en EP-01-S04: Llama 4 Scout/Maverick (local vía Ollama), Qwen 2.5 (local), Gemma 3 (local). Criterio de corte para el hackathon: el modelo que levante en < 2 min en el entorno de Nathanael y tenga latencia p95 < 4s para prompts de ~800 tokens. No usar API externa a menos que los modelos locales fallen — dependencia de red en el pitch es riesgo alto.

**Prompt assembly strategy:** El prompt final tiene 4 secciones: (1) system prompt con rol del agente y restricciones de nivel, (2) contexto RAG = chunks top-3 concatenados con su `sop_code` como header, (3) historial de sesión limitado a las últimas 3 interacciones (evita context overflow), (4) mensaje del usuario. Límite total del prompt: 2048 tokens para modelos 7B, 4096 para modelos 13B+. Implementar `token_budget_check()` antes de la llamada al LLM.

**Copiloto demo — por qué estático:** El copiloto real requiere que el widget inspeccione el DOM del portal en tiempo real, lo que implica resolución de selectores dinámicos (Wijmo genera IDs aleatorios) y sincronización de estado portal↔widget. Esto está fuera del alcance del hackathon. La demo estática con selectores conocidos es suficiente para visualizar el concepto ante el jurado. La documentación de EP-03-S04 es el argumento de escalabilidad.

**Filtrado por nivel en RAG:** El campo `sop_code` de cada chunk permite filtrar en la query del vector store antes del ranking por score. Implementar como post-filter: recuperar top-10 sin filtro → filtrar por `sop_code` permitidos según nivel → re-rankear y tomar top-3. Esto evita sesgar los embeddings con metadatos de nivel que el modelo de embeddings no fue entrenado para manejar.

**WebSocket session management:** Usar `session_id` como clave de un diccionario en memoria (dict Python) para mantener el historial de conversación por sesión. No persistir en base de datos para el MVP — en producción esto sería Redis o Supabase. La sesión se destruye al cerrar la conexión WebSocket.

**Irreversibilidad en Nivel 3:** Cuando el `ConversationService` detecta que el intent corresponde a SOP-05 o SOP-06 (confirmar factura / confirmar AVD), debe emitir un `copilot_action` con `is_irreversible: true` antes de proceder. El widget EP-04 muestra el `ConfirmModal` al recibir este flag. Esta regla no tiene excepciones — ver CLAUDE.md Regla #2.

---

## Architecture Decision Records

| ADR | Decisión | Estado |
|---|---|---|
| ADR-03-01 | Copiloto demo estático en lugar de DOM inspector dinámico para el hackathon | Aceptado — 31/05/2026 |
| ADR-03-02 | LLM local vía Ollama como primera opción; API externa como fallback de último recurso | Aceptado — EP-01-S04 |
| ADR-03-03 | Session state en memoria Python (dict) — no persistencia en DB para MVP | Aceptado — alcance hackathon |
| ADR-03-04 | Post-filter RAG por sop_code en vez de metadata filter en query vectorial | Aceptado — compatibilidad ChromaDB sin re-indexar |

## Scope Refinements

| Refinamiento | Impacto |
|---|---|
| Copiloto demo estático (sin DOM inspector real) | EP-04-S06 (e2e test) se simplifica: prueba el flujo consulta + highlight estático, no navegación DOM dinámica |
| Escalación básica sin GLPI real | EP-06 (Derivación Soporte Humano) cubre GLPI real — EP-03-S05 es el MVP de escalación suficiente para el pitch |
| EP-03-S04 como entregable de pitch (no código) | EP-08 (Costos) puede referenciar el plan de pruebas para justificar costos de LLM y cloud sin que el LLM esté benchmarkeado en producción real |

---

## References

- CLAUDE.md (reglas no negociables, contrato WebSocket) — `INNOVA-HIPERMAXI/CLAUDE.md`
- EP-02 planning (pipeline RAG, endpoint `/knowledge/search`) — `docs/planning/EP-02_base-de-conocimiento.md`
- EP-04 planning (widget, HighlightHelper, ConfirmModal) — `docs/planning/EP-04_widget-embebido.md`
- EP-06 planning (derivación GLPI) — `docs/planning/EP-06_derivacion-soporte.md` (pendiente)
- Stack tecnológico confirmado — `docs/EP-01/EP-01-S04-T01_stack-tecnologico-portal.md`
- SOPs fuente de verdad — `docs/base_problem_files/` (NO modificar)
- FastAPI WebSockets — https://fastapi.tiangolo.com/advanced/websockets/
- ChromaDB metadata filtering — https://docs.trychroma.com/guides#filtering-by-metadata
- `[TODO: agregar link a modelo LLM seleccionado una vez confirmado]`
