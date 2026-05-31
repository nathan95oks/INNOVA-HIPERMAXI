# Hipermaxi ProveedorBot
## Propuesta de Trabajo — Revisión de Equipo
**Innova Hack Santa Cruz 2026 · 30–31 de mayo**

---

## El Desafío

Hipermaxi gestiona su red de proveedores mediante canales informales — WhatsApp, llamadas y correo. Esto genera errores recurrentes, reprocesos y sobrecarga en el equipo de soporte.

**Nuestra misión:** construir un Asistente Virtual de Soporte Operativo integrado al Portal Web de Proveedores que reemplace la atención manual por una experiencia digital de autoservicio.

---

## El Equipo

| Persona | Rol en el proyecto | Rol Scrum |
|---|---|---|
| Diego | Product Manager / Business Analyst | Product Owner |
| Melina | Frontend + UI/UX | Scrum Master + Dev Team |
| Carla | Frontend | Dev Team |
| Adrian | Backend | Dev Team |
| Luis | Backend | Dev Team |
| Nathanael | Backend / Infra | Dev Team |

---

## La Solución Propuesta

Un asistente virtual embebido en el Portal Web de Hipermaxi que opera en dos modalidades principales (**Modalidad Consulta** y **Modalidad Copiloto**) y se segmenta en **tres niveles de acceso y seguridad** según el estado de autenticación del usuario:

### Estructura de 3 Niveles del Asistente

* **Nivel 1 — Público (Sin autenticar):**
  * **Ubicación:** Visible únicamente en la pantalla de login del Portal de Proveedores.
  * **Alcance:** Contexto estrictamente restringido. Asistencia exclusiva para problemas de acceso y onboarding.
  * **Casos de Uso:** Solicitud de Nuevas Credenciales (`SOP-SR-01`) y Reenvío de accesos por pérdida u olvido (`SOP-SR-03`).
  * **Seguridad:** No expone datos de negocio. Solo asiste guiando el proceso formal de envío de planillas y validación de encargado.

* **Nivel 2 — Privado Base (Usuario autenticado):**
  * **Ubicación:** Disponible dentro del portal una vez iniciada la sesión.
  * **Alcance:** Soporte funcional sobre el uso general de la plataforma y el catálogo.
  * **Casos de Uso:** Asistencia al Cargar Productos al Catálogo (`SOP-04`) y Activación de Código de Proveedor (`SOP-SR-02`).
  * **Copiloto:** Guía campo a campo y valida en tiempo real formatos obligatorios (JPG/PNG para imágenes) en la pantalla del catálogo. Para SOP-SR-02, el copiloto guía al proveedor a iniciar la solicitud formal vía correo (soportehub@hipermaxi.com); la activación del código la ejecuta Soporte/Compras de forma asíncrona.

* **Nivel 3 — Privado Operativo / Transaccional (Acceso avanzado):**
  * **Ubicación:** Se activa al interactuar con módulos que manejan transacciones financieras u operativas críticas.
  * **Alcance:** Soporte en procesos con impacto financiero directo o flujos irreversibles.
  * **Casos de Uso:** Carga de Facturas en Órdenes de Compra (`SOP-05`) y Avisos de Despacho (`SOP-06`).
  * **Copiloto & Seguridad:** Mayor nivel de resguardo. El copiloto valida formatos (PDF obligatorio para facturas), pausa obligatoriamente antes de confirmar un AVD o enviar una factura alertando sobre la irreversibilidad, y compara datos con la Orden de Compra para detectar inconsistencias de monto o producto. ⚠️ La validación en tiempo real contra el backend requiere EP-05 (Integración con el Portal Web).

---

### Modalidades de Operación

**Modalidad Consulta** — El proveedor hace una pregunta en lenguaje natural y el agente responde usando la base de conocimiento de Hipermaxi (SOPs, manuales, procedimientos).

**Modalidad Copiloto** — El agente guía al proveedor paso a paso dentro de los módulos del portal en tiempo real (resaltando elementos, guiando campo a campo, validando datos en tiempo real y previniendo errores antes de confirmar).

Cuando un caso supera las capacidades del agente, deriva al área de soporte humano correspondiente (Compras/Facturación/TI via GLPI) con trazabilidad completa.

> **ADR-03-01 (31/05/2026):** La Modalidad Copiloto se implementa como **demo estático** para el pitch. El widget lee pasos pre-mapeados por SOP y resalta selectores CSS conocidos del portal; no hay inspección DOM dinámica en tiempo real. La documentación de pruebas de escalabilidad (EP-03-S04) es el argumento ante el jurado para la evolución al copiloto real.

---

## Tablero Trello — Estructura

| Columna | Propósito |
|---|---|
| EPICS | Tarjetas de referencia por épica |
| ENLACES | Referencias y recursos del proyecto |
| TO DO | Tareas pendientes |
| IN PROGRESS | Trabajo activo (máx. 1–2 por persona) |
| REVIEW | Listo para revisión |
| DONE | Completado y validado por Diego |

---

## Agenda del Hackathon

