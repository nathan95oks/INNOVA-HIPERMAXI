// Helpers compartidos por las pruebas E2E del widget HimaxIA.

const WIDGET = '#hx-widget'
export const SEL = {
  launcher: `${WIDGET} .hx-launcher`,
  window: `${WIDGET} .hx-window`,
  body: `${WIDGET} .hx-window__body`,
  field: `${WIDGET} .hx-input__field`,
  fieldEnabled: `${WIDGET} .hx-input__field:not([disabled])`,
  chip: `${WIDGET} .hx-chip`,
  modal: `${WIDGET} .hx-modal`,
  agentBubble: `${WIDGET} .hx-message--agent .hx-message__bubble`,
  userBubble: `${WIDGET} .hx-message--user .hx-message__bubble`,
  highlight: '.hx-highlight',
}

// Abre la ventana del chat y espera a que el WS conecte (input habilitado).
export async function openWidget(page) {
  await page.locator(SEL.launcher).click()
  await page.locator(SEL.window).waitFor({ state: 'visible' })
  await page.locator(SEL.fieldEnabled).waitFor({ timeout: 10_000 })
}

// Escribe y envía un mensaje con Enter.
export async function sendMessage(page, text) {
  const field = page.locator(SEL.field)
  await page.locator(SEL.fieldEnabled).waitFor({ timeout: 10_000 })
  await field.fill(text)
  await field.press('Enter')
}

export async function agentBubbleCount(page) {
  return page.locator(SEL.agentBubble).count()
}

// ¿Se solapan dos rectángulos (boundingBox de Playwright)? `pad` permite holgura.
export function rectsIntersect(a, b, pad = 0) {
  if (!a || !b) return false
  return !(
    a.x + a.width <= b.x + pad ||
    b.x + b.width <= a.x + pad ||
    a.y + a.height <= b.y + pad ||
    b.y + b.height <= a.y + pad
  )
}

// Registra el instante (ms) en que aparece cada nueva burbuja del agente,
// hasta `target` apariciones o `maxMs`. Sirve para medir el delay entre pasos.
export async function captureBubbleAppearances(page, target, maxMs) {
  const times = []
  let prev = await agentBubbleCount(page)
  const start = Date.now()
  while (times.length < target && Date.now() - start < maxMs) {
    const c = await agentBubbleCount(page)
    while (c > prev) {
      times.push(Date.now())
      prev += 1
    }
    await page.waitForTimeout(40)
  }
  return times
}
