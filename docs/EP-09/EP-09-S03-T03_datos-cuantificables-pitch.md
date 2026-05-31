# EP-09-S03-T03 — Datos Cuantificables del Pitch

**Sub-tarea de:** EP-09-S03 — Métricas de Impacto y ROI  
**Responsable:** Diego  
**Estado:** Done  
**Fecha:** 2026-05-31  

> **Propósito de este archivo:** Documentar todos los datos cuantificables utilizados en el pitch, clasificados por origen (Hipermaxi / Industria / Estimación del equipo), con fuente, nivel de confianza y respuesta preparada si el jurado cuestiona el dato.

---

## Clasificación de fuentes

| Tipo | Qué significa | Cómo presentarlo en el pitch |
|---|---|---|
| 🔴 **Hipermaxi** | Dato explícito en los SOPs o en la transcripción del desafío | "Según los documentos operativos de Hipermaxi..." |
| 🔵 **Industria** | Estudio primario de firma reconocida (Gartner, McKinsey, Accenture, Zendesk) | "Según [firma], [año]..." |
| 🟡 **Estimación** | Cálculo del equipo basado en SOPs + benchmarks | "Estimación del equipo basada en los SOPs..." |

---

## BLOQUE A — Datos de Hipermaxi (fuente de verdad, no cuestionables)

Estos datos provienen directamente de los SOPs entregados por Hipermaxi y del diagrama AS-IS documentado en EP-01-S02.

| Dato | Número | Fuente exacta | Uso en pitch |
|---|---|---|---|
| Procesos críticos sin autoservicio | **6** | SOP-SR-01, SR-02, SR-03, SOP-04, 05, 06 | Slide de Cuantificación |
| Actores involucrados por solicitud simple | **3** | SOP-SR-01: Proveedor → Compras → Soporte TI | Slide de Cuantificación |
| Etapas ITIL para dar una contraseña | **4** | SOP-SR-01: Submission → Approval → Fulfillment → Closure | Slide de Cuantificación |
| Consultas resueltas sin intervención humana hoy | **0%** | Lógica de todos los SOPs — ninguno contempla autoservicio | Slide de Cuantificación |
| Demora por reprocesos documentados | **1 a 5 días** | AS-IS S6: F3 (1-3d), F4a (2-3d), F5 (1-5d) | Slide de Cuantificación |
| Canal de entrada declarado por Hipermaxi | **WhatsApp informal** | SOP-SR-01 Sección 11: "Canal informativo no formal" | Slide Problema |
| Intercambios WhatsApp/correo por solicitud | **2 a 4** | EP-01-S05-T01 derivado de flujos AS-IS | Slide Problema |
| Visibilidad en tiempo real para el proveedor | **0%** | EP-01-S05-T01 explícito | Slide Problema |

---

## BLOQUE B — Datos de industria (estudios primarios, alta confianza)

### B1 · Riesgo de deserción de proveedores

> **"El 80% de los compradores B2B cambiaron de proveedor cuando el servicio no cumplió sus expectativas."**

| Campo | Detalle |
|---|---|
| **Fuente** | Accenture Interactive, "Service Is the New Sales" |
| **Año** | 2019 |
| **Metodología** | 748 compradores B2B + 1,499 vendedores B2B, 10 países, 16 industrias |
| **URL** | https://newsroom.accenture.com/news/2019/80-percent-of-b2b-buyers-have-switched |
| **Confianza** | 🟢 ALTA — fuente primaria verificable |
| **Uso en pitch** | Slide de Cuantificación — el dato que asusta a Hipermaxi |
| **Si el jurado pregunta** | "Estudio primario de Accenture, 2019. La tendencia se intensificó post-pandemia — McKinsey 2024 confirma que el 73% de compradores B2B ahora exigen canales digitales." |

---

### B2 · Costo del contacto manual vs. autoservicio

> **"Atender una consulta por canal asistido cuesta $13.50. Por autoservicio: $1.84. Ratio: 7x."**

