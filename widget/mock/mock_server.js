/**
 * EP-04-S06-T01 — WebSocket mock server
 * Simula respuestas del backend (agente IA + copiloto) para la demo.
 *
 * Flujos:
 *   uc01 — Credenciales / reenvío de acceso (Nivel 1, login)        → modo Consulta
 *   uc03 — Registro de producto en el catálogo (Nivel 2, SOP-04)    → modo Copiloto
 *   uc02 — Carga de factura en Órdenes de Compra (Nivel 3, SOP-05)  → modo Copiloto + confirmación
 *
 * Los selectores `target` coinciden con los IDs de las pantallas del portal:
 *   productos.html → #campo-barra, #campo-imagen, #btn-guardar-producto
 *   factura.html   → #zona-cargar-factura, #obs-hipermaxi, #btn-carga-completada
 *
 * Run: node mock/mock_server.js   ·   Requires: npm install ws (una vez)
 */

import { WebSocketServer } from 'ws'

const PORT = 8765

const FLOWS = {
  uc01: [
    {
      type: 'agent_response',
      payload: {
        text: 'Las credenciales de acceso se gestionan por correo, no se generan automáticamente. El proceso es:\n\n1. Escribí a soportehub@hipermaxi.com (canal oficial, administrado por el Área de Compras).\n2. Asunto: "Solicitud de Credenciales de Acceso al Portal Web de Proveedores".\n3. Compras te enviará un Excel de registro para completar tus datos y los del Encargado HUB.\n4. Una vez validado, el Área de Soporte (TI) habilita tu código y envía usuario y contraseña al correo del Encargado HUB.\n5. El acceso queda listo en 24–48 horas hábiles.\n\n¿Es una solicitud nueva o un reenvío de credenciales que ya tenías?',
      },
    },
  ],

  uc03: [
    {
      type: 'agent_response',
      payload: {
        text: 'Te ayudo a registrar el producto en el Catálogo Electrónico. El sistema no guarda hasta que estén completos los campos obligatorios y la imagen tenga el formato correcto. Revisemos juntos.',
      },
    },
    {
      type: 'copilot_action',
      payload: {
        action: 'highlight',
        target: '#campo-barra',
        message: 'Este campo es obligatorio (*). Ingresá el código de barra completo.',
        requiresConfirmation: false,
      },
    },
    {
      type: 'agent_response',
      payload: {
        text: 'Veo que la imagen no se cargó. El portal solo acepta imágenes en formato JPG o PNG — si intentás subir un PDF u otro formato, el registro se rechaza. Cargá la imagen en la sección "Imágenes del Producto".',
      },
    },
    {
      type: 'copilot_action',
      payload: {
        action: 'highlight',
        target: '#campo-imagen',
        message: 'Cargá aquí la imagen en formato JPG o PNG (no PDF).',
        requiresConfirmation: false,
      },
    },
    {
      type: 'agent_response',
      payload: {
        text: 'Cuando completes la descripción, el código de barra, la etiqueta y la imagen, presioná "Guardar" para registrar el producto. ¿Necesitás ayuda con algún otro campo?',
      },
    },
  ],

  uc02: [
    {
      type: 'agent_response',
      payload: {
        text: 'Veo que esta recepción está "Observada". Eso no es un error del sistema: es una validación de control porque la factura no coincide con la Orden de Compra. Revisemos la observación antes de adjuntar.',
      },
    },
    {
      type: 'copilot_action',
      payload: {
        action: 'highlight',
        target: '#obs-hipermaxi',
        message: 'Acá Hipermaxi indica el motivo: revisá montos, cantidades y precios contra tu OC.',
        requiresConfirmation: false,
      },
    },
    {
      type: 'agent_response',
      payload: {
        text: 'Una vez corregida la factura, adjuntala. Importante: el portal únicamente acepta archivos en formato PDF. Si subís JPG, Word o Excel, la carga será rechazada.',
      },
    },
    {
      type: 'copilot_action',
      payload: {
        action: 'highlight',
        target: '#zona-cargar-factura',
        message: 'Cargá aquí tu factura en formato PDF.',
        requiresConfirmation: false,
      },
    },
    {
      type: 'copilot_action',
      payload: {
        action: 'highlight',
        target: '#btn-carga-completada',
        message: 'Este es el botón para completar la carga de factura.',
        requiresConfirmation: false,
      },
    },
  ],

  default: [
    {
      type: 'agent_response',
      payload: {
        text: 'Entendido. Puedo ayudarte con:\n\n• Credenciales de acceso al portal (nuevas o reenvío)\n• Registro de productos en el Catálogo Electrónico\n• Carga de facturas en Órdenes de Compra\n• Avisos de Despacho (AVD)\n• Activación de código de proveedor\n\nTambién puedo derivarte al área correspondiente (Compras, Facturación o Soporte TI) si el caso lo requiere. ¿Sobre cuál tema necesitás ayuda?',
      },
    },
  ],
}

