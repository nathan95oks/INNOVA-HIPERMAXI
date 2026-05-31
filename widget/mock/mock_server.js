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
        message: '⚠️ Al completar la carga, la factura se envía al sistema de Hipermaxi. Esta acción es irreversible.',
        requiresConfirmation: true,
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

const wss = new WebSocketServer({ port: PORT })
console.log(`[mock] WebSocket server listening on ws://localhost:${PORT}`)

wss.on('connection', (ws) => {
  console.log('[mock] Client connected')

  ws.on('message', (data) => {
    let msg
    try { msg = JSON.parse(data) } catch { return }
    console.log('[mock] ←', msg.type, msg.payload?.text?.slice(0, 60) ?? '')

    if (msg.type === 'user_message') {
      sendFlow(ws, detectFlow(msg.payload?.text ?? ''))
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
