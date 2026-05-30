export function ConfirmModal({ description, onConfirm, onCancel }) {
  return (
    <div
      class="hx-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hx-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div class="hx-modal">
        <div class="hx-modal__header">
          <span class="hx-modal__icon" aria-hidden="true">⚠️</span>
          <h3 class="hx-modal__title" id="hx-modal-title">Confirmación requerida</h3>
        </div>
        <p class="hx-modal__body">{description}</p>
        <div class="hx-modal__actions">
          <button class="hx-modal__btn hx-modal__btn--cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button class="hx-modal__btn hx-modal__btn--confirm" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
