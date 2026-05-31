# EP-02-S03-T02 — Integración con el modelo de embeddings
**Épica:** EP-02 — Base de Conocimiento
**Estado:** Completado
**Responsable:** Luis

## Objetivo
Conectar el pipeline con el modelo de embeddings seleccionado para producir representaciones vectoriales consistentes.

## Implementación actual
- Integración con el proveedor de embeddings configurado en backend.
- Uso del mismo modelo para ingesta y búsqueda.
- Configuración cargada desde variables de entorno.

## Resultado
La capa de embeddings quedó operativa para los 6 SOPs.

## Nota
Se evita mezclar modelos distintos para no degradar la similitud.