function isDoubtIntent(text) {
  const t = (text || '').toLowerCase()
  return !!t.match(/no\s+s[eé]|no\s+entiendo|no\s+puedo|qu[eé]\s+hago|donde\s+est[aá]\s+el\s+error|por\s+qu[eé]\s+falla/)
}

function isEscalationIntent(text) {
  const t = (text || '').toLowerCase()
  return !!t.match(
    /deriv[aá](me)?|soporte\s+(humano|t[eé]cnico|real)|quiero\s+hablar|hablar\s+con\s+(alguien|una\s+persona)|llamar|tel[eé]fono|no\s+(me\s+)?(ayuda|sirve|resuelve)|no\s+puedo\s+(m[aá]s|seguir|resolver)|escalar|contacto\s+directo/
  )
}

const ESCALATION_CONTACTS = [
  {
    area: 'Soporte a Proveedores',
    phone: '+591 78401543',
    email: 'soportehub@hipermaxi.com',
    hours: 'WhatsApp y correo — consultas e incidencias',
  },
  {
    area: 'Soporte TI — Habilitación técnica',
    phone: '+591 78401543',
    email: 'soporteti@hipermaxi.com',
    hours: 'Credenciales, accesos y habilitaciones del portal',
  },
]

function buildEscalationFlow() {
  return [
    {
      type: 'escalation',
      payload: {
        text: 'Este caso requiere atención del equipo de Soporte de Hipermaxi. Podés contactarlos por WhatsApp o escribir al correo oficial con el detalle de tu consulta.',
        contacts: ESCALATION_CONTACTS,
      },
    },
  ]
}

// Preguntas informativas / FAQ — respuesta de texto plano sin contexto DOM
const FAQ_RESPONSES = {
  producto_datos:
    'Para registrar un producto en el Catálogo Electrónico necesitás:\n\n' +
    '• **Descripción** del producto (nombre completo)\n' +
    '• **Código de barra** (EAN-13 o DUN-14)\n' +
    '• **Etiqueta** (código interno Hipermaxi)\n' +
    '• **Imagen** en formato JPG o PNG (mín. 800×800 px)\n\n' +
    'Todos estos campos son obligatorios — el sistema no permite guardar hasta completarlos.',

  factura_datos:
    'Para cargar una factura en una Orden de Compra necesitás:\n\n' +
    '• El **PDF de la factura** emitida a nombre de Hipermaxi S.A.\n' +
    '• Que el número de factura coincida con la OC correspondiente\n' +
    '• Ingresar desde el módulo **Órdenes de Compra** del portal\n\n' +
    'El sistema valida automáticamente el monto y los datos fiscales.',

  plazo_factura:
    'Tenés **48 horas hábiles** desde que Hipermaxi confirma la recepción de la mercadería para cargar la factura. Pasado ese plazo el sistema bloquea el acceso y debés contactar a Cuentas por Pagar.',

  avd:
    'El Aviso de Despacho (AVD) se registra **antes** de enviar la mercadería. Necesitás:\n\n' +
    '• Número de OC activa\n' +
    '• Fecha estimada de entrega\n' +
    '• Transportista y número de guía\n\n' +
    'Sin AVD registrado, el depósito de Hipermaxi no acepta la mercadería.',

  credenciales:
    'Para solicitar o recuperar credenciales de acceso al portal:\n\n' +
    '1. Usá la opción **"¿Olvidaste tu contraseña?"** en la pantalla de login\n' +
    '2. Si sos proveedor nuevo, contactá a tu ejecutivo comercial de Hipermaxi para que solicite la activación\n' +
    '3. Si el problema persiste, escribí a **soporte.proveedores@hipermaxi.com**',
}

