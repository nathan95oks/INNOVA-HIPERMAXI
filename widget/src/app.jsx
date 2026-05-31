import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { ChatLauncher } from './components/ChatLauncher.jsx'
import { ChatWindow } from './components/ChatWindow.jsx'
import { ConfirmModal } from './components/ConfirmModal.jsx'
import { WebSocketClient } from './lib/WebSocketClient.js'

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
      if (!isOpenRef.current) {
        setUnreadCount((n) => n + 1)
      }
    } else if (msg.type === 'copilot_action') {
      handleCopilotAction(msg.payload)
    }
  }

  function handleCopilotAction(payload) {
    if (payload.action === 'highlight') {
      highlightElement(payload.target, payload.message)

      // Human-in-the-loop: mandatory confirmation before any destructive action
      if (payload.requiresConfirmation) {
        setConfirmModal({
          description: payload.message,
          onConfirm: () => {
            setConfirmModal(null)
            wsRef.current?.sendMessage({
              type: 'copilot_confirm',
              payload: { target: payload.target },
            })
          },
          onCancel: () => {
            setConfirmModal(null)
            clearHighlights()
            wsRef.current?.sendMessage({
              type: 'copilot_cancel',
              payload: { target: payload.target },
            })
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

    const tooltip = document.createElement('div')
    tooltip.className = 'hx-tooltip'
    tooltip.textContent = message
    el.appendChild(tooltip)
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
