# Documentación del Proyecto — HimaxIA
**Innova Hack Santa Cruz 2026 · Hipermaxi ProveedorBot**

Este README es la guía de entrada para cualquier agente de IA o desarrollador que trabaje con esta documentación. Define la estructura del repositorio de docs, las reglas de lectura, las convenciones de nombrado y el protocolo de actualización tras completar cada épica.

---

## Estructura de directorios

```
docs/
├── README.md                          ← Este archivo. Leer primero.
│
├── base_problem_files/                ← FUENTE DE VERDAD — datos reales de Hipermaxi
│   ├── transcripcion_desafio_hipermaxi.md
│   ├── CREDENCIALES DE ACCESO.md
│   ├── REENVÍO DE CREDENCIALES DE ACCESO.md
│   ├── ACTIVACIÓN DE CÓDIGO PROVEEDOR.md
│   ├── ASISTENCIA AL CARGAR UN PRODUCTO AL PORTAL WEB.md
│   ├── ASISTENCIA AL CARGAR FACTURA.md
│   └── ASISTENCIA EN AVD.md
│
├── planning/                          ← PLANIFICACIÓN VIVA — actualizar tras cada épica
│   ├── propuesta-equipo-almuerzo.md
│   ├── EP-01_analisis-definicion-problema.md
│   ├── EP-02_base-de-conocimiento.md
│   ├── EP-04_widget-embebido.md
│   └── EP-09_modelo-de-negocio.md
│
└── EP-01/                             ← ENTREGABLES REALES — un directorio por épica
    ├── EP-01-S01-T01_consultas-frecuentes.md
    ├── EP-01-S01-T02_casos-de-uso.md
    ├── EP-01-S02-T01_diagrama-flujo-as-is.md
    ├── EP-01-S03-T01_user-persona.html
    ├── EP-01-S03-T03_user-persona-mapa-necesidades.html
    ├── EP-01-S04-T01_stack-tecnologico-portal.md
    └── EP-01-S05-T01_presentacion-del-problema.md
```

> Los directorios `EP-02/`, `EP-03/`, `EP-04/`, etc. se crean cuando se completa la épica correspondiente, siguiendo el mismo patrón que `EP-01/`.

---

## 1. `base_problem_files/` — La Biblia del proyecto

**Regla fundamental: estos archivos no se modifican.** Son los documentos operativos reales entregados por Hipermaxi y representan la fuente de verdad para toda la lógica de negocio del asistente.

### Qué contiene

| Archivo | Código | Descripción |
|---|---|---|
| `transcripcion_desafio_hipermaxi.md` | — | Enunciado original del desafío. Contacto: Williams Montenegro (wmontenegro@hipermaxi.com). Define el objetivo del hackathon. |
| `CREDENCIALES DE ACCESO.md` | SOP-SR-01 | Proceso de solicitud de nuevas credenciales para proveedores nuevos. Flujo: Proveedor → Compras → Soporte TI → entrega de credenciales. |
| `REENVÍO DE CREDENCIALES DE ACCESO.md` | SOP-SR-03 | Proceso de reenvío de credenciales por pérdida u olvido. Solo aplica a proveedores ya registrados y activos. |
| `ACTIVACIÓN DE CÓDIGO PROVEEDOR.md` | SOP-SR-02 | Proceso de activación del código de proveedor en el módulo de Catálogo. Flujo asíncrono: solicitud por correo → validación Compras → habilitación Soporte. |
| `ASISTENCIA AL CARGAR UN PRODUCTO AL PORTAL WEB.md` | SOP-04 | Casos frecuentes de error al registrar productos en el Catálogo Electrónico: campos incompletos, imágenes en formato inválido (solo JPG/PNG), datos técnicos faltantes. |
| `ASISTENCIA AL CARGAR FACTURA.md` | SOP-05 | Casos frecuentes en la carga de facturas en Órdenes de Compra: OC no habilitada, formato incorrecto (solo PDF), facturas observadas por inconsistencia de montos. |
| `ASISTENCIA EN AVD.md` | SOP-06 | Casos frecuentes de Avisos de Despacho: AVD confirmado no puede editarse (bloqueo irreversible del sistema), AVD con monto cero. |

### Cuándo leer estos archivos

