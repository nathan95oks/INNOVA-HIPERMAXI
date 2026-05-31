# EP-04 — Frontend Completo: Estado Previo y Solución Implementada

**Épica:** EP-04 UI/UX Widget Embebido (alcance ampliado a portal completo)
**Rama de trabajo:** `EP-04_widget_embedido`
**Responsables:** Melina Gutiérrez (UI/UX lead, diseño, implementación), Carla (frontend base)
**Commits de referencia:** `48d82f5` (scaffold) → `b82d89b` (diseño EP-04) → `d09cf1a` (mejoras UX/UI) → `b906128` (fix Vite)
**Estado al momento de este documento:** In Progress — widget funcional, portal multi-página operativo en dev

---

## Propósito de este documento

Este entregable documenta dos cosas simultáneamente:

1. **El estado AS-IS del Portal de Proveedores de Hipermaxi** tal como existe hoy — evidencia visual y técnica de la UX actual, que justifica las decisiones de diseño tomadas en esta épica.
2. **La solución frontend implementada** en EP-04, que va más allá del scope original del planning (widget embebido) e incluye un sistema de páginas completo que mockea el portal real con las mejoras propuestas.

---

## 1. Estado Previo — Portal Real de Hipermaxi (AS-IS)

### 1.1 Descripción del portal actual

El Portal de Proveedores de Hipermaxi en producción (`https://portal.hipermaxi.com/`) es una aplicación ASP.NET con jQuery 1.12.4 y Bootstrap 3.3.7. La pantalla pública (pre-login) es una página de soporte técnico con la siguiente estructura:

