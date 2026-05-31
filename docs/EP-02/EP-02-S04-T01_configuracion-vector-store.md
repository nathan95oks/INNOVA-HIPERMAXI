# EP-02-S04-T01 — Configuración del vector store
**Épica:** EP-02 — Base de Conocimiento
**Estado:** Completado
**Responsable:** Nathanael / Adrián

## Objetivo
Configurar el almacenamiento vectorial usado por la base de conocimiento del asistente.

## Implementación actual
- Vector store persistente en disco local.
- Colección dedicada para los SOPs de Hipermaxi.
- Consultas por similitud coseno.

## Resultado
El asistente puede recuperar contexto relevante sin depender de una base externa compleja.

## Observación
La solución prioriza rapidez de despliegue para el hackathon.