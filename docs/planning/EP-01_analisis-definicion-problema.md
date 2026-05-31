# EP-01 — Análisis y Definición del Problema

**Objetivo asociado:** Mapear procesos actuales, casos de uso, user persona y presentación del problema como base para todas las epicas técnicas y el pitch ante el jurado.
**Estado:** Closed
**Bloque:** Bloque 1 (Sáb 10:15 – 13:00)
**Bloquea:** EP-02, EP-03, EP-04, EP-05, EP-06, EP-07
**Depende de:** Ninguna

---

## Stories & Sub-tasks

### EP-01-S01 — Casos de Uso del Asistente Virtual

**Responsable:** Adrián
**Criterio de aceptación:** Documento con al menos 6 casos de uso identificados, cada uno con actor, disparador, flujo principal y resultado esperado, cubriendo los SOPs entregados por Hipermaxi.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-01-S01-T01 | Listado de consultas frecuentes extraídas de los SOPs (credenciales, facturación, AVD, catálogo, reenvío) | Done — `docs/EP-01/EP-01-S01-T01_consultas-frecuentes.md` |
| EP-01-S01-T02 | Casos de uso documentados: UC-01 a UC-06 (diagramas Mermaid por módulo) | Done — `docs/EP-01/EP-01-S01-T02_casos-de-uso.md` |
| EP-01-S01-T03 | Casos de uso documentados: UC-02 Asistencia en carga de factura | Done — incluido en EP-01-S01-T02 |
| EP-01-S01-T04 | Casos de uso documentados: UC-03 Asistencia en registro de producto (catálogo) | Done — incluido en EP-01-S01-T02 |
| EP-01-S01-T05 | Casos de uso documentados: UC-04 Asistencia en Aviso de Despacho (AVD) | Done — incluido en EP-01-S01-T02 |
| EP-01-S01-T06 | Casos de uso documentados: UC-05 Activación de código proveedor | Done — incluido en EP-01-S01-T02 |
| EP-01-S01-T07 | Casos de uso documentados: UC-06 Derivación a soporte humano | Done — incluido en EP-01-S01-T02 |

---

### EP-01-S02 — Diagrama de Flujo de Procesos Actuales

**Responsable:** Carla
**Criterio de aceptación:** Diagrama que muestre el flujo actual (AS-IS) de atención a proveedores, incluyendo los canales informales (WhatsApp, correo, llamada), los actores involucrados (Proveedor, Soporte, Compras) y los puntos de fricción identificados.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-01-S02-T01 | Mapeo de actores y canales actuales por proceso (basado en SOPs entregados) | Done — `docs/EP-01/EP-01-S02-T01_diagrama-flujo-as-is.md` (sección S1) |
| EP-01-S02-T02 | Diagrama AS-IS: flujo de solicitud de credenciales (SOP-SR-01) | Done — `docs/EP-01/EP-01-S02-T01_diagrama-flujo-as-is.md` (sección S2) |
| EP-01-S02-T03 | Diagrama AS-IS: flujo de carga de factura y AVD (SOP-05, SOP-06) | Done — `docs/EP-01/EP-01-S02-T01_diagrama-flujo-as-is.md` (secciones S3–S4) |
| EP-01-S02-T04 | Identificación y documentación de puntos de fricción y reprocesos | Done — incluido en EP-01-S02-T01 (columna Fricción + nodos ⚠) |

---

### EP-01-S03 — User Persona

**Responsable:** Melina
**Criterio de aceptación:** Al menos 1 user persona primaria documentada con nombre ficticio, rol, nivel técnico, frustraciones principales con el proceso actual y necesidades que el asistente virtual debe resolver.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-01-S03-T01 | User persona: Encargado HUB (usuario principal del portal, receptor de credenciales) | Done — `docs/EP-01/EP-01-S03-T01_user-persona.html` |
| EP-01-S03-T02 | User persona secundaria: Encargado de Sistemas o Comercial (usuario con acceso limitado) | Done — incluido en EP-01-S03-T01 |
| EP-01-S03-T03 | Mapa de necesidades y frustraciones por persona, vinculado a los SOPs | Done — `docs/EP-01/EP-01-S03-T03_user-persona-mapa-necesidades.html` |

---

### EP-01-S04 — Stack Tecnológico del Portal Existente

**Responsable:** Luis / Nathanael
**Criterio de aceptación:** Documento con el stack identificado del portal actual de Hipermaxi (https://portal.hipermaxi.com/), incluyendo tecnologías detectadas en frontend, backend inferido y posibles puntos de integración para el widget del asistente.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-01-S04-T01 | Inspección del portal: tecnologías frontend detectadas (frameworks, librerías, estructura HTML) | Done — `docs/EP-01/EP-01-S04-T01_stack-tecnologico-portal.md` (sección 1) |
| EP-01-S04-T02 | Identificación de puntos de integración viable para widget embebido (iFrame, script tag, API REST) | Done — `docs/EP-01/EP-01-S04-T01_stack-tecnologico-portal.md` (sección 2) |
| EP-01-S04-T03 | Propuesta preliminar de stack propio para la solución (frontend, backend, IA) | Done — `docs/EP-01/EP-01-S04-T01_stack-tecnologico-portal.md` (sección 3) |

---

### EP-01-S05 — Presentación del Problema

**Responsable:** Diego
**Criterio de aceptación:** Presentación estructurada con problema, impacto cuantificable, solución propuesta y propuesta de valor, lista para ser usada en el pitch de 5 minutos ante el jurado.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-01-S05-T01 | Definición del problema con datos de contexto (canales informales, volumen de consultas, reprocesos) | Done — `docs/EP-01/EP-01-S05-T01_presentacion-del-problema.md` (T01) |
| EP-01-S05-T02 | Propuesta de valor del asistente virtual (modalidad Consulta + Copiloto) | Done — `docs/EP-01/EP-01-S05-T01_presentacion-del-problema.md` (T02) |
| EP-01-S05-T03 | Estructura del pitch: problema → solución → demo → impacto → escalabilidad | Done — `docs/EP-01/EP-01-S05-T01_presentacion-del-problema.md` (T03) |
| EP-01-S05-T04 | Slides o material de apoyo para el pitch (coordinado con Melina para diseño) | Pendiente — estructura definida en T04 del entregable, diseño en cola para Melina |

---

## Referencias

- Desafío Hipermaxi — transcripcion_desafio_hipermaxi.md
- SOP-SR-01 Credenciales de Acceso — `docs/base_problem_files/CREDENCIALES DE ACCESO.md`
- SOP-SR-02 Activación de Código Proveedor — `docs/base_problem_files/ACTIVACIÓN DE CÓDIGO PROVEEDOR.md`
- SOP-SR-03 Reenvío de Credenciales — `docs/base_problem_files/REENVÍO DE CREDENCIALES DE ACCESO.md`
- SOP-04 Registro de Productos — `docs/base_problem_files/ASISTENCIA AL CARGAR UN PRODUCTO AL PORTAL WEB.md`
- SOP-05 Carga de Facturas — `docs/base_problem_files/ASISTENCIA AL CARGAR FACTURA.md`
- SOP-06 Aviso de Despacho — `docs/base_problem_files/ASISTENCIA EN AVD.md`
- Portal Web Proveedores Hipermaxi — https://portal.hipermaxi.com/
