# EP-04 — UI/UX Widget Embebido

**Objetivo asociado:** Diseñar e implementar el widget de chat flotante del asistente virtual, integrable al Portal Web de Hipermaxi mediante script tag, cubriendo las dos modalidades de interacción: Consulta y Copiloto.
**Estado:** In Progress
**Bloque:** Bloque 2 (Sáb 14:00 – 17:30) · Bloque 3 (Sáb 18:00 – 20:30)
**Responsables principales:** Melina (UI/UX + lead) / Carla (Frontend)
**Bloquea:** EP-05 (Integración con el Portal Web)
**Depende de:** EP-01 — User persona (EP-01-S03), casos de uso UC-01 a UC-06 (EP-01-S01), stack tecnológico confirmado (EP-01-S04)

---

## Architectural Context

EP-04 implementa la capa de presentación del asistente como un bundle JS/CSS autocontenido inyectado vía `<script>` asíncrono en el portal existente de Hipermaxi. El portal corre sobre ASP.NET + jQuery + Bootstrap 3.3.7, por lo que el widget debe coexistir sin conflictos de estilos ni de librerías.

La comunicación con el backend (EP-03) se realiza mediante WebSockets para mantener una conexión persistente y de baja latencia. El widget no accede directamente a la base de conocimiento ni al LLM — toda la lógica conversacional reside en el backend.

Estructura interna del widget:

```
widget-bundle (Vanilla JS / Preact)
    ├── ChatLauncher          — botón flotante de apertura/cierre
    ├── ChatWindow            — contenedor principal del asistente
    │     ├── MessageList     — historial de mensajes (usuario + agente)
    │     ├── InputBar        — campo de texto + botón enviar
    │     └── TypingIndicator — indicador de respuesta en progreso
    ├── CopilotOverlay        — capa visual para modalidad Copiloto
    │     ├── HighlightHelper — resalta elementos del DOM del portal
    │     └── ConfirmModal    — confirmación human-in-the-loop antes de acciones críticas
    └── WebSocketClient       — gestión de conexión, reconexión y mensajería
```

---

## Stories & Sub-tasks

### EP-04-S01 — Diseño de componentes y sistema visual

**Responsable:** Melina

**Criterio de aceptación:** Existe un sistema visual documentado (paleta, tipografía, espaciado) compatible con Bootstrap 3.3.7. Los mockups de ChatLauncher, ChatWindow y ConfirmModal están aprobados por Diego antes de que Carla comience la implementación. Los componentes respetan la identidad visual de Hipermaxi (colores corporativos, fuentes).

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-04-S01-T01 | Definición de paleta de colores y tipografía compatible con el portal Hipermaxi | To Do |
| EP-04-S01-T02 | Mockup de ChatLauncher — botón flotante (estados: cerrado, abierto, con notificación) | To Do |
| EP-04-S01-T03 | Mockup de ChatWindow — ventana de conversación completa (Modalidad Consulta) | To Do |
| EP-04-S01-T04 | Mockup de ConfirmModal — diálogo de confirmación human-in-the-loop (Modalidad Copiloto) | To Do |
| EP-04-S01-T05 | Mockup de CopilotOverlay — estado visual del portal con elemento resaltado por el agente | To Do |

---

### EP-04-S02 — Scaffold y configuración del bundle

**Responsable:** Carla

**Criterio de aceptación:** El bundle JS/CSS compilado se puede inyectar en cualquier página HTML con una sola etiqueta `<script src="widget.js">` sin romper los estilos ni el comportamiento existente del portal Hipermaxi. Verificado en una página de prueba local que replique el HTML/Bootstrap 3.3.7 del portal.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-04-S02-T01 | Scaffold del proyecto: estructura de carpetas, configuración de bundler (Vite o esbuild) | To Do |
| EP-04-S02-T02 | CSS scoped — todos los estilos del widget bajo namespace `#hx-widget` para evitar colisiones con Bootstrap 3.3.7 | To Do |
| EP-04-S02-T03 | Script de inyección: `widget.js` que crea el nodo raíz y monta el widget sin dependencias externas | To Do |
| EP-04-S02-T04 | Verificación de compatibilidad: prueba de inyección en página HTML con Bootstrap 3.3.7 + jQuery | To Do |

---

### EP-04-S03 — Componente ChatLauncher y ChatWindow

**Responsable:** Carla / Melina

**Criterio de aceptación:** El usuario puede abrir y cerrar el widget mediante el botón flotante. La ventana de chat muestra correctamente el historial de mensajes (usuario y agente diferenciados visualmente), el indicador de escritura mientras el agente procesa, y el campo de entrada con envío por Enter y por botón. Validado con 3 conversaciones de prueba en modo mock (sin backend real).

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-04-S03-T01 | Componente `ChatLauncher` — botón flotante con toggle open/close y estado de notificación | To Do |
| EP-04-S03-T02 | Componente `ChatWindow` — contenedor con header (título + botón cerrar), body (mensajes) y footer (input) | To Do |
| EP-04-S03-T03 | Componente `MessageList` — render de mensajes tipo `user` y `agent` con timestamps | To Do |
| EP-04-S03-T04 | Componente `TypingIndicator` — animación de puntos mientras el agente responde | To Do |
| EP-04-S03-T05 | Componente `InputBar` — campo de texto con envío por Enter y por botón, deshabilitado mientras el agente responde | To Do |

---

### EP-04-S04 — WebSocketClient

**Responsable:** Carla