- **Siempre** antes de generar respuestas del agente relacionadas con procesos de Hipermaxi.
- **Siempre** antes de diseñar flujos del Copiloto en EP-04 o EP-05.
- **Siempre** antes de actualizar la base de conocimiento (EP-02).
- Al validar si la lógica de 3 niveles del asistente está alineada con los procesos reales.

### Mapa SOP → Nivel del Asistente

| SOP | Módulo del portal | Nivel del asistente | Modalidad principal |
|---|---|---|---|
| SOP-SR-01 | Pantalla de login (sin sesión) | Nivel 1 — Público | Consulta |
| SOP-SR-03 | Pantalla de login (sin sesión) | Nivel 1 — Público | Consulta |
| SOP-SR-02 | Portal autenticado — Catálogo | Nivel 2 — Privado Base | Consulta (guía solicitud por correo) |
| SOP-04 | Portal autenticado — Catálogo | Nivel 2 — Privado Base | Copiloto |
| SOP-05 | Portal autenticado — Compras / OC | Nivel 3 — Transaccional | Copiloto + Seguridad |
| SOP-06 | Portal autenticado — Despachos / AVD | Nivel 3 — Transaccional | Copiloto + Seguridad |

---

## 2. `planning/` — Planificación viva del proyecto

Contiene los archivos de planificación Scrum del proyecto. **Se actualizan tras completar cada épica.**

### Archivos y su propósito

| Archivo | Propósito | Cuándo actualizar |
|---|---|---|
| `propuesta-equipo-almuerzo.md` | Propuesta general del proyecto: equipo, solución, tablero Trello, agenda del hackathon, trazabilidad épicas→bloques | Al cambiar el estado de una épica o reasignar responsables |
| `EP-01_analisis-definicion-problema.md` | Backlog breakdown de EP-01: stories, sub-tareas, criterios de aceptación | Al completar cada sub-tarea: marcar estado `Done` y referenciar el entregable en `EP-01/` |
| `EP-02_base-de-conocimiento.md` | Backlog breakdown de EP-02: pipeline RAG, ingesta de SOPs, base vectorial | Al completar EP-02: actualizar estados y crear directorio `EP-02/` con entregables |
| `EP-04_widget-embebido.md` | Backlog breakdown de EP-04: widget Preact, WebSocket, Copilot Overlay, tests e2e | Al completar EP-04: actualizar estados y crear directorio `EP-04/` con entregables |
| `EP-09_modelo-de-negocio.md` | Backlog breakdown de EP-09: propuesta de valor, ROI, modelo de entrega, slides para el pitch | Al completar EP-09: actualizar estados y crear directorio `EP-09/` con entregables |

### Protocolo de actualización tras completar una épica

1. Abrir el archivo `EP-XX_nombre.md` correspondiente en `planning/`.
2. Cambiar el campo `**Estado:**` de `In Progress` a `Closed`.
3. Actualizar el estado de cada sub-tarea de `To Do` / `In Progress` a `Done`.
4. Actualizar `propuesta-equipo-almuerzo.md`: cambiar el emoji de estado de la épica en la tabla de trazabilidad (🔓/🔒 → ✅).
5. Crear el directorio `EP-XX/` en `docs/` y colocar ahí todos los entregables generados.

---

## 3. `EP-XX/` — Entregables reales de cada épica

Cada épica completada produce un directorio con sus entregables. `EP-01/` es el ejemplo de referencia.

### Convención de nombrado de archivos

```
EP-{epic}-S{story}-T{task}_{descripcion-kebab-case}.{ext}
```

Ejemplos:
```
EP-01-S01-T01_consultas-frecuentes.md
EP-01-S02-T01_diagrama-flujo-as-is.md
EP-01-S03-T01_user-persona.html
EP-01-S04-T01_stack-tecnologico-portal.md
EP-01-S05-T01_presentacion-del-problema.md
```

**Reglas:**
- Un archivo por sub-tarea. No agrupar múltiples sub-tareas en un mismo archivo.
- El número de sub-tarea en el nombre debe coincidir con el ID definido en el archivo de planificación `planning/EP-XX_*.md`.
- Las extensiones válidas son `.md` (texto/diagramas), `.html` (visualizaciones), `.py`/`.js` (scripts), `.csv` (datos).
- Si una sub-tarea produce un entregable externo (URL, Figma, Google Drive), registrar el link en un archivo `.md` con el nombre correspondiente.

### EP-01 como referencia de estructura

EP-01 es la épica completada que sirve como modelo para todas las demás. Muestra cómo se documentan:

