import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { ChatLauncher } from './components/ChatLauncher.jsx'
import { ChatWindow } from './components/ChatWindow.jsx'
import { ConfirmModal } from './components/ConfirmModal.jsx'
import { WebSocketClient } from './lib/WebSocketClient.js'

// SOP → página del portal. Usado por el handler de "navigate".
// Las rutas son relativas al origen actual — funcionan tanto en dev como en el portal real.
const SOP_PAGE_MAP = {
  'SOP-SR-01': './landing.html',
  'SOP-SR-02': './productos.html',
  'SOP-SR-03': './index.html',
  'SOP-04':    './productos.html',
  'SOP-05':    './factura.html',
  'SOP-06':    './factura.html',
}

// Selectores que requieren ConfirmModal antes de ejecutar (acciones irreversibles, Nivel 3)
const IRREVERSIBLE_SELECTORS = ['#btn-confirmar-factura', '#btn-confirmar-avd', '#btn-confirmar']

const WELCOME_TEXTS = {
  portal: '¡Hola! Soy el asistente virtual de Hipermaxi. ¿En qué puedo ayudarte hoy?\n\nPuedo asistirte con credenciales de acceso, carga de facturas, registro de productos y Avisos de Despacho.',
  onboarding: '¡Hola! Soy el asistente de Hipermaxi para nuevos proveedores.\n\n¿Te gustaría trabajar con nosotros? Puedo orientarte sobre:\n\n• Cómo solicitar tu código de proveedor\n• Requisitos y documentación necesaria\n• Cómo acceder al portal una vez registrado\n\n¿Por dónde quieres empezar?',
}

function makeWelcome(context) {
  return {
    id: 'welcome',
    type: 'agent',
    text: WELCOME_TEXTS[context] ?? WELCOME_TEXTS.portal,
    timestamp: new Date(),
  }
}

