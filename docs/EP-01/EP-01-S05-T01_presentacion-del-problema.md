# EP-01-S05 — Presentación del Problema
**Responsable:** Diego  
**Épica:** EP-01 — Análisis y Definición del Problema  
**Hackathon:** Innova Hack Santa Cruz 2026  
**Empresa:** Hipermaxi  
**Desafío:** Asistente Virtual de Soporte Operativo para Proveedores  
**Estado:** Completado  

---

## T01 — Definición del Problema con Datos de Contexto

### Contexto Operativo Actual

Hipermaxi gestiona una red amplia de proveedores que abastecen sus tiendas en múltiples ciudades de Bolivia. Toda la relación operativa con esos proveedores recae sobre canales informales y atención manual del equipo interno.

**Canales de atención actuales identificados en los SOPs:**

- WhatsApp corporativo: +591 78401543
- Correo institucional: soportehub@hipermaxi.com / soporteti@hipermaxi.com
- Llamadas telefónicas directas
- Atención manual del equipo de Soporte y del Área de Compras

### Procesos que generan consultas repetitivas

A partir de los 6 SOPs entregados por Hipermaxi, se identifican los siguientes procesos como fuentes principales de consultas:

| Código | Proceso | Consulta frecuente |
|---|---|---|
| SOP-SR-01 | Credenciales de acceso | ¿Cómo solicito mi usuario y contraseña? |
| SOP-SR-02 | Activación de código proveedor | ¿Cómo activo mi código en el catálogo? |
| SOP-SR-03 | Reenvío de credenciales | Perdí mis credenciales, ¿cómo las recupero? |
| SOP-04 | Registro de productos (Catálogo) | No puedo guardar el producto, ¿qué falta? |
| SOP-05 | Carga de facturas (OC) | No aparece el botón de factura / factura observada |
| SOP-06 | Aviso de Despacho (AVD) | No puedo editar mi AVD confirmado |

### Puntos de Fricción y Reprocesos

**1. Alta dependencia del soporte humano para consultas básicas**  
Cada proceso —incluso los más simples como consultar el estado de una credencial— requiere intervención manual de Soporte y del Área de Compras. El flujo de credenciales (SOP-SR-01) involucra al menos 4 etapas con 3 actores distintos antes de entregar acceso.

**2. Información incompleta que genera devoluciones**  
Los SOPs documentan explícitamente que las solicitudes con datos incompletos son devueltas al proveedor para corrección. Esto genera ciclos innecesarios de ida y vuelta por correo o WhatsApp.

**3. Sin canal centralizado ni trazable**  
El proveedor no sabe en qué estado está su solicitud. No existe un punto único de consulta; debe buscar entre correos, WhatsApp y llamadas para obtener una respuesta.

**4. Errores operativos por desconocimiento del portal**  
Los casos de SOP-04, SOP-05 y SOP-06 no son fallas técnicas: son errores del proveedor por no conocer el flujo correcto. Ejemplos: subir una factura en formato JPG en vez de PDF, o confirmar un AVD sin verificar las cantidades. Cada uno de esos errores genera un ticket manual en GLPI y consume tiempo de Soporte.

**5. Escalamiento innecesario**  
Casos que el propio SOP clasifica como "funcionales" (no técnicos) son atendidos por el equipo de Soporte como si fueran incidentes. Sin un agente que filtre y resuelva en primera línea, todo llega al mismo nivel de atención.

### Impacto Estimado

| Indicador | Dato |
|---|---|
| Tipos de consultas recurrentes identificadas | 6 |
| Actores involucrados por solicitud estándar | 3 (Proveedor, Soporte, Compras) |
| Intercambios de correo/WhatsApp por solicitud | 2 a 4 antes de resolverse |
| Visibilidad en tiempo real para el proveedor | 0% |
| Casos resueltos sin intervención humana | 0% (situación actual) |

### Declaración del Problema

> Los proveedores de Hipermaxi no tienen un canal digital autónomo para resolver dudas operativas ni para seguir el estado de sus solicitudes. Toda consulta —desde recuperar una contraseña hasta entender por qué no pueden cargar una factura— depende de atención humana mediante canales informales como WhatsApp y correo. Esto genera sobrecarga operativa en el equipo de Soporte, reprocesos por información incompleta, y una experiencia fragmentada para el proveedor que no escala con el crecimiento de la red comercial de Hipermaxi.

---

## T02 — Propuesta de Valor del Asistente Virtual

### ¿Qué es el Asistente Virtual de Soporte Operativo?

Un agente de IA integrado directamente al Portal Web de Proveedores de Hipermaxi que reemplaza la atención manual por una experiencia de autoservicio guiada, disponible 24/7, centralizada y trazable.

