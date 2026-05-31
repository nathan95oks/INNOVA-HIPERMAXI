# Matriz de Cobertura - EP-02-S05 (Pruebas RAG)

Este documento registra las validaciones del motor de búsqueda semántica (RAG) para asegurar que responda correctamente a los Casos de Uso y Fricciones de Hipermaxi.

> **Criterio de Éxito:** Similitud Coseno (Score) $\ge$ 0.75.

## Tabla de Resultados

| Caso de Uso (Fricción)  | Pregunta de Prueba                                                     | SOP Recuperado | Score         | ¿Cumple ($\ge$ 0.75)? |
| :------------------------| :-----------------------------------------------------------------------| :---------------| :--------------| :----------------------|
| **UC-01:** Credenciales | "¿Cómo recupero mi contraseña del portal?"                             | `[Completar]`  | `[Completar]` | `[Sí/No]`             |
| **UC-02:** Factura      | "¿Por qué mi factura sale rechazada?"                                  | `[Completar]`  | `[Completar]` | `[Sí/No]`             |
| **UC-03:** Catálogo     | "¿Cuáles son los pasos para registrar un producto nuevo?"              | `[Completar]`  | `[Completar]` | `[Sí/No]`             |
| **UC-04:** AVD          | "¿Por qué mi Aviso de Despacho sale en cero?"                          | `[Completar]`  | `[Completar]` | `[Sí/No]`             |
| **UC-05:** Activación   | "¿Cuánto demora activar mi código de proveedor?"                       | `[Completar]`  | `[Completar]` | `[Sí/No]`             |
| **UC-06:** Derivación   | "Tengo un problema urgente con el camión, necesito hablar con soporte" | `[Completar]`  | `[Completar]` | `[Sí/No]`             |

## Análisis de Gaps (Brechas de Conocimiento)

*Anota aquí si alguna pregunta no devolvió el SOP esperado o si el score fue muy bajo.*

- **Gap 1:** `[Describir gap]` -> **Solución:** Enriquecer archivo `.txt` del SOP correspondiente.
- **Gap 2:** `[Describir gap]` -> **Solución:** `[... ]`