| Entregable | Tipo | Qué demuestra |
|---|---|---|
| `EP-01-S01-T01_consultas-frecuentes.md` | Markdown | Análisis cualitativo de los SOPs organizado por módulo |
| `EP-01-S01-T02_casos-de-uso.md` | Mermaid + Markdown | Diagramas de casos de uso por módulo (flowchart LR) |
| `EP-01-S02-T01_diagrama-flujo-as-is.md` | Mermaid + Markdown | Diagramas AS-IS con actores, canales y puntos de fricción por SOP |
| `EP-01-S03-T01_user-persona.html` | HTML interactivo | User persona primaria (Encargado HUB) con perfil y frustraciones |
| `EP-01-S03-T03_user-persona-mapa-necesidades.html` | HTML interactivo | Mapa de necesidades vinculado a los SOPs |
| `EP-01-S04-T01_stack-tecnologico-portal.md` | Markdown | Inspección técnica del portal Hipermaxi + propuesta de stack propio |
| `EP-01-S05-T01_presentacion-del-problema.md` | Markdown | Pitch completo: problema → solución → demo → impacto → escalabilidad |

---

## 4. Orden de lectura recomendado para agentes

Si un agente entra frío a este repositorio sin contexto previo, debe leer en este orden:

```
1. docs/README.md                                          ← Este archivo
2. docs/base_problem_files/transcripcion_desafio_hipermaxi.md  ← Qué pide Hipermaxi
3. docs/planning/propuesta-equipo-almuerzo.md              ← Qué estamos construyendo
4. docs/base_problem_files/*.md (los 6 SOPs)               ← Datos reales del negocio
5. docs/EP-01/ (todos los archivos)                        ← Análisis ya realizado
6. docs/planning/EP-XX_*.md (épica en la que se trabaja)   ← Qué hacer a continuación
```

### Árbol de dependencias de documentación

```
transcripcion_desafio_hipermaxi.md
        │
        └── base_problem_files/*.md (SOPs)
                    │
                    ├── EP-01/ (análisis y definición)
                    │       │
                    │       ├── planning/EP-02_*.md (base de conocimiento RAG)
                    │       ├── planning/EP-04_*.md (widget UI/UX)
                    │       └── planning/EP-09_*.md (modelo de negocio)
                    │
                    └── planning/propuesta-equipo-almuerzo.md (estado global)
```

---

## 5. Épicas y su estado actual

| ID | Épica | Directorio de entregables | Estado |
|---|---|---|---|
| EP-01 | Análisis y Definición del Problema | `docs/EP-01/` | ✅ Completado |
| EP-02 | Base de Conocimiento (RAG) | `docs/EP-02/` ← por crear | 🔄 In Progress |
| EP-03 | Agente IA — Motor Conversacional | `docs/EP-03/` ← por crear | 🔄 In Progress |
| EP-04 | UI/UX — Widget Embebido | `docs/EP-04/` ← por crear | 🔄 In Progress |
| EP-05 | Integración con el Portal Web | `docs/EP-05/` ← por crear | 🔒 Bloqueado |
| EP-06 | Derivación a Soporte Humano | `docs/EP-06/` ← por crear | 🔒 Bloqueado |
| EP-07 | Trazabilidad e Historial | `docs/EP-07/` ← por crear | 🔒 Baja prioridad |
| EP-08 | Costos de Implementación | `docs/EP-08/` ← por crear | 🔒 Bloqueado |
| EP-09 | Modelo de Negocio | `docs/EP-09/` ← por crear | 🔄 In Progress |

---

## 6. Qué NO hacer con esta documentación

- **No modificar** ningún archivo dentro de `base_problem_files/`. Son los documentos originales de Hipermaxi.
- **No crear entregables** directamente en `docs/planning/`. Los archivos de planning son backlog, no productos.
- **No crear un directorio `EP-XX/`** sin haber completado las sub-tareas correspondientes en el archivo de planning.
- **No usar nombres de archivo genéricos** (ej. `diagrama.md`, `notas.md`). Siempre seguir la convención `EP-XX-SYY-TZZ_descripcion.ext`.
- **No marcar sub-tareas como `Done`** en un archivo de planning si el entregable no existe en `docs/EP-XX/`.

---

*Última actualización: Bloque 3 — Innova Hack Santa Cruz 2026 · 30 de mayo*
*Mantenido por: Diego (Product Owner)*
