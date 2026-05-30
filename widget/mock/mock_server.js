/**
 * EP-04-S06-T01 — WebSocket mock server
 * Simulates backend responses for UC-01 (credenciales) and UC-02 (carga de factura)
 *
 * Run: node mock/mock_server.js
 * Requires: npm install ws  (one-time)
 */

import { WebSocketServer } from 'ws'

const PORT = 8765

const FLOWS = {
  uc01: [
    {
      type: 'agent_response',
      payload: {
        text: 'Para obtener tus credenciales de acceso al Portal de Proveedores, seguí estos pasos:\n\n1. Contactá al Área de Compras vía correo a soportehub@hipermaxi.com\n2. Solicitá el Excel de registro de proveedor\n3. Completá el formulario con los datos de tu empresa y el Encargado HUB\n4. Devolvé el Excel firmado al mismo correo\n5. El equipo de Soporte activará tu cuenta en 24–48 horas hábiles\n\n¿Necesitás que te guíe paso a paso por el proceso?',
      },
    },
  ],

  uc02: [
    {
      type: 'agent_response',
      payload: {
        text: 'Voy a ayudarte a cargar tu factura. Asegurate de tener:\n• El PDF de la factura\n• El número de Orden de Compra (OC)\n• El monto exacto que coincida con la OC\n\nEmpecemos con el número de Orden de Compra.',
      },
    },
    {
      type: 'copilot_action',
      payload: {
        action: 'highlight',
        target: '#campo-nro-oc',
        message: 'Ingresá aquí el número de Orden de Compra (ej: OC-2026-001234)',
        requiresConfirmation: false,
      },
    },
    {
      type: 'agent_response',
      payload: {
        text: 'Perfecto. Ahora cargá el archivo PDF de tu factura y verificá que el monto coincida exactamente con la Orden de Compra. Cuando estés listo, confirmá el envío.',
      },
    },
    {
      type: 'copilot_action',
      payload: {
        action: 'highlight',
        target: '#btn-confirmar-factura',
        message: '⚠️ Al confirmar, la factura será enviada al sistema de Hipermaxi. Esta acción es irreversible.',
        requiresConfirmation: true,
      },
    },
  ],

  default: [
    {
      type: 'agent_response',
      payload: {
        text: 'Entendido. Puedo ayudarte con:\n\n• Credenciales de acceso al portal\n• Carga de facturas en Órdenes de Compra\n• Registro de productos en el catálogo\n• Avisos de Despacho (AVD)\n• Activación de código de proveedor\n\n¿Sobre cuál de estos temas necesitás ayuda?',
      },
    },
  ],
}

function detectFlow(text) {
  const t = text.toLowerCase()
  if (t.match(/credencial|contraseña|clave|acceso|login|usuario/)) return 'uc01'
  if (t.match(/factura|cargar|carga|orden|oc|compra/)) return 'uc02'
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
