# Handoff de Diseño — Widget Hipermaxi
**Para:** Melina  
**De:** Diego / Claude Code  
**Contexto:** El widget está implementado con valores placeholder. Tu tarea es refinar la UI directamente en los archivos listados abajo. El dev server muestra los cambios en tiempo real.

---

## Cómo ver el widget en vivo

```bash
# Terminal 1 — mock backend (simula respuestas del agente)
npm run mock

# Terminal 2 — dev server con hot reload
npm run dev
```

Abrí **http://localhost:5173** — vas a ver el portal de prueba con Bootstrap 3.3.7 (igual al portal real de Hipermaxi) y el botón flotante rojo en la esquina inferior derecha.

---

## Mapa visual → archivo

```
Botón flotante (esquina inferior derecha)
└── src/components/ChatLauncher.jsx       ← estructura HTML
    src/styles/widget.css  (.hx-launcher) ← estilos

Ventana de chat
└── src/components/ChatWindow.jsx         ← estructura (header, body, footer)
    src/styles/widget.css  (.hx-window*)  ← estilos

  Header de la ventana (barra roja con título)
  └── .hx-window__header, .hx-window__title, .hx-window__status, .hx-window__close

  Mensajes (burbujas usuario y agente)
  └── src/components/MessageList.jsx
      .hx-message--user   ← burbuja roja (usuario)
      .hx-message--agent  ← burbuja gris/blanca (agente)

  Indicador de escritura (3 puntos animados)
  └── src/components/TypingIndicator.jsx
      .hx-typing, .hx-typing__dot

  Barra de input (textarea + botón enviar)
  └── src/components/InputBar.jsx
      .hx-input, .hx-input__field, .hx-input__btn

Modal de confirmación (human-in-the-loop — CRÍTICO)
└── src/components/ConfirmModal.jsx
    .hx-modal-backdrop, .hx-modal, .hx-modal__btn--confirm / --cancel

Resaltado Copiloto (se aplica sobre elementos del portal)
└── src/styles/widget.css  (.hx-highlight, .hx-tooltip)
    — Estos estilos afectan elementos del portal, NO del widget
```

---

## Sistema de colores actual (placeholder — necesita tu aprobación)

Todo está en **`src/styles/widget.css`**. Los valores a revisar:

| Token visual | Valor actual | Qué controla |
|---|---|---|
| Color primario | `#C8102E` | Botón flotante, header, burbuja usuario, botón enviar, highlight copiloto |
| Color primario hover | `#A00D24` | Estados hover del primario |
| Fondo ventana | `#F7F7F7` | Área de mensajes |
| Burbuja agente | `white` + borde `#E8E8E8` | Mensajes del asistente |
| Fondo modal | `white` | Modal de confirmación |
| Overlay modal | `rgba(0,0,0,0.45)` | Fondo semi-transparente del modal |

**Si los colores de marca de Hipermaxi son distintos**, buscá y reemplazá `#C8102E` y `#A00D24` en `widget.css`. Son los únicos dos valores de color de marca.

---

## Tipografía actual

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
```

Si el portal de Hipermaxi usa una fuente específica (ej. Open Sans, Roboto), agregala al inicio del stack. Está definida en el selector `#hx-widget` al tope de `widget.css`.

---

## Tus tareas — EP-04-S01

### T01 — Paleta y tipografía ✏️
- Validar o corregir `#C8102E` contra los colores corporativos reales de Hipermaxi
- Confirmar tipografía
- Archivo: `src/styles/widget.css` (líneas 1–15 del selector `#hx-widget`)

### T02 — ChatLauncher (botón flotante) ✏️
- Estados a verificar en browser:
  - **Cerrado:** ícono de chat blanco sobre fondo rojo
  - **Abierto:** ícono X blanco sobre fondo gris oscuro
  - **Sin conexión:** punto rojo pequeño en esquina superior derecha del botón
- Archivos: `ChatLauncher.jsx` (íconos SVG), `.hx-launcher*` en `widget.css`

### T03 — ChatWindow ✏️
- Header: color, logo/ícono de Hipermaxi, título
- Burbujas: forma, padding, color
- Timestamps: tamaño y color
- Archivos: `ChatWindow.jsx`, `MessageList.jsx`, `.hx-window*` y `.hx-message*` en `widget.css`

### T04 — ConfirmModal ✏️
- El modal aparece cuando el agente va a ejecutar una acción irreversible (ej. confirmar factura)
- Para probarlo: abrí el chat y escribí **"factura"** (con el mock server activo)
- Revisar: jerarquía visual, wording de los botones, colores Confirmar vs Cancelar
- Archivos: `ConfirmModal.jsx`, `.hx-modal*` en `widget.css`

### T05 — CopilotOverlay (resaltado) ✏️
- El resaltado aparece en elementos del portal (no del widget)
- Para probarlo: escribí **"factura"** en el chat — va a resaltar el campo "Número de OC" del formulario
- Revisar: color del borde, intensidad del glow, estilo del tooltip
- Archivo: `.hx-highlight` y `.hx-tooltip` al final de `widget.css`

---

## Dimensiones actuales del widget

| Elemento | Valor |
|---|---|
| Botón flotante | 56×56px, posición: bottom 24px, right 24px |
| Ventana de chat | 360×520px, posición: bottom 94px, right 24px |
| Borde radius ventana | 14px |
| Borde radius burbujas | 16px (esquina interna: 4px) |

En mobile (≤420px) la ventana pasa a pantalla completa automáticamente.

---

## Cómo agregar el logo de Hipermaxi al header

En `src/components/ChatWindow.jsx`, buscá el bloque `hx-window__title` y reemplazá el texto por una imagen:

```jsx
// Antes
<div class="hx-window__title">
  <span class="hx-window__dot" />
  Asistente Hipermaxi
</div>

// Después (con logo)
<div class="hx-window__title">
  <img src="URL_DEL_LOGO" alt="Hipermaxi" height="20" style="filter: brightness(0) invert(1)" />
  Asistente
</div>
```

---

## Regla importante — aislamiento de estilos

**Todos tus estilos nuevos deben ir dentro del selector `#hx-widget { ... }`** para no romper el Bootstrap 3.3.7 del portal. La única excepción son `.hx-highlight` y `.hx-tooltip`, que *intencionalmente* viven fuera para poder afectar elementos del portal.

---

## Flujos a probar en el browser

| Qué escribir en el chat | Qué se activa |
|---|---|
| `credenciales` | UC-01: respuesta con pasos de acceso |
| `factura` | UC-02: highlight en campo OC → highlight en botón confirmar → ConfirmModal |
| Cualquier otra cosa | Respuesta genérica con listado de temas |
