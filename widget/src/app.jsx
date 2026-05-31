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

function currentPageId() {
  const path = window.location.pathname || ''
  const file = path.split('/').pop()
  return file || 'index.html'
}

function fieldValue(el) {
  if (!el) return ''
  if (typeof el.value === 'string') return el.value.trim()
  return ''
}

function buildPageContext() {
  const pageId = currentPageId()
  const issues = []

  if (pageId === 'productos.html') {
    const modal = document.getElementById('modal-producto')
    const modalOpen = modal?.classList.contains('is-open')

    if (!modalOpen) {
      issues.push({
        code: 'PRODUCT_MODAL_CLOSED',
        selector: '#btn-nuevo',
        short: 'Primero abrí el formulario con el botón Nuevo.',
        human: 'el formulario de producto todavía no está abierto',
        explanation: 'Hacé clic en "Nuevo" y luego te voy guiando campo por campo.',
      })
    } else {
      const descripcion = document.querySelector('#campo-descripcion')
      const barra = document.querySelector('#campo-barra')
      const etiqueta = document.querySelector('#campo-etiqueta')
      const imgInput = document.querySelector('#input-imagen')

      if (!fieldValue(descripcion)) {
        issues.push({
          code: 'PRODUCT_DESC_REQUIRED',
          selector: '#field-descripcion',
          short: 'La descripción es obligatoria.',
          human: 'falta completar la descripción del producto',
          explanation: 'Completá la descripción comercial del producto antes de guardar.',
        })
      }

      if (!fieldValue(barra)) {
        issues.push({
          code: 'PRODUCT_BARCODE_REQUIRED',
          selector: '#field-barra',
          short: 'Falta el código de barra.',
          human: 'el código de barra está vacío',
          explanation: 'Ingresá el código de barra completo para que el portal valide el registro.',
        })
      }

      if (!fieldValue(etiqueta)) {
        issues.push({
          code: 'PRODUCT_LABEL_REQUIRED',
          selector: '#field-etiqueta',
          short: 'Falta la etiqueta del producto.',
          human: 'la etiqueta del producto no está cargada',
          explanation: 'Completá la etiqueta para continuar con el guardado.',
        })
      }

      const hasImage = !!imgInput?.files?.length
      if (!hasImage) {
        issues.push({
          code: 'PRODUCT_IMAGE_REQUIRED',
          selector: '#campo-imagen',
          short: 'Cargá una imagen JPG o PNG.',
          human: 'no hay imagen cargada del producto',
          explanation: 'Subí una imagen en formato JPG o PNG (no PDF ni otros formatos).',
        })
      }
    }
  }

  if (pageId === 'factura.html') {
    const facInput = document.querySelector('#input-factura')
    const file = facInput?.files?.[0]

    if (!file) {
      issues.push({
        code: 'INVOICE_FILE_MISSING',
        selector: '#zona-cargar-factura',
        short: 'Adjuntá la factura en PDF.',
        human: 'no hay factura adjuntada',
        explanation: 'Adjuntá primero el archivo PDF para habilitar la carga completa.',
      })
    } else if (file.type !== 'application/pdf') {
      issues.push({
        code: 'INVOICE_INVALID_FORMAT',
        selector: '#zona-cargar-factura',
        short: 'Formato inválido: solo PDF.',
        human: 'el archivo adjunto no está en formato PDF',
        explanation: 'Volvé a cargar la factura en PDF para que el portal la acepte.',
      })
    }
  }

  if (pageId === 'index.html') {
    const user = document.querySelector('#usuario')
    const pass = document.querySelector('#clave')

    if (!fieldValue(user)) {
      issues.push({
        code: 'LOGIN_USER_MISSING',
        selector: '#usuario',
        short: 'Ingresá tu usuario.',
        human: 'el usuario está vacío',
        explanation: 'Completá tu usuario de proveedor para iniciar sesión.',
      })
    }

    if (!fieldValue(pass)) {
      issues.push({
        code: 'LOGIN_PASSWORD_MISSING',
        selector: '#clave',
        short: 'Ingresá tu contraseña.',
        human: 'la contraseña está vacía',
        explanation: 'Completá la contraseña antes de enviar el formulario.',
      })
    }
  }

  return {
    pageId,
    path: window.location.pathname,
    issues,
  }
}

function isInvoiceHelpIntent(text) {
  const t = (text || '').toLowerCase()
  return /(c[oó]mo|como).*(carg|llen|sub).*(factura)|(carg|llen|sub).*(factura)|factura/.test(t)
}

