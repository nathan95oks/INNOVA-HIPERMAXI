# EP-01-S02 — Diagrama de Flujo de Procesos Actuales (AS-IS)

> **Proyecto:** Asistente Virtual de Soporte — Portal de Proveedores Hipermaxi  
> **Sprint:** EP-01 · Subtask S02  
> **Basado en:** SOP-SR-01, SOP-SR-02, SOP-SR-03, SOP-04, SOP-05, SOP-06

---

## S1 — Actores y canales actuales

| Actor | Rol | Canales actuales | Fricción |
|---|---|---|---|
| **Proveedor** (Encargado HUB / Sistemas) | Solicitante | WhatsApp, correo, llamada | Sin trazabilidad |
| **Soporte Hipermaxi** | Área técnica interna | WhatsApp +591 78401543, teléfono, soporteti@ | Canal informal como principal |
| **Área de Compras** | Validación comercial | soportehub@, Excel manual | Proceso opaco para el proveedor |
| **Sistema GLPI** | Gestión de tickets | Registro manual por Soporte | Sin notificaciones automáticas |

---

## S2 — AS-IS: Solicitud de credenciales (SOP-SR-01)

```mermaid
flowchart LR
    subgraph PROVEEDOR
        A([Proveedor necesita\nacceso al portal])
        C[Envía correo a\nsoportehub@ con Excel]
        E[Completa Excel\ny reenvía]
        H[Recibe credenciales\nen correo HUB]
    end

    subgraph SOPORTE
        B[Informa canal formal\nWhatsApp / llamada]
        G[Crea credenciales\ny envía al HUB]
    end

    subgraph COMPRAS
        D[Recibe correo y\nenvía plantilla Excel]
        F[Valida info y aprueba\nDeriva a Soporte]
    end

    subgraph GLPI
        I[(Ticket registrado\nmanualmente)]
    end

    A -- "WhatsApp / llamada\n⚠ canal informal" --> B
    B --> C
    C -- "⚠ sin confirmación\nde recepción" --> D
    D --> E
    E -- "⚠ Excel propenso\na errores" --> F
    F --> G
    G --> H
    G --> I
```

**Puntos de fricción identificados:**
- ⚠ F1 — El proveedor contacta por WhatsApp/llamada antes de saber el proceso formal
- ⚠ F2 — No hay confirmación automática de recepción del correo
- ⚠ F3 — El Excel manual es propenso a errores y genera rechazos
- ⚠ F6 — El estado del ticket no es visible para el proveedor

---

## S3 — AS-IS: Carga de factura (SOP-05)

```mermaid
flowchart LR
    subgraph PROVEEDOR
        A([Tiene OC aprobada\ny quiere facturar])
        C["Llama a Soporte\n(WhatsApp)\n⚠ canal informal"]
        E[Intenta cargar\nfactura PDF]
        G[Corrige factura\ny reintenta]
    end

    subgraph PORTAL_WEB
        B{¿OC habilitada\npor Facturación?}
        F{¿Factura\nsin observaciones?}
        H([Factura registrada\ncorrectamente])
    end

    subgraph SOPORTE
        D[Explica que Facturación\ndebe habilitar primero]
    end

    A --> B
    B -- "No\n⚠ botón invisible\nsin contexto" --> C
    C --> D
    D --> A
    B -- Sí --> E
    E --> F
    F -- "Observada\n⚠ reproceso" --> G
    G --> E
    F -- OK --> H
```

**Puntos de fricción identificados:**
- ⚠ F4 — El botón de factura no aparece sin contexto: el proveedor cree que es un error del sistema
- ⚠ F2 — La consulta se resuelve por WhatsApp, sin registro
- ⚠ Reproceso — Si la factura tiene observaciones, el proveedor debe corregir y reintentar sin guía clara

---

## S4 — AS-IS: Aviso de Despacho (SOP-06)

```mermaid
flowchart LR
    subgraph PROVEEDOR
        A([Tiene OC y necesita\nregistrar despacho])
        B[Crea Aviso de\nDespacho en portal]
        C[Confirma el AVD]
        E["Llama a Soporte\n(WhatsApp / teléfono)"]
        G[Contacta a su\ncomprador asignado]
    end

    subgraph PORTAL_WEB
        D{AVD confirmado\n= bloqueado}
    end

    subgraph COMPRAS
        H[Compras evalúa\nla situación]
        I([Define acción:\nnueva OC o corrección])
    end

    A --> B
    B --> C
    C --> D
    D -- "Error detectado\n⚠ no se puede editar\nsin advertencia previa" --> E
    E --> G
    G --> H
    H --> I
```

**Puntos de fricción identificados:**
- ⚠ F5 — El sistema confirma el AVD sin advertencia de irreversibilidad
- ⚠ F5 — Un AVD con error obliga al proveedor a contactar a su comprador por fuera del portal
- ⚠ F2 — La resolución pasa por WhatsApp/llamada sin trazabilidad

---

## S5 — Consolidado de puntos de fricción

```mermaid
flowchart TD
    subgraph FRICCION_ALTA["⚠ Impacto Alto"]
        F1["F1 · Sin confirmación de recepción\nProveedor no sabe si su correo llegó"]
        F2["F2 · Canal informal como principal\nWhatsApp y llamadas sin trazabilidad"]
        F4["F4 · Botón de factura sin contexto\nProveedor cree que es error del sistema"]
        F5["F5 · AVD irreversible sin advertencia\nError no prevenible desde el portal"]
    end

    subgraph FRICCION_MEDIA["⚡ Impacto Medio"]
        F3["F3 · Excel manual propenso a errores\nRechazos por datos incompletos"]
        F6["F6 · Estado de solicitud opaco\nSin visibilidad del avance del ticket"]
    end

    subgraph SOLUCION["✅ Lo que resuelve el Agente IA"]
        R1["Confirma recepción en tiempo real"]
        R2["Centraliza todas las consultas con registro"]
        R3["Valida campos antes de enviar"]
        R4["Explica el estado del botón con contexto"]
        R5["Alerta antes de confirmar el AVD"]
        R6["Muestra estado del ticket en cualquier momento"]
    end

    F1 --> R1
    F2 --> R2
    F3 --> R3
    F4 --> R4
    F5 --> R5
    F6 --> R6
```

---

## Resumen ejecutivo

| # | Fricción | Proceso | Impacto | Solución IA |
|---|---|---|---|---|
| F1 | Sin confirmación de recepción de correo | SR-01, SR-02, SR-03 | Alto | Confirmación en tiempo real |
| F2 | WhatsApp/llamadas como canal principal | Todos | Alto | Canal centralizado con trazabilidad |
| F3 | Excel manual propenso a errores | SR-01, SR-02 | Medio | Formulario guiado con validación |
| F4 | Botón de factura invisible sin contexto | SOP-05 | Alto | Explicación contextual en el portal |
| F5 | AVD irreversible sin advertencia previa | SOP-06 | Alto | Alerta de confirmación obligatoria |
| F6 | Estado del ticket opaco | SR-01 a SR-03 | Medio | Dashboard de estado en tiempo real |
