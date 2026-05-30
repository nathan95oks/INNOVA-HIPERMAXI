import { useEffect, useRef } from 'preact/hooks'

function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

export function MessageList({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <ul class="hx-messages" role="log" aria-live="polite" aria-label="Conversación">
      {messages.map((msg) => (
        <li key={msg.id} class={`hx-message hx-message--${msg.type}`}>
          <div class="hx-message__bubble">{msg.text}</div>
          <time class="hx-message__time" dateTime={new Date(msg.timestamp).toISOString()}>
            {formatTime(msg.timestamp)}
          </time>
        </li>
      ))}
      <li ref={bottomRef} aria-hidden="true" style="height:1px;list-style:none" />
    </ul>
  )
}
