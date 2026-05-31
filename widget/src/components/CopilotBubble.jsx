// Estado colapsado del chat durante el copiloto: mientras un elemento del portal
// está resaltado (spotlight "fosforescente"), la ventana se encoge a esta burbuja
// para no tapar la información que se está señalando en pantalla.
// Al hacer clic — o al limpiarse el resaltado — el chat vuelve a su estado normal.
export function CopilotBubble({ onExpand }) {
  return (
    <button
      class="hx-copilot-bubble"
      onClick={onExpand}
      aria-label="Estoy señalando algo en la pantalla. Tocá para volver al chat."
      title="Volver al chat"
    >
      <span class="hx-copilot-bubble__avatar" aria-hidden="true">HX</span>
      <span class="hx-copilot-bubble__label">Mirá la pantalla</span>
      <span class="hx-copilot-bubble__dots" aria-hidden="true">
        <span class="hx-copilot-bubble__dot" />
        <span class="hx-copilot-bubble__dot" />
        <span class="hx-copilot-bubble__dot" />
      </span>
    </button>
  )
}
