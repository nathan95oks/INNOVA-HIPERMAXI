import { MessageList } from './MessageList.jsx'
import { InputBar } from './InputBar.jsx'
import { TypingIndicator } from './TypingIndicator.jsx'

const SUGGESTIONS = [
  'Credenciales de acceso',
  'Carga de facturas',
  'Registro de productos',
  'Avisos de Despacho',
]

export function ChatWindow({ messages, isTyping, onSend, onClose, wsStatus }) {
  const isConnected = wsStatus === 'connected'
  const showSuggestions = messages.length === 1 && !isTyping

  return (
    <div class="hx-window" role="dialog" aria-label="Asistente virtual Hipermaxi">
      <div class="hx-window__header">
        <span class={`hx-window__dot${isConnected ? '' : ' hx-window__dot--off'}`} />
        <div class="hx-window__title-group">
          <span class="hx-window__title">Asistente Hipermaxi</span>
          <span class="hx-window__subtitle">
            {isConnected ? 'Portal de Proveedores · En línea' : 'Reconectando...'}
          </span>
        </div>
        <button class="hx-window__close" onClick={onClose} aria-label="Cerrar asistente">
          ✕
        </button>
      </div>

      {!isConnected && (
        <div class="hx-banner" role="alert">
          ⚠ Conexión interrumpida — intentando reconectar...
        </div>
      )}

      <div class="hx-window__body">
        <MessageList messages={messages} />
        {isTyping && (
          <div class="hx-typing-row">
            <div class="hx-message__avatar" aria-hidden="true">
              <img src="https://portal.hipermaxi.com//Images/icon.png" alt="Hipermaxi" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />
            </div>
            <TypingIndicator />
          </div>
        )}
      </div>

      <div class="hx-window__footer">
        {showSuggestions && (
          <div class="hx-chips" role="group" aria-label="Consultas frecuentes">
            {SUGGESTIONS.map((s) => (
              <button key={s} class="hx-chip" onClick={() => onSend(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <InputBar onSend={onSend} disabled={isTyping || !isConnected} />
      </div>
    </div>
  )
}
