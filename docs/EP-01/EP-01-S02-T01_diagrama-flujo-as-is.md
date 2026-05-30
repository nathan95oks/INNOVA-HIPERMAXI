# EP-01-S02 — Diagrama de Flujo de Procesos Actuales (AS-IS)

> **Proyecto:** Asistente Virtual de Soporte — Portal de Proveedores Hipermaxi  
> **Sprint:** EP-01 · Subtask S02  
> **Basado en:** SOP-SR-01, SOP-SR-02, SOP-SR-03, SOP-04, SOP-05, SOP-06  
> **Versión:** 2.0 — diagramas separados, fricciones con reprocesos documentados

---

## S1 — Mapeo de actores y canales actuales

| Actor | Rol en el proceso | Canales actuales | Tipo de canal | Fricción asociada |
|---|---|---|---|---|
| **Proveedor** (Enc. HUB / Sistemas / Comercial) | Solicitante y operador del portal | WhatsApp, correo electrónico, llamada telefónica | Informal + formal | Sin trazabilidad en canales informales |
| **Soporte Hipermaxi** | Atención técnica y orientación | WhatsApp +591 78401543, teléfono corporativo, soporteti@hipermaxi.com | Informal predominante | Canal informal usado como principal |
| **Área de Compras** | Validación comercial y aprobación | soportehub@hipermaxi.com, Excel de registro manual | Formal pero manual | Proceso opaco para el proveedor |
| **Área de Facturación** | Habilitación de OC para facturar | Contacto directo con el proveedor | Informal | No hay notificación automática al proveedor |
| **Comprador asignado** | Resolución de casos AVD con error | WhatsApp, llamada directa | Informal | Sin registro del incidente |
| **Sistema GLPI** | Gestión de tickets de soporte | Registro manual por Soporte | Interno | Sin visibilidad para el proveedor |

---

## S2 — AS-IS: Solicitud de credenciales (SOP-SR-01)

```mermaid
flowchart TD
    subgraph PROVEEDOR
        A([Proveedor necesita\nacceso al portal])
        C[Envía correo a\nsoportehub@ con datos]
        E[Completa Excel\ncon información]
        F[Reenvía Excel\ncompleto]
        J[Recibe credenciales\nen correo HUB]
        K([Confirma acceso\nal portal])
    end

    subgraph SOPORTE["SOPORTE (+591 78401543)"]
        B["Atiende contacto\n(WhatsApp / llamada)\n⚠ canal informal"]
        H[Crea cuenta y\ncredenciales en sistema]
        I[Envía credenciales\nal encargado HUB]
        L[Registra ticket\nen GLPI manual]
    end

    subgraph COMPRAS["ÁREA DE COMPRAS (soportehub@)"]
        D[Recibe correo y\nenvía plantilla Excel]
        G{Información\ncompleta?}
        G2[Aprueba y deriva\na Soporte por soporteti@]
    end

    A -- "⚠ No sabe el proceso\nllama por WhatsApp" --> B
    B -- "Indica correo\nformal" --> C
    C -- "⚠ Sin confirmación\nde recepción" --> D
    D --> E
    E --> F
    F --> G
    G -- "No: datos\nincompletos\n⚠ REPROCESO" --> E
    G -- Sí --> G2
    G2 --> H
    H --> I
    I --> J
    J --> K
    K --> L
```

**Puntos de fricción — SOP-SR-01:**

| # | Fricción | Paso donde ocurre | Reproceso generado | Impacto |
|---|---|---|---|---|
| F1 | Proveedor no sabe el proceso formal y usa WhatsApp | Paso inicial | Llamada + redirección al correo formal | Alto |
| F2 | Sin confirmación de recepción del correo a soportehub | Envío del correo | El proveedor llama para verificar si llegó | Alto |
| F3 | Excel con datos incompletos — solicitud devuelta | Validación de Compras | Completar y reenviar el Excel (1–3 días extra) | Alto |
| F6 | Sin visibilidad del estado del ticket en GLPI | Todo el proceso | El proveedor llama a Soporte para saber en qué paso está | Medio |

---

## S3 — AS-IS: Carga de factura (SOP-05)