| Campo | Detalle |
|---|---|
| **Fuente** | Gartner, "Benchmarks to Assess Your Customer Service Costs" |
| **Año** | 2024 |
| **Documento ID** | Gartner #5164231 |
| **URL** | https://www.gartner.com/en/documents/5164231 |
| **Confianza** | 🟢 ALTA — Gartner investigación primaria, referenciada en prensa |
| **Uso en pitch** | Slide de Cuantificación / Impacto |
| **Cálculo aplicado a Hipermaxi** | 200 consultas/mes × $13.50 = **$2,700/mes** manual vs. 200 × $1.84 = **$368/mes** autoservicio (estimación del equipo) |
| **Si el jurado pregunta** | "Dato primario de Gartner 2024. El cálculo de $2,700 es estimación del equipo basada en los SOPs de Hipermaxi — no es dato medido." |
| **Nota** | Existe una versión 2019 del mismo Gartner con ratio de 80x ($8.01 vs $0.10). No usar ese número — el dato actualizado de 7x es más conservador y más defendible. |

---

### B3 · Brecha de rendimiento entre líderes y rezagados digitales

> **"Las empresas líderes en canales digitales B2B crecen 13.5% en EBIT. Las rezagadas: 1.8%."**

| Campo | Detalle |
|---|---|
| **Fuente** | McKinsey B2B Pulse 2024, "Five Fundamental Truths: How B2B Winners Keep Growing" |
| **Año** | 2024 |
| **URL** | https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/five-fundamental-truths-how-b2b-winners-keep-growing |
| **Confianza** | 🟢 ALTA — McKinsey investigación primaria, serie anual |
| **Uso en pitch** | Slide de Escalabilidad / Impacto estratégico |
| **Si el jurado pregunta** | "McKinsey B2B Pulse 2024, comparativa directa entre empresas con madurez omnicanal alta vs. baja." |

---

### B4 · Expectativa de autoservicio del comprador B2B

> **"El 67% de los compradores B2B prefiere resolver sus dudas por autoservicio antes que hablar con alguien."**

| Campo | Detalle |
|---|---|
| **Fuente** | Zendesk Customer Service Statistics 2025 |
| **URL** | https://www.zendesk.com/blog/customer-service-statistics/ |
| **Confianza** | 🟢 ALTA — Zendesk investigación primaria |
| **Uso en pitch** | Argumento de producto: el proveedor YA quiere el autoservicio |

> **"El estándar B2B para resolución de soporte es menos de 2 horas. Con procesos manuales/WhatsApp, el promedio real es 15 horas."**

| Campo | Detalle |
|---|---|
| **Fuente** | Thena B2B Support Benchmarks 2025 / JitBit análisis de 1,000 empresas |
| **URL** | https://www.thena.ai/post/b2b-customer-support-response-time-benchmarks |
| **Confianza** | 🟡 MEDIA — dataset real pero no es firma tier-1. Usar como "promedio de industria observado". |
| **Uso en pitch** | Contraste expectativa (2h) vs. realidad documentada en Hipermaxi (1-5 días) |
| **Si el jurado pregunta** | "El benchmark de 2 horas es estándar Zendesk SLA. El promedio de 15 horas es de JitBit sobre 1,000 empresas — no es específico de Hipermaxi, es la referencia de industria para procesos manuales." |

---

### B5 · Preferencia digital del comprador B2B (McKinsey)

> **"El 73% de los compradores B2B ahora realiza compras a través de canales digitales."**
> **"El 61% prefiere una experiencia sin representante humano para consultas simples."**

| Campo | Detalle |
|---|---|
| **Fuente 1** | McKinsey B2B Pulse 2024 |
| **Fuente 2** | Gartner Sales Survey, junio 2025 |
| **URL Gartner** | https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent |
| **Confianza** | 🟢 ALTA — ambas fuentes primarias recientes |
| **Uso en pitch** | Contexto de mercado / escalabilidad SaaS |

---

## BLOQUE C — Estimaciones del equipo (siempre etiquetar)

Estos números son **cálculos del equipo** basados en los SOPs de Hipermaxi + benchmarks de industria. Son proyecciones, no datos medidos. **Siempre presentarlos con la etiqueta "estimación del equipo".**

