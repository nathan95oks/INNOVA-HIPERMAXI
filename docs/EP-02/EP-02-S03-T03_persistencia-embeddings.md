# EP-02-S03-T03 — Persistencia de embeddings
**Épica:** EP-02 — Base de Conocimiento
**Estado:** Completado
**Responsable:** Luis

## Objetivo
Guardar los embeddings generados junto con su relación al chunk original y al modelo usado.

## Campos relevantes
- `chunk_id`
- `vector_data`
- `model_name`
- `created_at`

## Resultado
Los vectores quedan disponibles para consultas rápidas y trazables dentro del vector store.

## Observación
La persistencia está preparada para reingesta sin pérdida de consistencia.