| Bloque | Horario | Foco |
|---|---|---|
| Bloque 1 | Sáb 10:15–13:00 | Problem framing — EP-01 |
| ALMUERZO** | Sáb 13:00–14:00 | Revisión de equipo |
| **Bloque 2** | Sáb 14:00–17:30 | Desarrollo técnico + prototipo |
| Bloque 3 | Sáb 18:00–20:30 | Mock-up avanzado + integración |
| **Bloque 4** | Sáb 21:00–Dom 12:00 | Desarrollo nocturno + demo funcional ✅ |
| **Bloque Final** | Dom 09:00–12:00 | Pulido + validación del pitch ← estamos aquí |
| Submission | Dom 12:00 | Entrega al comité organizador |
| Pitch | Dom 14:00–17:30 | 5 min presentación + 3 min preguntas |

---

## Trazabilidad: Épicas → Bloques del Hackathon

| Épica | Nombre | Bloque Principal | Bloques Secundarios | Responsable(s) | Estado |
|---|---|---|---|---|---|
| 🟣 EP-01 | Análisis y definición del problema | **Bloque 1** (Sáb 10:15–13:00) | — | Diego, Melina, Carla, Adrián, Luis, Nathanael | ✅ Closed |
| 🟡 EP-02 | Base de Conocimiento | **Bloque 2** (Sáb 14:00–17:30) | Bloque 3 | Luis / Nathanael (+ Adrián en validación) | ✅ Closed |
| 🔵 EP-03 | Agente IA — Motor conversacional | **Bloque 2** (Sáb 14:00–17:30) | Bloque 3, Bloque 4 | Adrián / Luis / Nathanael | 🔄 In Progress (mock funcional; backend real pendiente) |
| 🟢 EP-04 | UI/UX — Widget embebido | **Bloque 2** (Sáb 14:00–17:30) | Bloque 3, Bloque 4 | Luis (BetoHerbas) + Diego | ✅ Closed |
| 🆘 EP-SALVAVIDAS | Copiloto Contextual Mock | **Bloque 4** (Dom 00:00–05:30) | Bloque Final | Luis (BetoHerbas) | 🔄 In Progress (correcciones UI) |
| 🟠 EP-05 | Integración con el Portal Web | **Bloque 3** (Sáb 18:00–20:30) | Bloque 4 | Adrián / Luis / Nathanael | 🔒 Bloqueado por EP-03 real |
| 🔴 EP-06 | Derivación a Soporte Humano | **Bloque 3** (Sáb 18:00–20:30) | Bloque 4 | Adrián | 🔄 In Progress (mock en EP-SALVAVIDAS ✅; GLPI real pendiente) |
| ⚫ EP-07 | Trazabilidad e historial | **Bloque 4** (Sáb 21:00–Dom 12:00) | — | TBD | 🔒 Baja prioridad / concepto pitch |
| 🟤 EP-08 | Costos de Implementación | **Bloque 4** (Sáb 21:00–Dom 12:00) | Bloque Final | Luis / Nathanael + Diego | 🔒 Bloqueado por EP-03, EP-05 |
| 🔶 EP-09 | Modelo de Negocio | **Bloque 2** (paralelo, Sáb 14:00+) | Bloque Final | Diego | 🔄 In Progress |

> **Nota:** EP-09 puede avanzar en paralelo desde el Bloque 2 — no depende del desarrollo técnico. El Bloque Final (Dom 09:00–12:00) es exclusivamente para pulido del pitch; no debe quedar trabajo técnico nuevo pendiente para ese momento.

---

## Épicas Propuestas

> Estas épicas están pendientes de confirmación por el equipo.

| ID | Épica | Objetivo | Depende de |
|---|---|---|---|
| 🟣 EP-01 | Análisis y definición del problema | Casos de uso, user persona, diagrama AS-IS, stack del portal, pitch | Ninguna |
| 🟡 EP-02 | Base de Conocimiento | Estructurar e indexar los SOPs de Hipermaxi como fuente del agente | EP-01 |
| 🔵 EP-03 | Agente IA — Motor conversacional | Agente que responde en lenguaje natural en modalidad Consulta y Copiloto | EP-02 |
| 🟢 EP-04 | UI/UX — Widget embebido | Interfaz del asistente integrada al portal | EP-01 |
| 🟠 EP-05 | Integración con el Portal Web | Conectar el widget y el agente al portal existente de Hipermaxi | EP-03, EP-04 |
| 🔴 EP-06 | Derivación a Soporte Humano | Escalar casos complejos con trazabilidad | EP-03 |
| ⚫ EP-07 | Trazabilidad e historial | Registro de todas las interacciones | EP-03 |
| 🟤 EP-08 | Costos de Implementación | Estimación de costos reales de infraestructura, LLM y desarrollo | EP-03, EP-05 |
| 🔶 EP-09 | Modelo de Negocio | Propuesta de valor, monetización y sostenibilidad de la solución | EP-01 (propuesta confirmada) |

**Nota sobre EP-07:** Prioridad baja para el MVP. Suficiente con demostrar el concepto en el pitch.

