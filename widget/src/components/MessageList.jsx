import { useEffect, useRef } from 'preact/hooks'

function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

function ContactCard({ contacts }) {
  return (
    <div class="hx-contact-card">
      <div class="hx-contact-card__title">📞 Soporte Hipermaxi</div>
      {contacts.map((c) => (
        <div class="hx-contact-card__row" key={c.area}>
          <div class="hx-contact-card__area">{c.area}</div>
          <a class="hx-contact-card__phone" href={`tel:${c.phone.replace(/\s/g,'')}`}>{c.phone}</a>
          <a class="hx-contact-card__email" href={`mailto:${c.email}`}>{c.email}</a>
          <div class="hx-contact-card__hours">{c.hours}</div>
        </div>
      ))}
    </div>
  )
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
          {(msg.type === 'agent' || msg.type === 'escalation') && (
            <div class="hx-message__avatar" aria-hidden="true">HX</div>
          )}
          <div class="hx-message__content">
            <div class="hx-message__bubble">
              {msg.text}
              {msg.type === 'escalation' && msg.contacts?.length > 0 && (
                <ContactCard contacts={msg.contacts} />
              )}
            </div>
            <time class="hx-message__time" dateTime={new Date(msg.timestamp).toISOString()}>
              {formatTime(msg.timestamp)}
            </time>
          </div>
        </li>
      ))}
      <li ref={bottomRef} aria-hidden="true" style="height:1px;list-style:none" />
    </ul>
  )
}