**Criterio de aceptación:** El widget establece conexión WebSocket con el backend, envía mensajes del usuario y recibe respuestas del agente en tiempo real. Implementa reconexión automática ante caída de conexión (máx. 3 intentos con backoff exponencial). Verificado con servidor WebSocket mock local.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-04-S04-T01 | `WebSocketClient` — clase que gestiona conexión, envío (`sendMessage`) y recepción de mensajes | To Do |
| EP-04-S04-T02 | Manejo de eventos: `onOpen`, `onMessage`, `onClose`, `onError` con actualización reactiva del estado del chat | To Do |
| EP-04-S04-T03 | Reconexión automática con backoff exponencial (3 intentos: 1s, 2s, 4s) | To Do |
| EP-04-S04-T04 | Formato de mensajes acordado con EP-03: `{ type: "user_message" | "agent_response" | "copilot_action", payload: {...} }` | To Do |

---

### EP-04-S05 — CopilotOverlay y ConfirmModal (Modalidad Copiloto)

**Responsable:** Melina / Carla

**Criterio de aceptación:** Dado un mensaje del backend con `type: "copilot_action"` y `target: "#selector"`, el widget resalta visualmente el elemento del DOM indicado (borde de color + tooltip explicativo). Antes de ejecutar acciones irreversibles (ej. confirmar AVD, enviar formulario), el widget muestra un ConfirmModal que el usuario debe aprobar explícitamente. El overlay no bloquea la interacción con el resto del portal. Verificado con los UC-02 (carga de factura) y UC-04 (AVD).

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-04-S05-T01 | `HighlightHelper` — función `highlight(selector: string, message: string)` que aplica clase CSS de resaltado + tooltip al elemento DOM indicado | To Do |
| EP-04-S05-T02 | `clearHighlights()` — limpia todos los resaltados activos al avanzar al siguiente paso | To Do |
| EP-04-S05-T03 | Componente `ConfirmModal` — diálogo con descripción de la acción a ejecutar, botón "Confirmar" y botón "Cancelar" | To Do |
| EP-04-S05-T04 | Flujo completo de confirmación: el widget pausa la acción, muestra el modal, y solo ejecuta/descarta según la respuesta del usuario | To Do |

---

### EP-04-S06 — Integración end-to-end con backend mock

**Responsable:** Melina (QA) / Carla (implementación)

**Criterio de aceptación:** El widget completa un flujo de extremo a extremo usando un servidor WebSocket mock que simula las respuestas del agente para UC-01 (credenciales) y UC-02 (carga de factura) en ambas modalidades. Sin errores de consola. Tiempo de render de primer mensaje ≤ 300ms desde recepción del evento WebSocket.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-04-S06-T01 | Servidor WebSocket mock (`mock_server.py` o `mock_server.js`) con respuestas predefinidas para UC-01 y UC-02 | To Do |
| EP-04-S06-T02 | Flujo UC-01 Modalidad Consulta: pregunta sobre credenciales → respuesta del agente con pasos | To Do |
| EP-04-S06-T03 | Flujo UC-02 Modalidad Copiloto: carga de factura → resaltado de campos → ConfirmModal → confirmación | To Do |
| EP-04-S06-T04 | Reporte de pruebas: captura de pantalla o video de los dos flujos completados sin errores | To Do |

---

## Implementation Notes

**Aislamiento de estilos:** El portal Hipermaxi usa Bootstrap 3.3.7 con estilos globales que pueden pisar los del widget. Todos los estilos del widget deben estar bajo el selector raíz `#hx-widget` para garantizar especificidad sin necesidad de Shadow DOM (incompatible con IE11 que puede estar presente en el entorno del portal).

**Bundler y tamaño del bundle:** El bundle final debe ser menor a 150KB (gzip) para no impactar el tiempo de carga del portal. Usar Preact en lugar de React si se requiere un framework de componentes — Preact pesa ~3KB vs ~40KB de React. Si la lógica es manejable, Vanilla JS es preferible para el MVP del hackathon.

**WebSocket vs polling:** Se descartó el polling HTTP por latencia e impacto en el servidor. WebSockets nativos son suficientes para el MVP; Socket.io añade overhead innecesario en este contexto.

**Human-in-the-loop es no negociable:** El ConfirmModal debe aparecer *siempre* antes de cualquier acción que modifique datos en el portal (envío de formularios, confirmación de AVD). No hay excepción por "acción de bajo riesgo". Este es un requisito de confianza del usuario, no solo técnico.

**Coordinación con EP-03:** El formato del mensaje WebSocket (`type`, `payload`) debe acordarse con el equipo de backend (Adrián/Luis/Nathanael) al inicio del Bloque 2, antes de que EP-04-S04 y EP-03 avancen por separado. Un desacuerdo en este contrato bloquea la integración en EP-05.

---

## References

- EP-01-S01 Casos de Uso — `casos_de_uso.txt`
- EP-01-S03 User Persona — `user_personas.html`
- EP-01-S04 Stack Tecnológico del Portal — `EP-01-S04_Stack_Tecnológico_del_Portal_Existente.md`
- EP-01-S02 Diagrama AS-IS — `flujo_as_is.md`
- EP-03 Agente IA (contrato WebSocket) — bloqueado por EP-02, definir contrato de mensajes al inicio del Bloque 2
- EP-05 Integración con el Portal Web — bloqueada por esta épica
- Portal Web Proveedores Hipermaxi — https://portal.hipermaxi.com/
- Preact docs — https://preactjs.com/
- Bootstrap 3.3.7 — https://getbootstrap.com/docs/3.3/