```mermaid
flowchart TD
    subgraph PROVEEDOR
        A([Proveedor tiene OC\naprobada y quiere facturar])
        C["Contacta Soporte\npor WhatsApp / llamada\n⚠ canal informal"]
        E[Intenta cargar\nfactura PDF en el portal]
        G["Corrige factura\n(monto, formato, datos)"]
        I([Factura registrada\ncorrectamente])
    end

    subgraph PORTAL["PORTAL WEB — MÓDULO OC"]
        B{"¿OC habilitada\npor Facturación?"}
        F{"¿Factura sin\nobservaciones?"}
    end

    subgraph SOPORTE["SOPORTE"]
        D["Explica que Facturación\ndebe habilitar la OC\n⚠ información que debería\nestar en el portal"]
    end

    subgraph FACTURACION["ÁREA DE FACTURACIÓN"]
        H[Habilita la OC\npara facturación]
    end

    A --> B
    B -- "No: botón invisible\n⚠ Proveedor cree que\nes error del sistema" --> C
    C --> D
    D -- "Indica que contacte\na Facturación" --> H
    H -- "Notificación no\nautomática ⚠" --> A
    B -- Sí --> E
    E --> F
    F -- "Observada:\nmonto / precio /\nproducto no coincide\n⚠ REPROCESO" --> G
    G --> E
    F -- OK --> I
```

**Puntos de fricción — SOP-05:**

| # | Fricción | Paso donde ocurre | Reproceso generado | Impacto |
|---|---|---|---|---|
| F4a | Botón de factura invisible — proveedor cree que es error del sistema | Intento de carga | Llamada a Soporte + explicación + contacto a Facturación (2–3 días) | Alto |
| F4b | Sin notificación automática cuando la OC queda habilitada | Habilitación por Facturación | Proveedor debe volver a intentar manualmente sin saber cuándo | Alto |
| F4c | Factura observada sin guía clara de corrección | Validación del portal | Corregir factura y volver a cargar (1–2 intentos adicionales) | Medio |
| F2 | Consulta resuelta por WhatsApp sin registro | Contacto a Soporte | Sin trazabilidad de la interacción | Alto |

---

## S4 — AS-IS: Aviso de Despacho (SOP-06)

```mermaid
flowchart TD
    subgraph PROVEEDOR
        A([Proveedor tiene OC\ny necesita registrar despacho])
        B[Crea Aviso de\nDespacho en el portal]
        C{Revisa cantidades\ny montos antes\nde confirmar?}
        D["Confirma el AVD\n⚠ SIN ADVERTENCIA\nde irreversibilidad"]
        F["Detecta el error\ndespués de confirmar"]
        G["Contacta a Soporte\npor WhatsApp / llamada\n⚠ canal informal"]
        L([Caso resuelto:\nnueva OC o corrección\ncon días de demora])
    end

    subgraph PORTAL["PORTAL WEB — AVD"]
        E{"Estado AVD:\nCONFIRMADO\n= bloqueado para edición"}
    end

    subgraph SOPORTE["SOPORTE"]
        H["Explica restricción:\nAVD confirmado no\npuede editarse"]
        I["Indica que contacte\nal comprador asignado\n⚠ fuera del portal"]
    end

    subgraph COMPRAS["COMPRADOR ASIGNADO"]
        J[Evalúa el caso\nfuera del portal]
        K{¿Solución posible?}
        K2[Genera nueva OC\no gestiona corrección]
    end

    A --> B
    B --> C
    C -- "Frecuentemente NO\n⚠ proveedores nuevos" --> D
    C -- Sí --> D
    D --> E
    E -- "Error detectado\npost-confirmación" --> F
    F --> G
    G --> H
    H --> I
    I -- "⚠ Proceso se mueve\nfuera del portal\nsin trazabilidad" --> J
    J --> K
    K -- Sí --> K2
    K2 --> L
    K -- "No: caso complejo" --> L
```

**Puntos de fricción — SOP-06:**

| # | Fricción | Paso donde ocurre | Reproceso generado | Impacto |
|---|---|---|---|---|
| F5a | Sistema confirma AVD sin advertencia de irreversibilidad | Confirmación del AVD | Error no prevenible — obliga a gestión externa | Alto |
| F5b | AVD con error obliga al proveedor a salir del portal | Post-confirmación | Llamada a Soporte + derivación a comprador (1–5 días) | Alto |
| F5c | Resolución del error AVD ocurre fuera del portal | Gestión con comprador | Sin trazabilidad del incidente en el sistema | Alto |
| F2 | Toda la gestión del error va por WhatsApp / llamada | Contacto a Soporte | Sin registro auditable de la incidencia | Alto |

