# EP-SALVAVIDAS — Prototipo Funcional: Copiloto Contextual

**Commit de referencia:** `09dfcea` — "copiloto" (BetoHerbas, 31/05/2026 04:45)
**Autor:** Luis (BetoHerbas)
**Estado:** In Progress — correcciones UI en curso (Bloque Final)
**Rama origen:** `main` (commit directo sobre EP-04 anterior)

---

## Contexto

Al llegar al Bloque 4 (Dom 00:00+) el equipo identificó que el enfoque de integración widget↔backend-real no era viable en el tiempo restante. La solución propuesta no logró conectar el payload de Gemini con las acciones UI del copiloto en condiciones de demo estable.

**Decisión de equipo:** reemplazar la integración con el backend real por un **mock server contextual** que simula el comportamiento del agente con suficiente fidelidad para el pitch. El objetivo es demostrar que el copiloto puede:

1. Detectar la intención del usuario en lenguaje natural
2. Leer el estado actual del DOM de la página
3. Responder con acciones UI (highlight + foco) contextuales a lo que el proveedor ve en pantalla

---

## Lo que se implementó

### 1. Contexto de página enviado desde el widget (`app.jsx`)

Luis agregó `buildPageContext()` — una función que inspecciona el DOM en tiempo real y detecta el estado de los formularios de la página activa antes de enviar el mensaje al servidor.

**Páginas cubiertas y qué detecta:**

| Página | Qué inspecciona | Issues que detecta |
|---|---|---|
| `productos.html` | Modal `#modal-producto` | Modal cerrado (formulario no abierto), descripción vacía, código de barra vacío, etiqueta vacía, imagen no cargada |
| `factura.html` | Input `#input-factura` | Factura no adjuntada, formato no PDF |
| `index.html` | Campos `#usuario` y `#clave` | Usuario vacío, contraseña vacía |

Cada issue tiene 4 campos: `code`, `selector` (CSS del elemento problemático), `short` (tooltip), `human` (texto natural para el mensaje del agente), `explanation` (guía paso a paso).

El contexto se adjunta al `user_message` WebSocket:
```json
{
  "type": "user_message",
  "payload": {
    "text": "no sé qué falta",
    "level": 2,
    "context": {
      "pageId": "productos.html",
      "path": "/productos.html",
      "issues": [
        {
          "code": "PRODUCT_IMAGE_REQUIRED",
          "selector": "#campo-imagen",
          "short": "Cargá una imagen JPG o PNG.",
          "human": "no hay imagen cargada del producto",
          "explanation": "Subí una imagen en formato JPG o PNG (no PDF ni otros formatos)."
        }
      ]
    }
  }
}
```

---

### 2. Intención de duda — `buildDoubtFlow(context)` en mock server

Cuando el usuario expresa confusión (`"no sé"`, `"no entiendo"`, `"qué hago"`, `"ayuda"`, etc.) el mock server lee los `issues` del contexto de página recibido y:

- Si hay issues → resalta el primer elemento problemático con highlight + tooltip + mensaje explicativo
- Si no hay issues → responde que no detectó errores y ofrece verificación guiada

**Regex de detección:**
```js
/no\s+s[eé]|no\s+entiendo|no\s+puedo|qu[eé]\s+hago|ayuda|donde\s+est[aá]\s+el\s+error|por\s+qu[eé]\s+falla/
```

**Ejemplo de flujo generado (productos.html con imagen faltante):**

```
[agent_response] "Detecté un bloqueo frecuente: no hay imagen cargada del producto. Te lo marco en pantalla para corregirlo ahora."
[copilot_action]  highlight → #campo-imagen · "Cargá una imagen JPG o PNG."
[agent_response] "Subí una imagen en formato JPG o PNG (no PDF ni otros formatos)."
```

---

### 3. Intención de factura — `buildInvoiceCopilotFlow(context)` en mock server

Cuando el usuario pregunta cómo cargar una factura, el mock server adapta la respuesta según la página en que está:

| Página actual | Respuesta del copiloto |
|---|---|
| `productos.html` | Explica que debe ir a Factura → resalta `a[href="factura.html"]` (link de navegación) |
| `factura.html` | Guía paso a paso: resalta `#zona-cargar-factura` → luego `#btn-carga-completada` |
| `index.html` | Indica que debe iniciar sesión primero → resalta `#usuario` + acción `focus` |
| Cualquier otra | Respuesta genérica sin highlight |

**Regex de detección:**
```js
/(c[oó]mo|como).*(llen|carg|sub).*(factura)|(llen|carg|sub).*(factura)|(ayuda|gui).*(factura)/
```

---

