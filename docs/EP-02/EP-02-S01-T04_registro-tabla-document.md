# EP-02-S01-T04 — Registro de documentos en la tabla DOCUMENT
**Épica:** EP-02 — Base de Conocimiento
**Estado:** Completado
**Responsable:** Luis / Nathanael

## Objetivo
Registrar los 6 documentos fuente en una entidad lógica de documentos para controlar su trazabilidad dentro de la base de conocimiento.

## Campos relevantes
- `sop_code`
- `title`
- `source_file`
- `ingested_at`
- `active`

## Resultado
La base de conocimiento quedó preparada para relacionar cada chunk y cada embedding con su documento original.

## Valor
Este registro permite auditar el origen de la información y mantener consistencia en futuras actualizaciones de los SOPs.