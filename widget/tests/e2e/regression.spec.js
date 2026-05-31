// ─────────────────────────────────────────────────────────────────────────
// Regresión: confirma que los fixes de UX no rompieron el flujo base del chat.
// ─────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test'
import { SEL, openWidget, sendMessage, agentBubbleCount } from './_helpers.js'

const describe = test.describe
const it = test

describe('Regresión · flujo base del chat', () => {
  it('R1 · enviar un mensaje sigue funcionando (eco del usuario + respuesta del agente)', async ({ page }) => {
    await page.goto('/')
    await openWidget(page)

    const before = await agentBubbleCount(page)
    await sendMessage(page, 'hola, ¿en qué me podés ayudar?')

    // La burbuja del usuario aparece con su texto.
    await expect(page.locator(SEL.userBubble).last()).toContainText('hola')

    // Y llega al menos una respuesta nueva del agente.
    await expect
      .poll(() => agentBubbleCount(page), { timeout: 8_000 })
      .toBeGreaterThan(before)
  })

  it('R2 · autoscroll: la última burbuja queda visible al fondo', async ({ page }) => {
    await page.goto('/')
    await openWidget(page)
    await sendMessage(page, 'necesito mis credenciales de acceso')

    // Esperar a que entre contenido nuevo.
    await expect.poll(() => agentBubbleCount(page), { timeout: 8_000 }).toBeGreaterThan(1)

    // El cuerpo del chat debe estar scrolleado (casi) hasta el fondo.
    await expect
      .poll(async () => {
        return page.locator(SEL.body).evaluate((el) => {
          return el.scrollHeight - el.scrollTop - el.clientHeight
        })
      }, { timeout: 5_000, message: 'el chat no hizo autoscroll al fondo' })
      .toBeLessThan(60)
  })

  it('R3 · los chips de sugerencia envían y luego desaparecen', async ({ page }) => {
    await page.goto('/')
    await openWidget(page)

    const chip = page.locator(SEL.chip).first()
    await expect(chip).toBeVisible()
    const chipText = (await chip.textContent())?.trim() ?? ''

    await chip.click()
    // El texto del chip queda como mensaje del usuario…
    await expect(page.locator(SEL.userBubble).last()).toContainText(chipText)
    // …y los chips desaparecen (ya hay conversación en curso).
    await expect(page.locator(SEL.chip)).toHaveCount(0)
  })

  it('R4 · el launcher togglea: clic con la ventana abierta la cierra', async ({ page }) => {
    await page.goto('/')
    await openWidget(page)
    await expect(page.locator(SEL.window)).toBeVisible()

    await page.locator(SEL.launcher).click()
    await expect(page.locator(SEL.window)).toBeHidden()
  })

  it('R5 · el input se deshabilita mientras el agente responde y se rehabilita', async ({ page }) => {
    await page.goto('/')
    await openWidget(page)
    await sendMessage(page, 'necesito mis credenciales de acceso')

    // Mientras llega/revela la respuesta, el input está deshabilitado.
    await expect(page.locator(SEL.field)).toBeDisabled()

    // Al terminar, vuelve a habilitarse.
    await expect(page.locator(SEL.field)).toBeEnabled({ timeout: 10_000 })
  })
})