**Nota sobre EP-08:** Se desbloquea una vez que el desarrollo técnico esté definido (stack, LLM elegido, arquitectura). Permite presentar números reales al jurado.

**Nota sobre EP-09:** Se desbloquea una vez confirmada la propuesta de solución. No depende del desarrollo; puede avanzar en paralelo desde Diego.

---

## EP-01 — Tareas del Bloque 1

Estado actual: **In Progress**

### Adrián — Casos de Uso

Documentar al menos 6 casos de uso del asistente basados en los SOPs de Hipermaxi.

- UC-01 Consultar credenciales de acceso
- UC-02 Asistencia en carga de factura
- UC-03 Asistencia en registro de producto (catálogo)
- UC-04 Asistencia en Aviso de Despacho (AVD)
- UC-05 Activación de código proveedor
- UC-06 Derivación a soporte humano

---

### Carla — Diagrama de Flujo AS-IS

Mapear el flujo actual de atención a proveedores, actores involucrados y puntos de fricción.

- Actores: Proveedor, Área de Soporte, Área de Compras
- Canales actuales: WhatsApp, llamada, correo (soportehub@hipermaxi.com)
- Flujos a diagramar: solicitud de credenciales, carga de factura, AVD
- Entregable: diagrama que evidencie los reprocesos y la dependencia de soporte humano

---

### Melina — User Persona

Construir al menos 1 user persona primaria con frustraciones y necesidades concretas.

- Persona primaria: Encargado HUB (usuario principal del portal)
- Persona secundaria: Encargado de Sistemas o Comercial
- Vincular frustraciones directamente a los SOPs de Hipermaxi

---

### Luis / Nathanael — Stack Tecnológico del Portal

Inspeccionar el portal existente y proponer el stack de la solución.

- Portal a inspeccionar: https://portal.hipermaxi.com/
- Identificar: tecnologías frontend, estructura del HTML, puntos de integración para widget
- Entregable: propuesta preliminar de stack propio (frontend, backend, plataforma IA)

---

### Diego — Presentación del Problema

Estructura del pitch para el jurado (5 minutos).

1. Problema con datos de contexto
2. Propuesta de valor del asistente (Consulta + Copiloto)
3. Estructura: problema → solución → demo → impacto → escalabilidad
4. Slides coordinados con Melina para diseño

---

## EP-08 — Costos de Implementación

**Estado:** 🔒 Bloqueado — Se desbloquea al completar EP-03 y EP-05 (stack definido + integración técnica confirmada)

**Responsable:** Luis / Nathanael (infra) + Diego (presentación)

**Objetivo:** Estimar los costos reales de operar la solución para que el pitch tenga números concretos y creíbles ante el jurado.

### Dimensiones a estimar

**Infraestructura cloud**
- Hosting del backend / API del agente (ej. Railway, Render, AWS Lambda)
- Base de datos vectorial para la base de conocimiento (ej. Pinecone, Weaviate, Supabase pgvector)
- Almacenamiento de logs e historial de conversaciones

**Plataforma IA / LLM**
- Costo por token (input + output) según el modelo elegido
- Estimación de volumen mensual de consultas (ej. X proveedores × Y consultas/mes)
- Comparativa de costos: Claude API vs OpenAI vs modelo open-source hosteado

**Desarrollo e integración**
- Horas estimadas de desarrollo para la integración con el portal existente
- Costo de mantenimiento mensual (actualizaciones de SOPs, ajustes del agente)

**Entregable:** tabla de costos con escenario mínimo (MVP), escenario medio (operación real año 1) y escenario de escala (red completa de proveedores Hipermaxi).

---

## EP-09 — Modelo de Negocio

**Estado:** 🔒 Bloqueado — Se desbloquea al confirmar la propuesta de solución (EP-01 completado)

**Responsable:** Diego

**Objetivo:** Definir cómo la solución genera valor sostenible para Hipermaxi y qué propuesta presentar al jurado más allá del MVP técnico.

### Componentes a definir

**Propuesta de valor**
- Para Hipermaxi: reducción de carga operativa en soporte, trazabilidad, formalización de canales
- Para el proveedor: autoservicio 24/7, resolución inmediata, menos fricción con el portal

**Modelo de entrega**
- Opción A — Solución interna: Hipermaxi contrata el desarrollo e integra el agente al portal como producto propio
- Opción B — SaaS vertical: la solución se comercializa como producto para otras cadenas de retail/supermercados en Bolivia y la región
- Opción C — Licencia + implementación: venta de la solución base con customización por cliente

**Métricas de impacto para el pitch**
- % estimado de reducción de consultas manuales (WhatsApp / llamadas)
- Tiempo promedio de resolución actual vs con el agente
- ROI estimado para Hipermaxi (horas de soporte ahorradas × costo hora)

**Escalabilidad**
- Replicabilidad del modelo a otros módulos del portal (ej. logística, devoluciones)
- Expansión a otros proveedores / otras empresas del grupo

**Entregable:** sección de modelo de negocio lista para incluir en el pitch de 5 minutos, con 1–2 slides de impacto y sostenibilidad.

*Documento generado durante el Bloque 1 · Innova Hack Santa Cruz 2026*