function isInfoQuestion(text) {
  const t = (text || '').toLowerCase()
  return !!t.match(
    /qu[eé]\s+(datos|campos|informaci[oó]n|info|requisitos|documentos|archivos|necesito|se\s+pide)|para\s+registrar|para\s+cargar\s+una\s+factura|para\s+hacer\s+un\s+avd|c[oó]mo\s+funciona|qu[eé]\s+es\s+(el|la|un|una)\s*(avd|factura|cat[aá]logo|portal)|cu[aá]nto\s+(tarda|demora|tiempo)|plazo|fecha\s+l[ií]mite|cu[aá]les?\s+son\s+(los|las)\s*(requisitos|campos|datos|documentos|pasos)/
  )
}

function buildInfoResponse(text) {
  const t = (text || '').toLowerCase()
  if (t.match(/avd|despacho/)) return FAQ_RESPONSES.avd
  if (t.match(/plazo|tarda|demora|tiempo|fecha\s+l[ií]mite/)) return FAQ_RESPONSES.plazo_factura
  if (t.match(/credencial|contrase|clave|acceso|login/)) return FAQ_RESPONSES.credenciales
  if (t.match(/factura/)) return FAQ_RESPONSES.factura_datos
  if (t.match(/producto|cat[aá]logo|registr/)) return FAQ_RESPONSES.producto_datos
  return null
}

function isInvoiceCopilotIntent(text) {
  const t = (text || '').toLowerCase()
  return !!t.match(/(c[oó]mo|como).*(llen|carg|sub).*(factura)|(llen|carg|sub).*(factura)|(ayuda|gui).*(factura)/)
}

function buildInvoiceCopilotFlow(context) {
  const pageId = context?.pageId || ''

  if (pageId === 'productos.html') {
    return [
      {
        type: 'agent_response',
        payload: {
          text: 'Perfecto. Para cargar una factura, usá el acceso del portal en la esquina inferior derecha. Te lo señalo en pantalla.',
        },
      },
      {
        type: 'copilot_action',
        payload: {
          action: 'highlight',
          target: 'a[href="factura.html"]',
          message: 'Este es el acceso a Carga de Factura.',
          requiresConfirmation: false,
        },
      },
      {
        type: 'agent_response',
        payload: {
          text: 'Hacé clic vos en ese botón para ingresar. No voy a enviarte ni confirmar ninguna factura automáticamente.',
        },
      },
    ]
  }

  if (pageId === 'factura.html') {
    return [
      {
        type: 'agent_response',
        payload: {
          text: 'Ya estás en la pantalla correcta. Vamos a cargar la factura paso a paso.',
        },
      },
      {
        type: 'copilot_action',
        payload: {
          action: 'highlight',
          target: '#zona-cargar-factura',
          message: 'Subí aquí tu factura en formato PDF.',
          requiresConfirmation: false,
        },
      },
      {
        type: 'agent_response',
        payload: {
          text: 'Después de adjuntar el PDF, completá con este botón final.',
        },
      },
      {
        type: 'copilot_action',
        payload: {
          action: 'highlight',
          target: '#btn-carga-completada',
          message: 'Presioná aquí para finalizar la carga de factura.',
          requiresConfirmation: false,
        },
      },
    ]
  }

  if (pageId === 'index.html') {
    return [
      {
        type: 'agent_response',
        payload: {
          text: 'Para cargar facturas primero tenés que iniciar sesión en el portal con tus credenciales de proveedor.',
        },
      },
      {
        type: 'copilot_action',
        payload: {
          action: 'highlight',
          target: '#usuario',
          message: 'Ingresá tu usuario para continuar.',
          requiresConfirmation: false,
        },
      },
      {
        type: 'copilot_action',
        payload: {
          action: 'focus',
          target: '#usuario',
        },
      },
    ]
  }

  return [
    {
      type: 'agent_response',
      payload: {
        text: 'Te guío con la carga de factura. Abrí el módulo de Órdenes de Compra para que pueda señalarte los campos exactos.',
      },
    },
  ]
}