---

## S5 — Consolidado de puntos de fricción y reprocesos

```mermaid
flowchart LR
    subgraph FRICCIONES_ALTAS["⚠ Fricciones de impacto alto"]
        F1["F1 · Proceso desconocido\nProveedor usa WhatsApp\nantes de saber el canal formal\nSOPs: SR-01, SR-02, SR-03"]
        F2["F2 · Canales informales\ncomo canal principal\nWhatsApp y llamadas sin trazabilidad\nSOPs: Todos"]
        F4["F4 · Botón de factura\ninvisible sin contexto\nProveedor cree que es error del sistema\nSOP: 05"]
        F5["F5 · AVD irreversible\nsin advertencia previa\nError post-confirmación sin solución en portal\nSOP: 06"]
    end

    subgraph FRICCIONES_MEDIAS["⚡ Fricciones de impacto medio"]
        F3["F3 · Excel manual\npropenso a errores\nRechazos por datos incompletos\nSOPs: SR-01, SR-02"]
        F6["F6 · Estado de solicitud\nopaco para el proveedor\nSin visibilidad del avance del ticket\nSOPs: SR-01, SR-02, SR-03"]
    end

    subgraph REPROCESOS["📋 Reprocesos documentados"]
        R1["R1 · 1–3 días extra\npor Excel incompleto"]
        R2["R2 · 2–3 días extra\npor OC no habilitada"]
        R3["R3 · 1–5 días extra\npor error en AVD"]
        R4["R4 · Llamadas repetidas\npor falta de estado visible"]
    end

    subgraph SOLUCION_IA["✅ Solución del Agente IA"]
        S1["Guía del proceso formal\ndesde el primer contacto"]
        S2["Canal centralizado\ncon trazabilidad completa"]
        S3["Validación de campos\nantes de enviar"]
        S4["Contexto del botón\nde factura en tiempo real"]
        S5["Alerta obligatoria\nantes de confirmar AVD"]
        S6["Dashboard de estado\nen tiempo real"]
    end

    F1 --> S1
    F2 --> S2
    F3 --> S3
    F4 --> S4
    F5 --> S5
    F6 --> S6

    F3 --> R1
    F4 --> R2
    F5 --> R3
    F6 --> R4
```

---

## S6 — Tabla resumen ejecutivo completa

| # | Fricción | SOP(s) | Actor afectado | Reproceso generado | Días extra aprox. | Impacto | Solución IA |
|---|---|---|---|---|---|---|---|
| F1 | Proveedor desconoce el proceso formal — usa WhatsApp primero | SR-01, SR-02, SR-03 | Proveedor HUB / Comercial | Llamada + redirección al canal formal | 0–1 día | Alto | Guía del proceso desde el primer contacto |
| F2 | WhatsApp y llamadas como canal principal — sin trazabilidad | Todos | Proveedor / Soporte | Sin registro auditable de la interacción | Variable | Alto | Canal centralizado con historial |
| F3 | Excel manual con datos incompletos — solicitud rechazada | SR-01, SR-02 | Proveedor Comercial | Completar y reenviar el Excel | 1–3 días | Alto | Formulario guiado con validación en tiempo real |
| F4a | Botón de factura invisible sin contexto para el proveedor | SOP-05 | Proveedor HUB | Llamada a Soporte + esperar habilitación por Facturación | 2–3 días | Alto | Explicación contextual + derivación a Facturación con un clic |
| F4b | Sin notificación cuando la OC queda habilitada para facturar | SOP-05 | Proveedor HUB | Reintentar manualmente sin saber cuándo | 1–2 días | Alto | Notificación automática al proveedor |
| F5a | AVD confirmado sin advertencia de irreversibilidad | SOP-06 | Proveedor HUB | Error no prevenible — gestión externa | 1–5 días | Alto | Alerta obligatoria antes de confirmar |
| F5b | Resolución del error AVD ocurre fuera del portal | SOP-06 | Proveedor / Soporte / Compras | Llamada + derivación al comprador asignado | 1–5 días | Alto | Registro del incidente + derivación trazable |
| F6 | Estado del ticket opaco — el proveedor no sabe en qué paso está | SR-01, SR-02, SR-03 | Proveedor HUB / Comercial | Llamadas repetidas a Soporte para saber el estado | 0–1 día | Medio | Dashboard de estado en tiempo real |
