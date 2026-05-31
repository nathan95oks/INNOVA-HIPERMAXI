import { MessageList } from './MessageList.jsx'
import { InputBar } from './InputBar.jsx'
import { TypingIndicator } from './TypingIndicator.jsx'

export function ChatWindow({ messages, isTyping, onSend, onClose, wsStatus }) {
  const isConnected = wsStatus === 'connected'

  return (
    <div class="hx-window" role="dialog" aria-label="Asistente virtual Hipermaxi">
      <div class="hx-window__header">
        <div class="hx-window__title">
          <span class="hx-window__dot" />
          Asistente Hipermaxi
        </div>
        <span class="hx-window__status">
          {isConnected ? 'En línea' : 'Reconectando...'}
        </span>
        <button class="hx-window__close" onClick={onClose} aria-label="Cerrar asistente">
          ✕
        </button>
      </div>

      <div class="hx-window__body">
        <MessageList messages={messages} />
        {isTyping && <TypingIndicator />}
      </div>

      <div class="hx-window__footer">
        <InputBar onSend={onSend} disabled={isTyping || !isConnected} />
      </div>
    </div>
  )
}