function buildDoubtFlow(context) {
  const issues = context?.issues || []
  if (!issues.length) {
    // Sin contexto DOM (pregunta informativa) o sin issues detectados → solo texto
    return [
      {
        type: 'agent_response',
        payload: {
          text: 'No detecté un error visible en esta pantalla. Contame con más detalle qué paso te está dando problema y te ayudo.',
        },
      },
    ]
  }

  const issue = issues[0]
  return [
    {
      type: 'agent_response',
      payload: {
        text: `Entiendo la duda. Detecté un bloqueo frecuente: ${issue.human}. Te lo marco en pantalla para corregirlo ahora.`,
      },
    },
    {
      type: 'copilot_action',
      payload: {
        action: 'highlight',
        target: issue.selector,
        message: issue.short,
        requiresConfirmation: false,
      },
    },
    {
      type: 'agent_response',
      payload: {
        text: issue.explanation,
      },
    },
  ]
}

function detectFlow(text) {
  const t = text.toLowerCase()
  if (t.match(/producto|cat[áa]logo|imagen|barra|etiqueta|jpg|png|registr/)) return 'uc03'
  if (t.match(/factura|observ|recep|orden|\boc\b|despacho/)) return 'uc02'
  if (t.match(/credencial|contrase|clave|acceso|login|usuario|olvid|reenv[íi]o|proveedor nuevo|ser proveedor/)) return 'uc01'
  return 'default'
}

function sendFlow(ws, flowKey) {
  const flow = FLOWS[flowKey]
  flow.forEach((msg, i) => {
    setTimeout(() => {
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg))
    }, 900 + i * 700)
  })
}

function sendDynamicFlow(ws, messages) {
  messages.forEach((msg, i) => {
    setTimeout(() => {
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg))
    }, 700 + i * 650)
  })
}

const wss = new WebSocketServer({ port: PORT })
console.log(`[mock] WebSocket server listening on ws://localhost:${PORT}`)

wss.on('connection', (ws) => {
  console.log('[mock] Client connected')

  ws.on('message', (data) => {
    let msg
    try { msg = JSON.parse(data) } catch { return }
    console.log('[mock] ←', msg.type, msg.payload?.text?.slice(0, 60) ?? '')

    if (msg.type === 'user_message') {
      const text = msg.payload?.text ?? ''
      const context = msg.payload?.context ?? null
      const history = msg.payload?.history ?? []

      if (history.length) {
        console.log('[mock] history:', history.map((m) => `${m.role}: ${m.text.slice(0, 40)}`).join(' | '))
      }

      if (isInvoiceCopilotIntent(text)) {
        sendDynamicFlow(ws, buildInvoiceCopilotFlow(context))
        return
      }
      if (isEscalationIntent(text)) {
        sendDynamicFlow(ws, buildEscalationFlow())
        return
      }
      if (isDoubtIntent(text)) {
        sendDynamicFlow(ws, buildDoubtFlow(context))
        return
      }
      // Pregunta informativa / FAQ: responder con texto plano sin tocar el DOM
      if (isInfoQuestion(text)) {
        const answer = buildInfoResponse(text)
        if (answer) {
          sendDynamicFlow(ws, [{ type: 'agent_response', payload: { text: answer } }])
          return
        }
      }
      sendFlow(ws, detectFlow(text))
    } else if (msg.type === 'copilot_confirm') {
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'agent_response',
          payload: { text: '✅ Acción confirmada. La factura fue enviada exitosamente al sistema de Hipermaxi.' },
        }))
      }, 500)
    } else if (msg.type === 'copilot_cancel') {
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'agent_response',
          payload: { text: 'Entendido, cancelé la acción. Revisá los datos antes de intentar nuevamente.' },
        }))
      }, 500)
    }
  })

  ws.on('close', () => console.log('[mock] Client disconnected'))
})
