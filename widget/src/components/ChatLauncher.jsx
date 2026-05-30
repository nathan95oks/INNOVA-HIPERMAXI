export function ChatLauncher({ isOpen, onClick, wsStatus }) {
  return (
    <button
      class={`hx-launcher${isOpen ? ' hx-launcher--open' : ''}`}
      onClick={onClick}
      aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente Hipermaxi'}
      title={isOpen ? 'Cerrar' : 'Asistente Hipermaxi'}
    >
      {isOpen ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 2l14 14M16 2L2 16" stroke="white" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
        </svg>
      )}

      {wsStatus === 'disconnected' && !isOpen && (
        <span class="hx-launcher__badge" aria-hidden="true" />
      )}
    </button>
  )
}
