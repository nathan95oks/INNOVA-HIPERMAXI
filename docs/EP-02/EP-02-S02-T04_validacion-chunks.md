# EP-02-S02-T04 — Validación de chunks
**Épica:** EP-02 — Base de Conocimiento
**Estado:** Completado
**Responsable:** Nathanael

## Objetivo
Validar que los chunks generados cumplan con la longitud esperada y con una separación correcta por SOP.

## Validaciones realizadas
- Conteo de chunks por documento.
- Revisión de tamaño máximo por fragmento.
- Confirmación de que ningún chunk mezcle SOPs distintos.

## Resultado
Los chunks quedaron aptos para ser usados en embeddings y búsqueda semántica.

## Nota
Esta validación ayuda a detectar ruido antes de cargar el vector store.