// Preguntas puramente informativas / FAQ que no requieren contexto del DOM.
// Devuelve true sólo cuando el mensaje es operativo (copiloto, guía visual).
function needsPageContext(text) {
  const t = (text || '').toLowerCase()

  // Señales de preguntas informativas: "qué datos", "qué necesito", "cómo funciona",
  // "cuánto tarda", "qué es", "para qué sirve", "cuáles son los requisitos", etc.
  const infoPatterns = [
    /qu[eé]\s+(datos|campos|información|info|requisitos|documentos|archivos|pasos)\s+(necesito|debo|hay|tiene|pide|requiere)/,
    /qu[eé]\s+(es|son|hace|significa|incluye|contiene)\b/,
    /para\s+qu[eé]\s+(sirve|es|se usa)/,
    /c[oó]mo\s+(funciona|se usa|se llama|se define|se calcula)/,
    /cu[aá]nto\s+(tarda|demora|cuesta|vale|tiempo)/,
    /cu[aá]les?\s+(son|documento|campos|pasos|requisito)/,
    /\b(diferencia|ventaja|beneficio|pol[ií]tica|proceso|procedimiento|plazo|fecha l[ií]mite)\b/,
    /\b(qu[eé]|cu[aá]l|cu[aá]ndo|por qu[eé]|d[oó]nde)\b.{0,40}\?$/,
    /preguntas?\s+frecuentes?|faq|ayuda\s+general/,
  ]

  if (infoPatterns.some((re) => re.test(t))) return false

  // Señales de acción operativa que sí necesitan DOM: "no puedo", "me da error",
  // "no me deja", "ayuda con esto", "no sé qué hacer", copiloto de formulario.
  const actionPatterns = [
    /no\s+(puedo|me\s+deja|encuentro|aparece|funciona|carga|abre)/,
    /me\s+(sale|da|aparece|muestra)\s+(un?\s+)?(error|problema|aviso)/,
    /ayuda(me)?\s+(con|a)\s+(esto|el\s+formulario|la\s+pantalla|aqu[ií])/,
    /no\s+s[eé]\s+(qué\s+hacer|c[oó]mo\s+seguir|por\s+d[oó]nde)/,
    /qu[eé]\s+hago\s+(aqu[ií]|ahora|con\s+esto)/,
    /est[aá]\s+(fallando|roto|vac[ií]o|mal)/,
  ]

  if (actionPatterns.some((re) => re.test(t))) return true

  // Por defecto: si el texto es corto y no hay interrogación informativa,
  // asumir que podría ser operativo y adjuntar contexto (conservador).
  return true
}

function maybeMoveLauncherAwayFromTarget(el) {
  const launcher = document.querySelector('#hx-widget .hx-launcher')
  if (!launcher || !el) return

  const rect = el.getBoundingClientRect()
  const nearBottomRight = rect.right > window.innerWidth - 240 && rect.bottom > window.innerHeight - 160

  if (nearBottomRight) {
    launcher.classList.add('hx-launcher--avoid-target')
  } else {
    launcher.classList.remove('hx-launcher--avoid-target')
  }
}

function resetLauncherPosition() {
  const launcher = document.querySelector('#hx-widget .hx-launcher')
  launcher?.classList.remove('hx-launcher--avoid-target')
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
  // Últimos N mensajes (rol + texto) para contexto de conversación
  const HISTORY_LIMIT = 5
  const historyRef = useRef([])

  const pushAgentMessage = useCallback((text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'agent',
        text,
        timestamp: new Date(),
      },
    ])
    historyRef.current = [...historyRef.current, { role: 'agent', text }].slice(-HISTORY_LIMIT)
    if (!isOpenRef.current) {
      setUnreadCount((n) => n + 1)
    }
  }, [])

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
      // Demo safety: nunca abrir confirm modal cuando solo se está señalando
      // el botón de carga de factura para guiar visualmente al usuario.
      const skipConfirmation = payload.target === '#btn-carga-completada'

      // Human-in-the-loop: mandatory confirmation before any destructive action
      if (payload.requiresConfirmation && !skipConfirmation) {
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
    } else if (payload.action === 'navigate') {
      if (payload.url) {
        window.location.href = payload.url
      }
    } else if (payload.action === 'click') {
      const el = document.querySelector(payload.target)
      if (el) {
        el.click()
      }
    } else if (payload.action === 'focus') {
      const el = document.querySelector(payload.target)
      if (el && typeof el.focus === 'function') {
        el.focus()
      }
    } else if (payload.action === 'diagnose_page_context') {
      const pageContext = buildPageContext()
      const issue = pageContext.issues[0]
      if (!issue) {
        pushAgentMessage(
          'Revisé la pantalla y no encontré un error visible en este momento. Si querés, hacemos la validación paso a paso.'
        )
        return
      }

      highlightElement(issue.selector, issue.short)
      pushAgentMessage(
        `Detecté un bloqueo frecuente: ${issue.human}. ${issue.explanation}`
      )
    }
  }

  function highlightElement(selector, message) {
    clearHighlights()
    const el = document.querySelector(selector)
    if (!el) return

    el.classList.add('hx-highlight', 'hx-highlight--error')
    maybeMoveLauncherAwayFromTarget(el)
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    const beacon = document.createElement('div')
    beacon.className = 'hx-beacon'
    el.appendChild(beacon)

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
      el.classList.remove('hx-highlight', 'hx-highlight--error')
      el.querySelectorAll('.hx-beacon').forEach((b) => b.remove())
      el.querySelectorAll('.hx-tooltip').forEach((t) => t.remove())
    })
    resetLauncherPosition()
  }

  function tryLocalCopilotShortcut(text) {
    if (!isInvoiceHelpIntent(text)) return false

    const invoiceLink = document.querySelector('a[href="factura.html"]')
    if (invoiceLink) {
      setIsTyping(false)
      highlightElement('a[href="factura.html"]', 'Este es el botón: Ir a Carga de Factura.')
      pushAgentMessage(
        'Para continuar con la carga, usá este acceso en la esquina inferior derecha: "Ir a Carga de Factura". Hacé clic ahí y te sigo guiando.'
      )
      return true
    }

    return false
  }

  const sendMessage = useCallback(
    (text) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: 'user', text, timestamp: new Date() },
      ])
      historyRef.current = [...historyRef.current, { role: 'user', text }].slice(-HISTORY_LIMIT)
      setIsTyping(true)

      if (tryLocalCopilotShortcut(text)) {
        return
      }

      // Solo adjuntar contexto de página cuando el mensaje es operativo
      // (el usuario necesita guía visual). Para preguntas informativas / FAQ
      // el contexto DOM no aporta valor y hace el payload innecesariamente grande.
      const pageContext = needsPageContext(text) ? buildPageContext() : null
      wsRef.current?.sendMessage({
        type: 'user_message',
        payload: {
          text,
          level,
          history: historyRef.current.slice(0, -1), // excluye el mensaje actual (ya añadido)
          ...(pageContext && { context: pageContext }),
        },
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