### 4. `sendDynamicFlow` — envío escalonado de mensajes

Nueva función que envía secuencias de mensajes con delay incremental (`700ms + i × 650ms`) para simular que el agente "piensa" entre respuestas y que los highlights aparecen después del texto, no simultáneamente.

```js
function sendDynamicFlow(ws, messages) {
  messages.forEach((msg, i) => {
    setTimeout(() => {
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg))
    }, 700 + i * 650)
  })
}
```

---

### 5. Launcher anti-solapamiento (`app.jsx` + `widget.css`)

Luis agregó `maybeMoveLauncherAwayFromTarget(el)` — detecta si el elemento resaltado está cerca del botón naranja del launcher (esquina inferior derecha) y lo desplaza temporalmente con `.hx-launcher--avoid-target`.

```css
#hx-widget .hx-launcher--avoid-target {
  transform: translate(-190px, -100px) !important;
}
```

El launcher vuelve a su posición original con `resetLauncherPosition()` al limpiar los highlights.

---

### 6. Footer de páginas — layout fix (`portal.css`, `factura.html`, `productos.html`)

El footer de las páginas del portal mock pasó de `flex justify-between` a CSS grid de 3 columnas (`1fr auto 1fr`) para centrar el copyright independientemente del link de navegación.

```css
.hx-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.hx-footer__center { text-align: center; white-space: nowrap; }
```

---

## Selectores del portal cubiertos por el copiloto

| Selector | Página | Acción del copiloto |
|---|---|---|
| `#zona-cargar-factura` | `factura.html` | Highlight — zona de adjunto del PDF |
| `#btn-carga-completada` | `factura.html` | Highlight — botón de envío final |
| `a[href="factura.html"]` | `productos.html` | Highlight — link de navegación a factura |
| `#usuario` | `index.html` | Highlight + focus — campo de usuario en login |
| `#campo-imagen` | `productos.html` | Highlight — campo de imagen del producto |
| `#campo-descripcion` | `productos.html` | Highlight — descripción del producto |
| `#campo-barra` | `productos.html` | Highlight — código de barra |
| `#campo-etiqueta` | `productos.html` | Highlight — etiqueta del producto |

---

## Flujo completo de la demo (Bloque Final)

```
1. Abrir productos.html
2. Usuario: "cómo cargo una factura"
   → Mock detecta isInvoiceCopilotIntent → buildInvoiceCopilotFlow(contexto: productos.html)
   → Copiloto resalta el link "Ir a Carga de Factura →" en el footer
3. Usuario navega a factura.html manualmente
4. Usuario: "no sé cómo adjuntar la factura"
   → Mock detecta isDoubtIntent → buildDoubtFlow(contexto: factura.html sin archivo)
   → Copiloto resalta #zona-cargar-factura con tooltip "Subí aquí tu factura en PDF"
5. Usuario adjunta un PDF
6. Usuario: "cómo termino la carga"
   → Mock detecta isInvoiceCopilotIntent → buildInvoiceCopilotFlow(contexto: factura.html con archivo)
   → Copiloto resalta #btn-carga-completada
```

---

## Decisiones técnicas

**Por qué mock server en lugar de backend real:** El pipeline Gemini + WebSocket FastAPI estaba funcional pero la latencia real (2-4s por respuesta + query_rewriter + ChromaDB) no era adecuada para una demo en vivo. El mock server garantiza latencia controlada (700-1300ms) y respuestas 100% predecibles para el pitch.

**Por qué contexto en el payload del mensaje:** En lugar de intentar que el backend infiera el estado del formulario desde el texto del usuario, el widget envía el DOM context serializado. Esto permite que el mock (y en el futuro el backend real) tome decisiones precisas sin alucinaciones ni ambigüedades.

**Por qué `buildPageContext()` en el cliente:** El backend no tiene acceso al DOM del portal del proveedor. La única forma de leer campos del formulario en tiempo real es desde JavaScript en el browser. El widget actúa como sensor del estado de la UI.

---

## Pendiente para Bloque Final

- [ ] Validar que `#btn-carga-completada` existe en `factura.html` con ese ID exacto
- [ ] Conectar `buildPageContext()` a la detección de productos al guardar (modal abierto + campos)
- [ ] Revisar que el selector `a[href="factura.html"]` matchea exactamente el link del footer de `productos.html`

---

*Documento generado: 31 de mayo 2026 · Innova Hack Santa Cruz 2026*
*Basado en commit: `09dfcea` (BetoHerbas)*
*Ruta: `docs/EP-SALVAVIDAS/EP-SALVAVIDAS-S01-T01_copiloto-contextual-mock.md`*
