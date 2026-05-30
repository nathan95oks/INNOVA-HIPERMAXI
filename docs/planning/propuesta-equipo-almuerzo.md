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
| Adrián | Frontend | Dev Team |
| Carla | Backend | Dev Team |
| Luis | Backend | Dev Team |
| Nathanael | Backend / Infra | Dev Team |

---

## La Solución Propuesta

Un asistente virtual embebido en el Portal Web de Hipermaxi que opera en dos modalidades:

**Modalidad Consulta** — El proveedor hace una pregunta en lenguaje natural y el agente responde usando la base de conocimiento de Hipermaxi (SOPs, manuales, procedimientos).

**Modalidad Copiloto** — El agente guía al proveedor paso a paso dentro de los módulos del portal (credenciales, facturación, catálogo, AVD).

Cuando un caso supera las capacidades del agente, deriva al área de soporte humano correspondiente con trazabilidad completa.

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
| **ALMUERZO** | **Sáb 13:00–14:00** | **Revisión de equipo ← estamos aquí** |
| Bloque 2 | Sáb 14:00–17:30 | Desarrollo técnico + prototipo |
| Bloque 3 | Sáb 18:00–20:30 | Mock-up avanzado + integración |
| Bloque 4 | Sáb 21:00–Dom 12:00 | Desarrollo nocturno + demo funcional |
| Bloque Final | Dom 09:00–12:00 | Pulido + validación del pitch |
| Submission | Dom 12:00 | Entrega al comité organizador |
| Pitch | Dom 14:00–17:30 | 5 min presentación + 3 min preguntas |

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

**Nota sobre EP-07:** Prioridad baja para el MVP. Suficiente con demostrar el concepto en el pitch.

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

## Preguntas para confirmar en el almuerzo

1. **¿Las 7 épicas propuestas cubren el alcance del MVP?** ¿Falta alguna? ¿Sobra alguna para las 48 horas?
2. **EP-07 Trazabilidad** — ¿la dejamos como concepto en el pitch o intentamos implementarla?
3. **Plataforma IA** — ¿ya tienen una decisión sobre qué LLM usar? (define EP-02 y EP-03)
4. **Stack propio** — ¿Luis y Nathanael tienen ya una propuesta después del Bloque 1?
5. **Integración con el portal** — ¿el equipo de Hipermaxi puede darnos acceso o documentación técnica del portal?

---

*Documento generado durante el Bloque 1 · Innova Hack Santa Cruz 2026*
