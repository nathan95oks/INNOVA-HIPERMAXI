import { useState } from 'preact/hooks'

export function InputBar({ onSend, disabled }) {
  const [text, setText] = useState('')

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div class="hx-input">
      <textarea
        class="hx-input__field"
        rows={1}
        placeholder={disabled ? 'Esperando respuesta...' : 'Escribe tu consulta...'}
        value={text}
        onInput={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Mensaje al asistente"
      />
      <button
        class="hx-input__btn"
        onClick={submit}
        disabled={disabled || !text.trim()}
        aria-label="Enviar mensaje"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
        </svg>
      </button>
    </div>
  )
}
