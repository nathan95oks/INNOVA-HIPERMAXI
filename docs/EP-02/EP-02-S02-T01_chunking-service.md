# EP-02-S02-T01 — Chunking Service
**Épica:** EP-02 — Base de Conocimiento
**Estado:** Completado
**Responsable:** Nathanael

## Objetivo
Implementar el servicio que divide cada SOP en fragmentos semánticos recuperables por el motor RAG.

## Criterios técnicos
- Chunks de tamaño controlado.
- Solapamiento entre fragmentos para no perder contexto.
- Preservación del orden de lectura.
- Compatibilidad con recuperación por similitud.

## Resultado
El chunking produce bloques útiles para el chatbot sin cortar la lógica operativa de los procedimientos.

## Observación
La estrategia se ajustó para respetar la estructura de pasos y secciones de los SOPs.