---

### Arquitectura de Accesibilidad y Seguridad: 3 Niveles de Asistencia

Para proteger los datos confidenciales y asegurar que los proveedores tengan asistencia en cada etapa de su ciclo de vida en el portal, el widget de la IA opera bajo tres niveles progresivos:

1. **Nivel 1 — Pantalla de Login (Público / Sin autenticar):**
   * **Contexto:** Estrictamente restringido a onboarding y accesos.
   * **Propósito:** Ayudar a los proveedores que no pueden entrar al sistema.
   * **Operación:** Resuelve dudas sobre la solicitud de nuevas credenciales (`SOP-SR-01`) y el reenvío de accesos (`SOP-SR-03`). Guía al usuario en el flujo del Excel formal de Compras sin exponer ningún tipo de datos internos.

2. **Nivel 2 — Portal General (Privado Base / Autenticado):**
   * **Contexto:** Funcionalidades generales del portal.
   * **Propósito:** Asistencia operativa diaria no crítica.
   * **Operación:** Ayuda al proveedor a interactuar con el catálogo de productos (`SOP-04`) y solicita la activación de códigos de proveedor (`SOP-SR-02`). Puede validar campos obligatorios y tipos de imágenes directamente en pantalla en modo Copiloto.

3. **Nivel 3 — Módulos Críticos (Privado Operativo / Transaccional):**
   * **Contexto:** Módulos de Facturación y Despachos.
   * **Propósito:** Evitar errores humanos irreversibles y validar consistencia contable.
   * **Operación:** Asiste en la carga de facturas para Órdenes de Compra (`SOP-05`) y en Avisos de Despacho (`SOP-06`).
   * **Copiloto & Seguridad Avanzada:** Valida el formato PDF, contrasta montos e introduce **alertas obligatorias de confirmación manual** antes de registrar acciones transaccionales irreversibles.

---

### Dos Modalidades de Interacción

#### Modalidad Consulta — "Pregúntame lo que necesitas"

El proveedor hace una pregunta en lenguaje natural y el asistente responde usando la base de conocimiento de Hipermaxi.

**Ejemplos:**
- *"¿Cómo solicito mis credenciales de acceso?"* → El agente explica el proceso paso a paso (SOP-SR-01) en el Nivel 1.
- *"¿Por qué no aparece el botón para cargar mi factura?"* → El agente explica que la OC no ha sido habilitada por Facturación (SOP-05) en el Nivel 3.
- *"¿Qué formato necesita la imagen de mi producto?"* → JPG o PNG, el agente lo confirma (SOP-04) en el Nivel 2.

**Valor:** Elimina la necesidad de llamar o escribir por WhatsApp para preguntas que ya tienen respuesta documentada.

---

#### Modalidad Copiloto — "Yo lo hago, vos confirmás"

El proveedor le indica al asistente lo que necesita hacer en lenguaje natural. El agente toma el control del portal mediante automatización del navegador, ejecuta las acciones directamente y el proveedor observa en tiempo real cómo se completan los pasos en pantalla.

**Ejemplos:**
- *"Agregá este producto a mi catálogo"* → El agente navega al módulo de catálogo, completa los campos con la información proporcionada, carga las imágenes y espera confirmación antes de guardar. (Nivel 2)
- *"Cargá la factura de la OC #4521"* → El agente verifica si la OC está habilitada, accede al formulario y sube el archivo, solicitando aprobación antes de enviar. (Nivel 3)
- *"Registrá mi aviso de despacho"* → El agente completa el AVD y **pausa antes de confirmar**, alertando al proveedor que esta acción es irreversible. (Nivel 3)

**Puntos de confirmación obligatorios en acciones críticas:**
- Guardar un producto nuevo en catálogo
- Enviar una factura
- Confirmar un AVD
- Cualquier acción que no tenga reversión posible en el portal

**Valor diferencial:** El proveedor no necesita aprender a usar el portal. El agente lo opera, el proveedor supervisa y aprueba. Reduce errores irreversibles y elimina la curva de aprendizaje del sistema.

---

### Cuándo deriva al soporte humano

Cuando el caso supera la capacidad del agente (incidente técnico real, solicitud que requiere aprobación del Área de Compras, cambio de Encargado HUB), el asistente deriva automáticamente al área correspondiente, dejando registro completo de la interacción para que el agente humano no pida información que el proveedor ya proporcionó.

---

### Resumen de Propuesta de Valor

| Problema actual | Lo que resuelve el asistente |
|---|---|
| Proveedor no sabe qué hacer → llama a Soporte | Responde en segundos con guía paso a paso |
| Formulario incompleto → devolución por correo | Copiloto completa campos y valida en tiempo real |
| AVD con error después de confirmar | Copiloto advierte y pausa antes de confirmar |
| Sin visibilidad del estado de solicitudes | Historial trazable dentro del portal |
| Soporte saturado con consultas básicas | Primera línea automatizada; Soporte solo atiende casos complejos |

