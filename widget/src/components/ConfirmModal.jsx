/**
 * ConfirmModal — Modal human-in-the-loop.
 *
 * Dos modos:
 *   - alertOnly=false (default): Confirmación de acción irreversible.
 *     Muestra "Cancelar" + "Confirmar". Se usa en Nivel 3 (factura, AVD).
 *
 *   - alertOnly=true: Aviso de información crítica sin acción pendiente.
 *     Muestra solo "Entendido". Se usa con accion_ui.tipo = "show_alert"
 *     (ej. advertencia de irreversibilidad antes de que el usuario decida).
 *
 * Regla CLAUDE.md §2: este modal es OBLIGATORIO antes de cualquier
 * acción irreversible. No hay excepciones.
 */
export function ConfirmModal({ description, alertOnly = false, onConfirm, onCancel }) {
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
          <span class="hx-modal__icon" aria-hidden="true">{alertOnly ? 'ℹ️' : '⚠️'}</span>
          <h3 class="hx-modal__title" id="hx-modal-title">
            {alertOnly ? 'Aviso importante' : 'Confirmación requerida'}
          </h3>
        </div>
        <p class="hx-modal__body">{description}</p>
        <div class="hx-modal__actions">
          {!alertOnly && (
            <button class="hx-modal__btn hx-modal__btn--cancel" onClick={onCancel}>
              Cancelar
            </button>
          )}
          <button class="hx-modal__btn hx-modal__btn--confirm" onClick={onConfirm}>
            {alertOnly ? 'Entendido' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
