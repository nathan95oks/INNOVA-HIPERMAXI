# EP-02-S02-T03 — Persistencia de chunks
**Épica:** EP-02 — Base de Conocimiento
**Estado:** Completado
**Responsable:** Nathanael

## Objetivo
Persistir los chunks generados para que puedan ser consultados por la capa vectorial del asistente.

## Datos asociados
- `document_id`
- `chunk_index`
- `content`
- `token_count`

## Resultado
Cada chunk queda trazable respecto del SOP de origen y disponible para su indexación semántica.

## Observación
La persistencia se diseñó para soportar reutilización y reingesta controlada.