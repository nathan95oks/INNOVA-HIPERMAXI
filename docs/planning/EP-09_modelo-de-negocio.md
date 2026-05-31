# EP-09 — Modelo de Negocio

**Objetivo asociado:** Definir cómo la solución genera valor sostenible para Hipermaxi y construir el argumento de negocio para el pitch del jurado.
**Estado:** In Progress
**Bloque:** Bloque 3 (Sáb 19:00–20:30) · Bloque 4 (Sáb 21:00–Dom 12:00) — Diego
**Bloquea:** Bloque Final (pulido del pitch), slides 8–10 del deck (EP-01-S05-T04)
**Depende de:** EP-01 completado (propuesta confirmada, métricas de problema documentadas en EP-01-S05)

---

## Stories & Sub-tasks

### EP-09-S01 — Propuesta de Valor Diferencial

**Story Points:** 2
**Assignee:** Diego
**Priority:** High

**Criterio de aceptación:** Existe un documento que articula el valor de HimaxIA desde dos perspectivas diferenciadas (Hipermaxi como cliente y el proveedor como usuario final), con al menos 3 beneficios concretos y cuantificables por perspectiva. El documento es directamente usable como argumento para el pitch sin reescritura adicional.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-09-S01-T01 | Tabla de valor para Hipermaxi: reducción de carga operativa, trazabilidad, formalización de canales — con indicadores derivados de EP-01-S05 | To Do |
| EP-09-S01-T02 | Tabla de valor para el proveedor: autoservicio 24/7, resolución inmediata, eliminación de fricción — con ejemplos de los 6 SOPs | To Do |
| EP-09-S01-T03 | Frase de posicionamiento de una línea ("HimaxIA es...") apta para la portada del pitch | To Do |

---

### EP-09-S02 — Modelo de Entrega: Selección y Justificación

**Story Points:** 2
**Assignee:** Diego
**Priority:** High

**Criterio de aceptación:** Se elige y justifica una opción de modelo de entrega principal para presentar al jurado. La justificación incluye: por qué esta opción es viable para Hipermaxi hoy, cómo evoluciona a largo plazo, y qué riesgos mitiga respecto a las otras opciones. La decisión queda documentada en una tabla comparativa de máximo 1 página.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-09-S02-T01 | Tabla comparativa de las 3 opciones: Opción A (solución interna), Opción B (SaaS vertical), Opción C (licencia + implementación) — con criterios: viabilidad inmediata, escalabilidad, riesgo, revenue potencial | To Do |
| EP-09-S02-T02 | Recomendación justificada: Opción A como propuesta inmediata + Opción B como narrativa de crecimiento para el jurado | To Do |
| EP-09-S02-T03 | Párrafo de 3–4 líneas que explique la estrategia dual (vender a Hipermaxi primero, luego escalar como SaaS al sector retail boliviano) | To Do |

---

### EP-09-S03 — Métricas de Impacto y ROI para el Pitch

**Story Points:** 3
**Assignee:** Diego
**Priority:** Highest

**Criterio de aceptación:** Existe una tabla de impacto con métricas comparativas (situación actual vs con HimaxIA) y un cálculo de ROI estimado para Hipermaxi con metodología explícita. Los números son defendibles ante el jurado (fuente: SOPs + estimaciones documentadas). El slide de impacto se puede construir directamente desde esta tabla.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-09-S03-T01 | Tabla comparativa antes/después con 5 métricas operativas: % consultas resueltas sin intervención humana, tiempo de respuesta promedio, tasa de errores irreversibles, visibilidad del proveedor, carga sobre el equipo de Soporte — usando datos base de EP-01-S05 | To Do |
| EP-09-S03-T02 | Cálculo de ROI estimado para Hipermaxi: (consultas mensuales estimadas × % automatizable × tiempo ahorrado por consulta × costo/hora de Soporte) — tres escenarios: conservador, moderado, optimista | To Do |
| EP-09-S03-T03 | Supuestos documentados del cálculo: fuente de cada estimación, rango de incertidumbre, qué dato real de Hipermaxi mejoraría la precisión | ✅ Done — `docs/EP-09/EP-09-S03-T03_datos-cuantificables-pitch.md` |

---

### EP-09-S04 — Escalabilidad y Roadmap de Expansión

**Story Points:** 1
**Assignee:** Diego
**Priority:** Medium

**Criterio de aceptación:** Existe una sección de escalabilidad con dos dimensiones: (1) expansión a nuevos módulos del portal de Hipermaxi y (2) expansión a otros clientes del sector retail boliviano. Cada dimensión tiene al menos 2 puntos concretos. Puede presentarse como lista o diagrama simple.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-09-S04-T01 | Lista de módulos del portal de Hipermaxi a los que HimaxIA puede expandirse después del MVP (ej. órdenes de compra, reportes, logística) — con estimación cualitativa de complejidad | To Do |
| EP-09-S04-T02 | Argumento de replicabilidad sectorial: cómo el mismo stack (RAG + widget embebido + SOPs) se aplica a otros portales de proveedores en Bolivia (ej. otras cadenas de supermercados, distribuidoras) | To Do |

