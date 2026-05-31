# EP-09 — Modelo de Negocio (HimaxIA)

Este documento define la viabilidad financiera, el retorno de inversión y la estrategia de crecimiento técnico (escalabilidad de código) de **HimaxIA**, desarrollado exclusivamente como una solución "In-House" (A Medida) para el ecosistema de Hipermaxi.

## 1. Propuesta de Valor Diferencial

**HimaxIA** es un *Copiloto de IA Conversacional* diseñado a la medida de la infraestructura de Hipermaxi.

**Frase de Posicionamiento para el Pitch:**
> *"HimaxIA es el copiloto B2B exclusivo que automatiza el soporte operativo del portal de Hipermaxi, transformando la atención manual por WhatsApp en autoservicio 24/7 y reduciendo las fricciones del proveedor a cero."*

### 1.1 Impacto para Hipermaxi (Optimización Operativa)
* **Reducción del 70% en la carga operativa** del equipo de soporte (Soporte HUB, Compras, TI), al absorber automáticamente las consultas repetitivas sobre accesos y carga de facturas.
* **Recuperación de +50 horas mensuales** que hoy el personal malgasta actuando como un centro de recuperación de contraseñas.
* **Trazabilidad Integral (Cero WhatsApp):** Mitigación del 100% de disputas B2B al migrar la comunicación desde el WhatsApp informal a un log de auditoría centralizado en el portal.

### 1.2 Impacto para el Proveedor (Reducción de Fricción)
* **Autoservicio 24/7 sin barreras:** Resolución de dudas funcionales en menos de 5 segundos, eliminando los actuales tiempos de espera por correo.
* **Mitigación de errores irreversibles:** El copiloto asiste al proveedor *antes* de que confirme operaciones críticas (como en Avisos de Despacho).

---

## 2. Modelo de Implementación (Exclusividad In-House)

Hemos descartado el modelo de "Software como Servicio" (SaaS) a terceros para garantizar que **HimaxIA sea un activo tecnológico exclusivo de Hipermaxi**.

*   **Esquema de Negocio:** Desarrollo a Medida + Contrato de Mantenimiento de Infraestructura IA.
*   **Apropiación:** El código y la lógica de negocio quedan bajo el paraguas de seguridad de Hipermaxi.
*   **Cobro:** Hipermaxi no paga licencias por usuario, sino un *fee* mensual que cubre los gastos de procesamiento del LLM (Google Gemini) y la base de datos vectorial (ChromaDB), además del soporte de nuestro equipo de desarrollo.

---

## 3. Retorno de Inversión (ROI) para Hipermaxi

El proyecto se justifica financieramente desde el primer mes, garantizando que el ahorro de horas hombre supere el costo de mantener la infraestructura de la IA.

### Parámetros de Operación Actuales (Bolivia)
*   **Costo de Soporte:** $4.00 USD / hora (Personal TI/Compras).
*   **Tiempo Promedio por Incidencia:** 25 minutos (0.417 horas) por caso manual.
*   **Volumen Promedio:** 200 incidencias al mes.

### Análisis de Escenarios (Ahorro vs. Costo)

*Fórmula de Ahorro = (Consultas × % Automatización) × 0.417h × $4.00*

| Métrica de Impacto | Escenario Conservador (60% Éxito) | Escenario Moderado (70% Éxito) |
| :--- | :--- | :--- |
| Casos resueltos por IA | 120 / mes | 140 / mes |
| Horas de soporte liberadas | 50 horas / mes | 58.3 horas / mes |
| **Ahorro Bruto Mensual** | **$200.00 USD** | **$233.33 USD** |
| **Mantenimiento Mensual IA** | **-$149.00 USD** | **-$149.00 USD** |
| **Ahorro Neto para Hipermaxi** | **+$51.00 USD / mes** | **+$84.33 USD / mes** |
| **ROI Anual** | **1.34x** | **1.57x** |

**Conclusión:** Al fijar el costo de mantenimiento de infraestructura en $149 USD, garantizamos que Hipermaxi obtenga un ROI positivo (+1.34x) incluso si la IA solo logra automatizar 6 de cada 10 problemas. La Inteligencia Artificial se paga sola con el ahorro operativo.

---

## 4. Escalabilidad de la Arquitectura de Código

Nuestra propuesta no depende de vender a otras empresas. Su escalabilidad radica en la robustez técnica del código (Pipeline RAG) para crecer *dentro* del ecosistema de Hipermaxi.

1.  **Escalabilidad de Conocimiento (Memoria Infinita):**
    *   Nuestra base de datos vectorial (ChromaDB) está diseñada para la **Ingesta Idempotente**. Esto significa que Hipermaxi puede añadir cientos de nuevos manuales operativos, PDFs o contratos en el futuro, y el sistema los indexará sin duplicar información ni requerir que se programe el bot desde cero.
2.  **Escalabilidad de Capacidad (Query Rewriting):**
    *   La arquitectura está modularizada. Hemos implementado un sistema de *Query Expansion* que traduce el lenguaje informal del proveedor (ej. "ayuda, no entra mi factura") a los términos técnicos de la base de datos. Si mañana Hipermaxi añade un módulo de inventarios, la IA se adaptará a esa nueva jerga sin refactorizar el backend.
3.  **Escalabilidad de Módulos (Cross-Platform):**
    *   Hoy la IA responde consultas. Mañana, al estar conectada internamente, la arquitectura permite escalar de ser un "bot de lectura" a un "agente de acción" (Function Calling), permitiéndole ejecutar acciones en las bases de datos de Hipermaxi directamente (ej. reiniciar una contraseña automáticamente si el proveedor lo aprueba en el chat).