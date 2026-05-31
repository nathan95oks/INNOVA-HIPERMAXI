# EP-02-S03-T01 — Embedding Service
**Épica:** EP-02 — Base de Conocimiento
**Estado:** Completado
**Responsable:** Luis

## Objetivo
Implementar el servicio encargado de convertir cada chunk en un vector numérico utilizable para búsqueda semántica.

## Función
- Recibe una lista de chunks.
- Genera embeddings consistentes.
- Devuelve los vectores listos para persistencia.

## Resultado
El sistema ya puede representar semánticamente el contenido de los SOPs para consultas por similitud.

## Observación
El modelo usado debe mantenerse consistente entre ingesta y consulta.