export function App({ level, wsUrl, context = 'portal' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([makeWelcome(context)])
  const [isTyping, setIsTyping] = useState(false)
  const [wsStatus, setWsStatus] = useState('disconnected')
  const [confirmModal, setConfirmModal] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const isOpenRef = useRef(false)
  const wsRef = useRef(null)

  useEffect(() => {
    isOpenRef.current = isOpen
    if (isOpen) setUnreadCount(0)
  }, [isOpen])

  useEffect(() => {
    const ws = new WebSocketClient(wsUrl, {
      onOpen: () => setWsStatus('connected'),
      onClose: () => setWsStatus('disconnected'),
      onError: () => setWsStatus('disconnected'),
      onMessage: handleServerMessage,
    })
    wsRef.current = ws
    ws.connect()
    return () => ws.disconnect()
  }, [wsUrl])

  function handleServerMessage(msg) {
    // ── Formato real del backend FastAPI ──────────────────────────────────────
    // { mensaje, accion_ui: {tipo, selector, datos}, sop_referencia,
    //   requiere_escalamiento, confianza }
    if (msg.mensaje !== undefined) {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'agent',
          text: msg.mensaje,
          timestamp: new Date(),
        },
      ])
      if (!isOpenRef.current) setUnreadCount((n) => n + 1)

      // Disparar acción UI si el backend la incluyó
      const ui = msg.accion_ui
      if (ui && ui.tipo && ui.tipo !== 'none') {
        // Pequeño delay para que el mensaje aparezca antes que el highlight
        setTimeout(() => _dispatchUiAction(ui, msg), 420)
      }
      return
    }

    // ── Formato del mock server (compatibilidad hacia atrás) ──────────────────
    // { type: "agent_response" | "copilot_action", payload: {...} }
    if (msg.type === 'agent_response') {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'agent',
          text: msg.payload.text,
          timestamp: new Date(),
        },
      ])
      if (!isOpenRef.current) setUnreadCount((n) => n + 1)
    } else if (msg.type === 'copilot_action') {
      _handleLegacyCopilotAction(msg.payload)
    }
  }

  // ── Dispatcher de accion_ui (formato backend) ─────────────────────────────

  function _dispatchUiAction(ui, fullMsg) {
    switch (ui.tipo) {

      case 'highlight': {
        highlightElement(ui.selector, fullMsg.mensaje.split('\n')[0])
        const isIrreversible = IRREVERSIBLE_SELECTORS.some((s) => ui.selector?.includes(s.replace('#', '')))
        if (isIrreversible) {
          setConfirmModal({
            description: fullMsg.mensaje,
            alertOnly: false,
            onConfirm: () => {
              setConfirmModal(null)
              wsRef.current?.sendMessage({ type: 'copilot_confirm', payload: { target: ui.selector } })
            },
            onCancel: () => {
              setConfirmModal(null)
              clearHighlights()
              wsRef.current?.sendMessage({ type: 'copilot_cancel', payload: { target: ui.selector } })
            },
          })
        }
        break
      }

      case 'show_alert': {
        // Aviso de irreversibilidad (ej. AVD confirmado no se puede revertir).
        // Solo requiere acuse — sin Confirmar/Cancelar.
        setConfirmModal({
          description: fullMsg.mensaje,
          alertOnly: true,
          onConfirm: () => setConfirmModal(null),
          onCancel: () => setConfirmModal(null),
        })
        break
      }

      case 'navigate': {
        // Prioridad: datos.url → datos.page → mapa SOP → no hacer nada
        const dest = ui.datos?.url ?? ui.datos?.page ?? SOP_PAGE_MAP[fullMsg.sop_referencia]
        if (dest) {
          // Delay de 1.2s para que el proveedor lea el mensaje antes de la redirección
          setTimeout(() => { window.location.href = dest }, 1200)
        }
        break
      }

      default:
        break
    }
  }

  // ── Handler legacy para mock server ──────────────────────────────────────

  function _handleLegacyCopilotAction(payload) {
    if (payload.action === 'highlight') {
      highlightElement(payload.target, payload.message)
      if (payload.requiresConfirmation) {
        setConfirmModal({
          description: payload.message,
          alertOnly: false,
          onConfirm: () => {
            setConfirmModal(null)
            wsRef.current?.sendMessage({ type: 'copilot_confirm', payload: { target: payload.target } })
          },
          onCancel: () => {
            setConfirmModal(null)
            clearHighlights()
            wsRef.current?.sendMessage({ type: 'copilot_cancel', payload: { target: payload.target } })
          },
        })
      }
    } else if (payload.action === 'clear_highlights') {
      clearHighlights()
    }
  }

  function highlightElement(selector, message) {
    clearHighlights()
    const el = document.querySelector(selector)
    if (!el) return

    el.classList.add('hx-highlight')

    // Tooltip con el primer párrafo del mensaje (no más de 80 chars)
    const tooltip = document.createElement('div')
    tooltip.className = 'hx-tooltip'
    tooltip.textContent = message.length > 80 ? message.slice(0, 77) + '…' : message
    el.appendChild(tooltip)

    // Desplazar la vista al elemento resaltado si está fuera del viewport
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function clearHighlights() {
    document.querySelectorAll('.hx-highlight').forEach((el) => {
      el.classList.remove('hx-highlight')
      el.querySelectorAll('.hx-tooltip').forEach((t) => t.remove())
    })
  }

  const sendMessage = useCallback(
    (text) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: 'user', text, timestamp: new Date() },
      ])
      setIsTyping(true)
      wsRef.current?.sendMessage({
        type: 'user_message',
        payload: { text, level },
      })
    },
    [level]
  )

  function handleOpen() {
    setIsOpen((o) => !o)
  }

  return (
    <>
      <ChatLauncher
        isOpen={isOpen}
        onClick={handleOpen}
        wsStatus={wsStatus}
        unreadCount={unreadCount}
      />

      {isOpen && (
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          onSend={sendMessage}
          onClose={() => setIsOpen(false)}
          wsStatus={wsStatus}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          description={confirmModal.description}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}
    </>
  )
}
