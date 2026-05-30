import { render } from 'preact'
import { App } from './app.jsx'
import styles from './styles/widget.css?inline'

function mount() {
  // Inject scoped styles — single <style> tag, no external file dependency
  const style = document.createElement('style')
  style.id = 'hx-widget-styles'
  style.textContent = styles
  document.head.appendChild(style)

  // Create isolated root node
  const root = document.createElement('div')
  root.id = 'hx-widget'
  document.body.appendChild(root)

  // Read config injected by the portal's <script> block
  const level = parseInt(window.__HX_WIDGET_LEVEL__ ?? '2', 10)
  const wsUrl = window.__HX_WIDGET_WS_URL__ ?? 'ws://localhost:8765'

  render(<App level={level} wsUrl={wsUrl} />, root)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