---

## T03 — Estructura del Pitch

**Duración:** 5 minutos de presentación + 3 minutos de preguntas del jurado

---

### ① PROBLEMA — 1 minuto

> "Los proveedores de Hipermaxi hoy dependen de WhatsApp, correos y llamadas para resolver dudas que ya tienen respuesta documentada."

Puntos clave a comunicar:
- 6 procesos operativos críticos sin autoservicio
- 3 actores involucrados en cada solicitud simple
- Errores irreversibles: AVDs mal confirmados, facturas en formato incorrecto
- Soporte saturado atendiendo consultas repetitivas en vez de casos complejos
- Sin visibilidad del estado de solicitudes para el proveedor

---

### ② SOLUCIÓN — 1 minuto

> "HimaxIA: un asistente virtual integrado al Portal de Proveedores con dos modos de operación."

- **Modalidad Consulta:** responde preguntas en lenguaje natural usando los SOPs como base de conocimiento
- **Modalidad Copiloto:** opera el portal en nombre del proveedor, con confirmaciones obligatorias antes de ejecutar acciones críticas
- Derivación automática a soporte humano cuando el caso lo requiere
- Toda interacción queda registrada y trazable

---

### ③ DEMO — 2 minutos

**Escenario A — Modalidad Consulta:**

El proveedor pregunta: *"¿Por qué no puedo cargar mi factura?"*
→ El agente diagnostica, explica la condición de habilitación y orienta al área de Facturación.

**Escenario B — Modalidad Copiloto:**

El proveedor dice: *"Agregá este producto a mi catálogo."*
→ El agente navega al módulo, completa el formulario, pausa en la confirmación final y ejecuta al aprobarse. El proveedor observa cada acción en pantalla en tiempo real.

---

### ④ IMPACTO — 30 segundos

| Métrica | Situación actual | Con HimaxIA |
|---|---|---|
| Consultas resueltas sin intervención humana | 0% | +70% estimado |
| Tiempo de respuesta | Horas / días | Segundos |
| Errores operativos irreversibles | Recurrentes | Prevenidos en el punto de confirmación |
| Trazabilidad | Solo post-resolución | En tiempo real |

---

### ⑤ ESCALABILIDAD — 30 segundos

- La base de conocimiento se actualiza incorporando nuevos SOPs sin rediseñar el sistema
- El Copiloto puede extenderse a nuevos módulos del portal (órdenes de compra, reportes, AVD)
- Arquitectura desacoplada del portal actual: se integra vía script embebido, sin modificar el sistema existente de Hipermaxi
- Escala con el crecimiento de la red de proveedores sin incrementar el equipo de soporte

---

## T04 — Notas para Slides (coordinación con Melina)

### Estructura sugerida de slides

| # | Slide | Contenido clave |
|---|---|---|
| 1 | Portada | Nombre del proyecto · Equipo · Logo Hipermaxi |
| 2 | El problema | Datos de contexto + canales informales + puntos de fricción |
| 3 | Los 6 procesos críticos | Tabla de SOPs con consulta frecuente por proceso |
| 4 | La solución — HimaxIA | Diagrama: Portal + Agente + Modalidades |
| 5 | Modalidad Consulta | Captura/mockup del chat respondiendo una pregunta |
| 6 | Modalidad Copiloto | Captura/mockup del agente operando el portal en tiempo real |
| 7 | Demo en vivo | Transición a demo (Escenario A y B) |
| 8 | Impacto | Tabla comparativa antes/después |
| 9 | Escalabilidad | Arquitectura y roadmap de extensión |
| 10 | Cierre | Propuesta de valor resumida en una frase |

### Notas de diseño para Melina
- La demo del Copiloto es el momento de mayor impacto visual ante el jurado — requiere pantalla limpia y flujo estable
- Priorizar contraste alto en slides de impacto (slide 8)
- Usar colores institucionales de Hipermaxi si están disponibles
- Coordinar con Luis/Nathanael que la demo esté estable antes de las 14:00 del domingo

---

## Referencias

- Desafío Hipermaxi — `transcripcion_desafio_hipermaxi.md`
- SOP-SR-01 Credenciales de Acceso
- SOP-SR-02 Activación de Código Proveedor
- SOP-SR-03 Reenvío de Credenciales
- SOP-04 Registro de Productos
- SOP-05 Carga de Facturas
- SOP-06 Aviso de Despacho
- Portal Web Proveedores Hipermaxi — https://portal.hipermaxi.com/
