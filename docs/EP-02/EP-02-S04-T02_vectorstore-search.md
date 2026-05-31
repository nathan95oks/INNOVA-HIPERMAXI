# EP-02-S04-T02 — Búsqueda en el vector store
**Épica:** EP-02 — Base de Conocimiento
**Estado:** Completado
**Responsable:** Nathanael / Adrián

## Objetivo
Exponer una búsqueda semántica que reciba una consulta y devuelva los chunks más relevantes.

## Resultado
El retrieval retorna resultados ordenados por score, listos para ensamblar contexto para el chatbot.

## Mejora aplicada
Se incorporó multi-query retrieval para mejorar el recall cuando el lenguaje natural no coincide con el vocabulario del SOP.

## Observación
La búsqueda ya forma parte del flujo conversacional del backend.