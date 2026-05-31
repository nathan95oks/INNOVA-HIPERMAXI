// ─────────────────────────────────────────────────────────────────────────
// Validación UX del chatbot/copiloto HimaxIA — los 3 problemas reportados.
// (Playwright usa test.describe/test; aliasamos a describe/it por legibilidad.)
// ─────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test'
import {
  SEL, openWidget, sendMessage, agentBubbleCount,
  rectsIntersect, captureBubbleAppearances,
} from './_helpers.js'

const describe = test.describe
const it = test

// Umbral mínimo aceptable entre pasos. El widget está configurado en 650ms
// (STEP_DELAY_MS); usamos 450 como piso para tolerar jitter del scheduler.
const MIN_DELAY_MS = 450

// ── Test 1: la redirección/elemento resaltado NO queda tapado por el input ──
describe('Test 1 · Anti-tapado', () => {
  it('el elemento resaltado no queda cubierto por la ventana del chat', async ({ page }) => {
    // Viewport con espacio suficiente para que el fix tenga dónde despejar el
    // elemento (la ventana mide 548px de alto). Aun así, la ventana ocupa la
    // franja inferior-derecha → escenario de tapado real cuando el target cae ahí.
    const VH = 900
    await page.setViewportSize({ width: 1000, height: VH })
    await page.goto('/productos.html')
    await openWidget(page)

    // En productos.html, pedir ayuda de factura dispara el atajo local del
    // copiloto, que resalta el acceso "Ir a Carga de Factura".
    await sendMessage(page, '¿cómo cargo la factura?')
    await page.locator(SEL.highlight).first().waitFor({ state: 'visible' })

    // Tras la corrección de scroll, el highlight no debe intersectar la ventana.
    await expect
      .poll(async () => {
        const h = await page.locator(SEL.highlight).first().boundingBox()
        const w = await page.locator(SEL.window).boundingBox()
        if (!h || !w) return true // aún no listo → seguir intentando
        return rectsIntersect(h, w, 2)
      }, { timeout: 5_000, message: 'el highlight sigue tapado por la ventana' })
      .toBe(false)

    // Y debe quedar visible dentro del viewport (no empujado fuera de pantalla).
    const h = await page.locator(SEL.highlight).first().boundingBox()
    expect(h.y).toBeGreaterThanOrEqual(0)
    expect(h.y + h.height).toBeLessThanOrEqual(VH)
  })
})

// ── Test 2: los pasos aparecen con un delay legible, no todos de golpe ──────
describe('Test 2 · Ritmo de pasos', () => {
  it('una respuesta de 5 pasos se revela con delay entre cada uno', async ({ page }) => {
    await page.goto('/')
    await openWidget(page)

    const before = await agentBubbleCount(page) // welcome = 1
    await sendMessage(page, 'necesito mis credenciales de acceso')

    // Esperamos intro + 5 pasos = 6 burbujas nuevas del agente.
    const times = await captureBubbleAppearances(page, before + 6, 9_000)

    // (a) El texto se PARTIÓ en burbujas separadas (no llegó todo de golpe).
    expect(times.length).toBeGreaterThanOrEqual(6)

    // (b) El delay entre apariciones consecutivas respeta el mínimo legible.
    const deltas = times.slice(1).map((t, i) => t - times[i])
    const okGaps = deltas.filter((d) => d >= MIN_DELAY_MS)
    expect(okGaps.length).toBeGreaterThanOrEqual(4)
  })
})

// ── Test 3: ESC responde de forma predecible en cada estado ─────────────────
describe('Test 3 · Tecla ESC', () => {
  it('3a · cierra la ventana cuando está abierta e inactiva', async ({ page }) => {
    await page.goto('/')
    await openWidget(page)
    await expect(page.locator(SEL.window)).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator(SEL.window)).toBeHidden()
  })

  it('3b · durante pasos en curso, los muestra todos sin cerrar la ventana', async ({ page }) => {
    await page.goto('/')
    await openWidget(page)

    const before = await agentBubbleCount(page)
    await sendMessage(page, 'necesito mis credenciales de acceso')

    // Esperar a que el revelado esté EN CURSO (intro + al menos 1 paso).
    await expect
      .poll(() => agentBubbleCount(page), { timeout: 5_000 })
      .toBeGreaterThanOrEqual(before + 2)

    await page.keyboard.press('Escape')

    // Flush inmediato: aparecen las 6 burbujas (intro + 5 pasos) enseguida…
    await expect
      .poll(() => agentBubbleCount(page), { timeout: 1_500 })
      .toBeGreaterThanOrEqual(before + 6)

    // …y la ventana sigue abierta (ESC no la cerró porque había pasos activos).
    await expect(page.locator(SEL.window)).toBeVisible()
  })

  it('3c · cierra el modal de confirmación', async ({ page }) => {
    // Interceptamos el WS para forzar una acción irreversible que abre el modal.
    await page.routeWebSocket('ws://localhost:8765', (ws) => {
      ws.onMessage((message) => {
        // Responder SOLO al mensaje del usuario. Si reaccionáramos también a
        // copilot_cancel/confirm, el ESC reabriría el modal en bucle.
        let m
        try { m = JSON.parse(message) } catch { return }
        if (m?.type !== 'user_message') return
        ws.send(JSON.stringify({
          type: 'copilot_action',
          payload: {
            action: 'highlight',
            target: '#btn-nuevo',
            message: '¿Confirmás esta acción irreversible sobre el producto?',
            requiresConfirmation: true,
          },
        }))
      })
    })

    await page.goto('/productos.html')
    await openWidget(page)
    await sendMessage(page, 'guardar producto')

    await expect(page.locator(SEL.modal)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator(SEL.modal)).toBeHidden()
  })
})
