import { defineConfig, devices } from '@playwright/test'

/**
 * Config de validación UX del widget HimaxIA.
 *
 * Levanta DOS servidores antes de las pruebas:
 *   - mock WebSocket (ws://localhost:8765)  → respuestas del agente/copiloto
 *   - vite dev (http://localhost:5173)      → sirve index/productos/factura.html + widget
 *
 * Ambos se chequean por TCP (`port`), así que el ws server crudo no necesita HTTP.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false, // los flujos del mock dependen de timing; corremos en serie
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run mock',
      port: 8765,
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
})