| Dato | Número | Metodología | Fuente de los inputs |
|---|---|---|---|
| Consultas mensuales estimadas | **~200** | Red activa de proveedores Hipermaxi (ciudad múltiple) | Estimación del equipo |
| % automatizable con los 6 SOPs | **65–70%** | SOPs SR-01, SR-02, SR-03, SOP-04, 05, 06 cubren flujos completos | EP-01-S05, EP-09-S03 |
| Costo mensual soporte actual (estimado) | **~$2,700** | 200 × $13.50 (Gartner) | Gartner + estimación equipo |
| Costo mensual con autoservicio (estimado) | **~$368** | 200 × $1.84 (Gartner) | Gartner + estimación equipo |
| Ahorro mensual estimado | **~$2,332** | $2,700 − $368 | Estimación del equipo |
| Ahorro anual estimado | **~$27,984** | $2,332 × 12 | Estimación del equipo |
| Horas de soporte mensuales ahorradas | **~58 hs** | 200 × 70% × 25 min / 60 | Estimación del equipo |

> **Nota de integridad:** Estos números escalan lógicamente. El jurado no espera precisión contable — espera metodología razonable. Lo que no es negociable es que el equipo pueda explicar de dónde viene cada número si le preguntan.

---

## Guía de uso en el pitch

### Slide Cuantificación del Problema (datos Hipermaxi + industria)

```
     0%          3 actores      1–5 días       80%
consultas     para dar una    de demora por   de proveedores B2B
sin humano    contraseña      reproceso       cambian de proveedor
(SOPs)        (SOP-SR-01)     evitable        por mal servicio
                              (AS-IS S6)      (Accenture 2019)
```

### Slide Impacto / ROI

```
    $13.50              7x                 67%
cuesta cada        más caro atender    de compradores B2B
contacto manual    por WhatsApp que    prefieren resolver
hoy                por autoservicio    solos (Zendesk 2025)
(Gartner 2024)     (Gartner 2024)
```

### Frase de remate (validada)

> *"Hipermaxi no tiene un problema de soporte. Tiene un problema de escala que hoy se disfraza de WhatsApp."*

---

## Datos que NO van en el deck sin etiquetar

| Dato | Por qué no va solo |
|---|---|
| 58 horas/mes | Estimación del equipo — siempre con "(estimación)" |
| $27,984 ahorro anual | Estimación del equipo — siempre con "(proyección)" |
| 200 consultas/mes | Estimación del equipo — siempre con "(estimación)" |

---

## Referencias completas

| Fuente | URL | Año | Confianza |
|---|---|---|---|
| Accenture "Service Is the New Sales" | https://newsroom.accenture.com/news/2019/80-percent-of-b2b-buyers-have-switched | 2019 | 🟢 Alta |
| Gartner Benchmarks Customer Service | https://www.gartner.com/en/documents/5164231 | 2024 | 🟢 Alta |
| McKinsey B2B Pulse 2024 | https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/five-fundamental-truths-how-b2b-winners-keep-growing | 2024 | 🟢 Alta |
| Gartner B2B Rep-Free Preference | https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent | 2025 | 🟢 Alta |
| Zendesk Customer Service Statistics | https://www.zendesk.com/blog/customer-service-statistics/ | 2025 | 🟢 Alta |
| Thena B2B Support Benchmarks | https://www.thena.ai/post/b2b-customer-support-response-time-benchmarks | 2025 | 🟡 Media |
| McKinsey Omnichannel B2B 2021 | https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/embracing-the-b2b-omnichannel-opportunity-in-2021 | 2021 | 🟢 Alta |
| IHL Group Inventory Distortion | https://www.ihlservices.com/news/analyst-corner/2023/07/inventory-distortion-out-of-stocks/ | 2023 | 🟢 Alta |

---

*Documento generado: Bloque Final · Innova Hack Santa Cruz 2026 · 31 de mayo*
*Corresponde a EP-09-S03-T03: Supuestos documentados del cálculo*