---

### EP-09-S05 — Contenido de Slides del Modelo de Negocio

**Story Points:** 3
**Assignee:** Diego
**Priority:** Highest

**Criterio de aceptación:** Existen 2 slides listos para entregar a Melina (diseño), con todo el contenido textual, datos y estructura definidos. Slide 1: impacto y ROI. Slide 2: sostenibilidad y escalabilidad. Ambos son self-contained — Melina no necesita consultar a Diego para diseñarlos. El contenido es consistente con la estructura de pitch definida en EP-01-S05-T03.

| Sub-tarea | Entregable | Estado |
|---|---|---|
| EP-09-S05-T01 | Contenido completo del Slide de Impacto (slide 8 del deck): título, tabla comparativa antes/después con 5 métricas, número de ROI destacado, fuente de los datos | To Do |
| EP-09-S05-T02 | Contenido completo del Slide de Sostenibilidad/Escalabilidad (slide 9 del deck): modelo de entrega recomendado, 3 puntos de escalabilidad, 1 frase de visión a largo plazo | To Do |
| EP-09-S05-T03 | Briefing escrito para Melina: instrucciones de diseño para cada slide (jerarquía visual, qué dato destacar, paleta sugerida, referencia a slide equivalente en EP-01-S05-T04) | To Do |

---

## Implementation Notes

**Decisión: Modelo de Entrega para el Pitch**

La propuesta tiene tres opciones documentadas. La recomendación para el pitch es presentar una **estrategia dual**:

- **Corto plazo (Opción A — Solución Interna):** Hipermaxi contrata el desarrollo e integra HimaxIA como producto propio. Es la propuesta más concreta, de menor fricción comercial y directamente demostrable con la demo del hackathon. El jurado puede imaginar el contrato real.

- **Largo plazo (Opción B — SaaS Vertical):** El mismo producto se comercializa como plataforma para otras cadenas de retail en Bolivia que usan portales de proveedores similares. No requiere rediseñar la arquitectura — el widget embebido vía script tag es inherentemente multi-tenant.

La Opción C (licencia) no se recomienda como argumento principal porque diluye el mensaje. Puede mencionarse como variante si el jurado pregunta por flexibilidad comercial.

---

**Metodología del cálculo de ROI**

Usar esta fórmula base para EP-09-S03-T02:

```
Ahorro mensual = (N° consultas/mes) × (% automatizable) × (tiempo promedio por consulta en horas) × (costo/hora del equipo de Soporte)
ROI anual estimado = Ahorro mensual × 12
```

Supuestos base (conservador):
- Consultas mensuales estimadas: 200 (red activa de proveedores)
- % automatizable con los 6 SOPs: 65–70% (EP-01-S05 estima +70%)
- Tiempo promedio por consulta manual: 20–30 minutos (incluye intercambio de correo/WhatsApp)
- Costo/hora Soporte: usar referencia salarial promedio Bolivia para roles técnicos de atención (~$3–5 USD/hora)

El jurado no espera precisión contable — espera una metodología razonable y números que escalen lógicamente. Documentar los supuestos es más valioso que afinar el número final.

---

**Relación con la estructura del pitch (EP-01-S05-T03)**

EP-09 alimenta directamente los últimos 60 segundos del pitch:

| Segmento del pitch | Fuente |
|---|---|
| ④ IMPACTO (30s) | EP-09-S03 — tabla de métricas e impacto |
| ⑤ ESCALABILIDAD (30s) | EP-09-S02 + EP-09-S04 — modelo dual + roadmap |
| Slide 8 — Impacto | EP-09-S05-T01 |
| Slide 9 — Escalabilidad | EP-09-S05-T02 |

El contenido de EP-09-S05 se entrega a Melina como briefing textual completo para que ella diseñe los slides sin bloqueo. No esperar a tener diseño para construir el argumento.

---

## References

- EP-01-S05 — Presentación del Problema: `docs/EP-01-S05_presentacion-del-problema/EP-01-S05 — Presentación del Problema.md`
  - T01: Declaración del Problema y métricas base (datos para EP-09-S03)
  - T02: Propuesta de Valor — tabla antes/después (base para EP-09-S01)
  - T03: Estructura del Pitch — segmentos ④ y ⑤ (slots de EP-09 en el deck)
  - T04: Estructura de slides — slides 8 y 9 (destinatarios de EP-09-S05)
- Propuesta de equipo: `docs/planning/propuesta-equipo-almuerzo.md` — sección EP-09 (componentes originales a definir)
- EP-04 (widget funcional): `docs/planning/EP-04_widget-embebido.md` — referencia para argumentar la viabilidad técnica del SaaS
- EP-01-S04 (stack tecnológico): `docs/EP-01-S04_stack-tecnologico-del-portal-existente/EP-01-S04 — Stack Tecnológico del Portal Existente.md` — base para el argumento de escalabilidad (script tag = multi-tenant por diseño)