| Elemento | Descripción |
|---|---|
| Header | Fondo azul marino (#213A6E), logo H naranja, texto "Portal Hipermaxi" |
| Navegación secundaria | Link "Soporte y Ayudas" sobre fondo blanco |
| CTA de login | Franja naranja ("→ Iniciar") de ancho completo |
| Contenido principal | Título "Soporte Técnico y Videos de Ayuda." sobre fondo beige |
| Barra de secciones | Fondo gris oscuro con íconos "Contáctenos" y "Videos de Ayuda" |
| Datos de contacto | Card con borde naranja: dirección BI, 7 teléfonos de soporte, email SoporteHub |
| Asistente virtual | **Inexistente** |

### 1.2 Fricciones UX identificadas (evidencia para el rediseño)

Las siguientes fricciones se identificaron a partir de la inspección del portal real y los SOPs de Hipermaxi (`base_problem_files/`):

**Fricción 1 — Barrera de entrada para proveedores nuevos**
Un proveedor que llega por primera vez al portal no tiene ninguna indicación de cómo registrarse. La pantalla pública solo muestra información de contacto telefónico. Para saber que debe solicitar credenciales al Departamento BI (SOP-SR-01), el proveedor debe llamar o conocer el proceso de antemano. No hay autoservicio.

**Fricción 2 — Pantalla de login sin guía de recuperación**
La pantalla de login no ofrece flujo de recuperación de contraseña integrado. El proveedor debe contactar soporte manualmente (SOP-SR-03). No hay indicación de a quién contactar ni cómo.

**Fricción 3 — Portal autenticado: UI de Bootstrap 3.3.7 sin modernizar**
El portal interno usa Bootstrap 3.3.7 con diseño de 2016: formularios planos, sin jerarquía visual clara, sin validación inline, sin feedback de estado. Para procesos como la carga de factura (SOP-05), el usuario debe adivinar el estado de su operación.

**Fricción 4 — No hay asistente contextual en ninguna pantalla**
El portal no dispone de ningún mecanismo de ayuda contextual. Los errores frecuentes documentados en los SOPs (OC no habilitada, formato incorrecto, AVD confirmado no editable) obligan al proveedor a llamar al soporte BI en horario laboral.

### 1.3 Stack técnico del portal real (referencia EP-01-S04)

```
Frontend: ASP.NET Web Forms / MVC
Estilos:  Bootstrap 3.3.7 + CSS custom
Scripts:  jQuery 1.12.4 + Bootstrap JS
Browser:  IE11 compatible (implica sin Shadow DOM, sin ES modules nativos)
```

> **Nota:** La incompatibilidad con Shadow DOM es la razón por la que todos los estilos del widget se scopean bajo `#hx-widget` en lugar de usar encapsulación nativa.

---

## 2. Solución Implementada — Frontend Completo EP-04

### 2.1 Scope real vs. scope original

El planning original de EP-04 definía únicamente el widget embebido (componentes de chat + WebSocket + CopilotOverlay). La implementación real amplió el alcance para construir un sistema de páginas completo que:

- **Mockea el portal real** de Hipermaxi con diseño moderno para demo del hackathon
- **Añade páginas que no existían** en el scope original: landing de onboarding, login modernizado, productos, factura con extracción AI
- **Crea un sistema CSS compartido** (`portal.css`) que unifica la identidad visual entre todas las páginas
- **Adapta el widget al contexto de cada página** mediante el sistema de contextos (`__HX_WIDGET_CONTEXT__`)

### 2.2 Arquitectura del sistema de páginas

```
widget/
├── landing.html          ← Página pública: mock del portal real + onboarding nuevos proveedores
├── index.html            ← Login: acceso autenticado para proveedores registrados
├── productos.html        ← Portal autenticado: catálogo de productos (Nivel 2)
├── factura.html          ← Portal autenticado: carga de factura con extracción AI (Nivel 3)
├── public/
│   └── portal.css        ← Sistema de diseño compartido (tokens, navbar, footer, componentes)
└── src/
    ├── main.jsx          ← Punto de entrada del widget (lee __HX_WIDGET_CONTEXT__)
    ├── app.jsx           ← Estado del widget + lógica de mensajes (WELCOME contextual)
    ├── styles/widget.css ← Estilos del widget scoped bajo #hx-widget
    └── components/
        ├── ChatLauncher.jsx   ← Botón flotante con badge de no-leídos y animación pulse
        ├── ChatWindow.jsx     ← Ventana de chat con chips de sugerencias y banner de conexión
        ├── MessageList.jsx    ← Lista de mensajes con avatar HX y fade-in animation
        ├── InputBar.jsx       ← Campo de texto con estados y submit
        ├── TypingIndicator.jsx ← Indicador de escritura
        └── ConfirmModal.jsx   ← Modal human-in-the-loop para acciones irreversibles
```

### 2.3 Flujo de navegación implementado

```
landing.html  ──────────────────────────────────────────────────────────────
(público)        Proveedor nuevo → chat widget (contexto: onboarding)
                 → guía para solicitar credenciales (SOP-SR-01)
     │
     └── [clic "Iniciar sesión"]
                 │
                 ▼
           index.html  ────────────────────────────────────────────────────
           (login)       Proveedor registrado → introduce usuario/contraseña
                         → chat widget (contexto: onboarding / SOP-SR-03)
                         → link "¿Olvidaste tu contraseña?" → abre widget precargado
                │
                └── [submit login — cualquier credencial en demo]
                           │
                           ▼
                     productos.html  ─────────────────────────────────────
                     (Nivel 2)        Catálogo de productos (SOP-04)
                                      Chat widget (contexto: portal)
                          │
                          └── [nav "Facturación"]
                                     │
                                     ▼
                               factura.html  ──────────────────────────────
                               (Nivel 3)      Carga de factura + AI (SOP-05)
                                              Chat widget (contexto: portal)
                                              Copilot: highlight #campo-nro-oc
                                              ConfirmModal: #btn-confirmar-factura
```

### 2.4 Sistema de contextos del widget

Se implementó un mecanismo de configuración por página mediante la variable global `window.__HX_WIDGET_CONTEXT__`. El widget adapta su mensaje de bienvenida y comportamiento según el contexto de la página que lo inyecta.

| Página | `__HX_WIDGET_CONTEXT__` | `__HX_WIDGET_LEVEL__` | Mensaje de bienvenida |
|---|---|---|---|
| `landing.html` | `onboarding` | 1 | Guía para nuevos proveedores: cómo solicitar código, requisitos, plazos |
| `index.html` | `onboarding` | 1 | Guía para nuevos proveedores + recuperación de contraseña |
| `productos.html` | `portal` | 2 | Asistencia general: credenciales, facturas, productos, AVD |
| `factura.html` | `portal` | 3 | Asistencia general con acceso a Copiloto transaccional |

**Implementación en código:**

```js
// main.jsx — lectura de configuración por página
const context = window.__HX_WIDGET_CONTEXT__ ?? 'portal'
render(<App level={level} wsUrl={wsUrl} context={context} />, root)

// app.jsx — mensajes de bienvenida por contexto
const WELCOME_TEXTS = {
  portal:     '¡Hola! Soy el asistente virtual de Hipermaxi...',
  onboarding: '¡Hola! Soy el asistente de Hipermaxi para nuevos proveedores...',
}
```

---

## 3. Rediseño Visual del Widget

### 3.1 Estado previo del widget (commit `48d82f5` — scaffold inicial)

El widget scaffold implementado por Carla en el Bloque 2 era funcional pero con diseño mínimo:

| Elemento | Estado previo |
|---|---|
| Botón launcher | Círculo rojo plano (#C8102E), sin gradiente, sombra simple |
| Header del chat | Fondo rojo plano, dot de estado sin distinción visual |
| Mensajes del agente | Burbuja blanca con borde gris, sin identidad visual |
| Mensajes del usuario | Burbuja roja plana |
| Typing indicator | 3 puntos rojos (conflicto visual con acciones de usuario) |
| Badge de no-leídos | Punto rojo fijo, sin contador |
| Ventana de chat | 360×520px, border-radius 14px, sombra básica |
| Sugerencias rápidas | Inexistentes |
| Banner de desconexión | Inexistente |
| Avatar del agente | Inexistente |

### 3.2 Mejoras implementadas (commit `b82d89b` + `d09cf1a`)

#### Paleta de color actualizada

La paleta migró del rojo corporativo original (#C8102E) al naranja Hipermaxi (#E8741E), más alineado con la identidad visual del portal real:

| Token | Valor anterior | Valor nuevo | Uso |
|---|---|---|---|
| Primary | `#C8102E` (rojo) | `#E8741E` (naranja) | Botón, header, mensajes usuario |
| Primary dark | `#A00D24` | `#C25A12` | Hover states |
| Primary gradient | — | `#E8741E → #A14E14` | Launcher, header, burbujas usuario |
| Typing dots | `#C8102E` | `#BDBDBD` | Indicador de escritura (neutro) |

#### Launcher (botón flotante)

```
Antes:  background: #C8102E; box-shadow básica
Después: background: linear-gradient(135deg, #E8741E, #C25A12)
         box-shadow: 0 4px 20px rgba(232, 116, 30, 0.38)
         animation: hx-pulse (cuando hay mensajes no leídos)
         badge: contador numérico (1, 2... 9+) en lugar de punto fijo
```

#### Header del chat

```
Antes:  background: #C8102E; título único "Asistente Hipermaxi"
Después: background: linear-gradient(135deg, #E8741E, #A14E14)
         título + subtítulo "Portal de Proveedores · En línea"
         dot de estado: verde (conectado) / amarillo (desconectado)
         botón cerrar: círculo semitransparente, más accesible
```

#### Mensajes

```
Antes:  li > div.bubble + time
Después: li > div.avatar(HX) + div.content > div.bubble + time
         avatar: círculo 30px con gradiente naranja, texto "HX"
         fade-in: animación hx-msg-in (opacity + translateY)
         burbujas usuario: gradiente naranja en lugar de plano
```

#### Nuevos componentes UX

**Chips de sugerencias rápidas:**
Se muestran sobre el input cuando el chat tiene solo el mensaje de bienvenida (estado inicial). Permiten al usuario empezar con un clic sin escribir:
- Credenciales de acceso
- Carga de facturas
- Registro de productos
- Avisos de Despacho

**Banner de desconexión:**
Franja amarilla (`#FFFBEA`) con texto de alerta que aparece entre el header y el body cuando `wsStatus !== 'connected'`. Reemplaza el texto "Reconectando..." que era poco visible en el header.

**Typing indicator con avatar:**
El indicador de escritura se envuelve en `.hx-typing-row` con el mismo avatar HX del agente, haciendo consistente la apariencia con los mensajes reales.

---

## 4. Sistema de Diseño Compartido (`portal.css`)

Se creó un archivo CSS base compartido entre todas las páginas del portal mock. Centraliza los tokens de diseño y componentes reutilizables:

### 4.1 Tokens de diseño

```css
:root {
  --hx-navy:      #1B3C72;   /* azul marino corporativo */
  --hx-orange:    #E8741E;   /* naranja primario */
  --hx-bg:        #F4F3EE;   /* fondo general */
  --hx-surface:   #FFFFFF;   /* tarjetas y paneles */
  --hx-border:    #E2DBD0;   /* bordes y separadores */
  --hx-text:      #1E1A14;   /* texto primario */
  --hx-text-sec:  #6B6050;   /* texto secundario */
  --hx-panel-bd:  #F5C49A;   /* borde de paneles de alerta */
}
```

### 4.2 Componentes del sistema

| Componente CSS | Clase base | Descripción |
|---|---|---|
| Navbar del portal | `.hx-navbar` | Barra de navegación sticky: logo, links, botones de acción |
| Logo | `.hx-logo` | Cuadrado naranja con letra H, border-radius 8px |
| Botón primario | `.hx-btn.hx-btn--orange` | CTA principal: gradiente naranja, pill o rectangular |
| Campo de formulario | `.hx-field + .hx-label` | Label + input con foco naranja |
| Tarjeta de panel | `.hx-panel` | Card blanca con borde, sombra suave y borde superior de color |
| Footer | `.hx-footer` | Pie de página con copyright y links legales |
| Página base | `.hx-portal` (body) | Flex column, fondo --hx-bg, tipografía del sistema |

---

## 5. Detalle por Página

### 5.1 `landing.html` — Página Pública de Onboarding

**Propósito:** Mockear la página pública actual del portal Hipermaxi (`portal.hipermaxi.com`) añadiendo la capa de asistencia para proveedores nuevos.

**Elementos que replican el portal real:**
- Header navy con logo H naranja y "Portal Hipermaxi"
- Barra "Soporte y Ayudas" con ícono de teléfono
- Franja naranja "→ Iniciar sesión como proveedor" (CTA de login)
- Barra de secciones gris oscuro: "Contáctenos" / "Videos de Ayuda"
- Tarjeta de contacto con datos reales: dirección BI, 7 teléfonos, email SoporteHub@hipermaxi.com

**Elementos añadidos por HimaxIA:**
- Card de onboarding "¿Quieres ser proveedor de Hipermaxi?" con los 3 pasos del proceso (SOP-SR-01)
- Botón "Consultar con el Asistente Virtual" que abre el widget programáticamente
- Hint informativo abajo del bloque de contacto
- Widget en contexto `onboarding`, nivel 1

**Widget config en esta página:**
```js
window.__HX_WIDGET_LEVEL__   = 1;
window.__HX_WIDGET_CONTEXT__ = 'onboarding';
```

---

### 5.2 `index.html` — Pantalla de Login

**Propósito:** Reemplaza el dev portal básico de Bootstrap 3.3.7 con una pantalla de login completa que sirve como punto de entrada para proveedores registrados.

**Elementos:**
- Navbar con logo, link "Soporte y Ayudas" y enlace de retorno a landing
- Card de login centrada: logo grande H, título "Portal de Proveedores", subtítulo
- Formulario con campos usuario (placeholder: `PROV-XXXXX`) y contraseña
- Botón "Iniciar sesión" que redirige a `productos.html` (demo: acepta cualquier credencial)
- Link "¿Olvidaste tu contraseña?" — abre el widget y precarga la consulta automáticamente
- Bloque informativo para nuevos proveedores con link al asistente virtual

**Interacción especial — precarga de consulta:**
```js
function askAssistant(text) {
  // 1. Abre el launcher si está cerrado
  // 2. Espera 350ms (tiempo de animación del widget)
  // 3. Inyecta el texto en el campo input del widget
  // 4. Dispara evento 'input' para que Preact actualice el estado
}
```
Esto permite que desde la página de login el usuario llegue al chat con una consulta específica pre-cargada, sin tener que escribir.

---

### 5.3 `factura.html` — Carga de Factura con Extracción AI

**Propósito:** Mock del módulo de carga de facturas del portal real (SOP-05) con UX mejorada que incorpora extracción inteligente de datos del PDF.

**Diseño:** Dos columnas — tarjeta principal (izquierda, 60%) y panel informativo (derecha, 40%).

**Tarjeta principal:**
- Header: ícono de archivo + "Archivo de Factura (PDF)"
- Zona de drag-and-drop: borde naranja punteado, ícono de nube, texto de instrucción
- Estado tras seleccionar archivo: ícono de check verde, "Documento Analizado"
- Campo extraído (ID: `campo-nro-oc`): label con dot naranja + badge "EXTRAÍDO POR AI", input con botones editar/confirmar
- Botón "Finalizar y Enviar" (ID: `btn-confirmar-factura`): pill shape, gradiente naranja, ancho completo

**Panel informativo:**
- Card "✦ Escaneo Inteligente": descripción del proceso AI, checkmarks "Extracción de OC y Montos" y "Validación de NIT emisor"
- Card "¿Error en el escaneo?": instrucción para edición manual, marca de agua con ilustración de robot

**IDs preservados para el Copiloto:**
- `#campo-nro-oc` — campo resaltable por el agente (HighlightHelper)
- `#btn-confirmar-factura` — acción que requiere ConfirmModal (human-in-the-loop)

**Interacción JS (demo sin backend):**
```js
fileInput.addEventListener('change', function () {
  if (this.files.length > 0) setTimeout(showAnalyzed, 700);
});
// showAnalyzed(): cambia estado zona → "Documento Analizado" + revela campo OC
```

---

### 5.4 `productos.html` — Catálogo de Productos

**Propósito:** Mock del módulo de catálogo (SOP-04) como página post-login que muestra el estado del sistema y permite navegar.

[TODO: Documentar estructura de productos.html cuando esté más desarrollada]

---

## 6. Decisiones Técnicas No Evidentes

### 6.1 Fix de compatibilidad Vite 8 + @preact/preset-vite

Vite 8.x introdujo un cambio en la resolución del JSX runtime que rompe la configuración automática del plugin `@preact/preset-vite`. El plugin no intercepta `react/jsx-dev-runtime` correctamente en esta versión.

**Solución aplicada en `vite.config.js`:**
```js
resolve: {
  alias: {
    'react':                'preact/compat',
    'react-dom':            'preact/compat',
    'react/jsx-runtime':    'preact/jsx-runtime',
    'react/jsx-dev-runtime':'preact/jsx-runtime',
  },
},
```
Estos aliases fuerzan a Vite a redirigir cualquier intento de importar React hacia los equivalentes de Preact, independientemente de si el plugin lo hace o no.

### 6.2 Unread count con `useRef` en lugar de closure directo

El contador de mensajes no leídos requiere acceso al estado `isOpen` desde dentro del callback `handleServerMessage`. Si se usa el closure directo, el callback captura el valor inicial de `isOpen` y nunca se actualiza (stale closure).

**Solución:**
```js
const isOpenRef = useRef(false)

useEffect(() => {
  isOpenRef.current = isOpen       // sincroniza ref con estado
  if (isOpen) setUnreadCount(0)    // resetea al abrir
}, [isOpen])

// En handleServerMessage:
if (!isOpenRef.current) setUnreadCount((n) => n + 1)
```

### 6.3 Precarga programática del input del widget

La función `askAssistant(text)` en `index.html` no puede acceder directamente al estado Preact del widget (es un bundle IIFE aislado). La solución es manipular el DOM del textarea y disparar el evento `input` sintético para que Preact's `onInput` handler sincronice el estado interno:

```js
field.value = text;
field.dispatchEvent(new Event('input', { bubbles: true }));
```

---

## 7. Criterios de Aceptación Cubiertos

| Criterio (del planning EP-04) | Estado | Evidencia |
|---|---|---|
| Bundle inyectable via `<script>` sin romper Bootstrap 3.3.7 | ✅ | CSS scoped bajo `#hx-widget`, IIFE format en Vite config |
| ChatLauncher con toggle open/close y notificación | ✅ | `ChatLauncher.jsx` con badge contador + pulse animation |
| ChatWindow con historial, typing indicator e input | ✅ | `ChatWindow.jsx`, `MessageList.jsx`, `TypingIndicator.jsx` |
| HighlightHelper + ConfirmModal para Copiloto | ✅ | `highlightElement()` + `ConfirmModal.jsx` en `app.jsx` |
| WebSocketClient con reconexión exponencial | ✅ | `WebSocketClient.js`: 3 intentos, delays 1s/2s/4s |
| Mock server para UC-01 y UC-02 | ✅ | `mock/mock_server.js` |
| Flujo UC-02 Copiloto: resaltado + ConfirmModal | ✅ | Testeado en `factura.html` |

**Criterios añadidos fuera del planning original:**

| Criterio adicional | Estado |
|---|---|
| Landing page de onboarding para nuevos proveedores | ✅ |
| Pantalla de login modernizada con integración del widget | ✅ |
| Sistema CSS compartido entre páginas del portal | ✅ |
| Widget context-aware (mensaje diferente por página) | ✅ |
| Badge de mensajes no leídos con contador y animación | ✅ |
| Chips de sugerencias rápidas en estado inicial | ✅ |
| Banner de desconexión WebSocket | ✅ |
| Subtítulo dinámico en header del chat (online/offline) | ✅ |
| Avatar HX en mensajes del agente | ✅ |
| Fix de compatibilidad Vite 8 + @preact/preset-vite | ✅ |

---

## 8. Tickets de Diego (EP-09 — Modelo de Negocio)

> **Nota del equipo:** Diego aún no documentó los entregables de sus tickets de EP-09. Los siguientes ítems están pendientes de entrega formal en `docs/EP-09/`:

- [ ] EP-09-S01: Propuesta de valor del asistente para Hipermaxi
- [ ] EP-09-S02: Modelo de entrega (SaaS, licencia, integración por proyecto)
- [ ] EP-09-S03: Estimación de ROI para Hipermaxi (reducción de tickets de soporte)
- [ ] EP-09-S04: Slides del pitch final

> Ver `docs/planning/EP-09_modelo-de-negocio.md` para el detalle de sub-tareas.

---

## 9. Próximos pasos para el rediseño (TO-DO)

Los siguientes ítems están identificados para continuar la mejora visual antes del pitch:

- [ ] Integrar `portal.css` en `landing.html` (actualmente usa CSS inline)
- [ ] Completar `productos.html` con tabla de catálogo y estado de activación
- [ ] Conectar el widget con el backend real (EP-03) en lugar del mock server
- [ ] Añadir estado de sesión simulado: nombre del proveedor en el navbar post-login
- [ ] Animación de transición entre páginas (page load suave)
- [ ] Test de regresión: verificar que `#campo-nro-oc` y `#btn-confirmar-factura` siguen siendo accesibles por el Copiloto después de cualquier cambio en `factura.html`

---

*Documento generado: 31 de mayo 2026 · Innova Hack Santa Cruz 2026*
*Basado en commits: `48d82f5`, `b82d89b`, `d09cf1a`, `b906128`*
*Convención de carpeta: `docs/EP-04/` — ver `docs/README.md` sección 3*
