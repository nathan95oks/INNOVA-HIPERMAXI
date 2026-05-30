export class WebSocketClient {
  constructor(url, { onOpen, onClose, onError, onMessage } = {}) {
    this.url = url
    this.onOpen = onOpen
    this.onClose = onClose
    this.onError = onError
    this.onMessage = onMessage
    this.ws = null
    this.retries = 0
    this.maxRetries = 3
    this.shouldReconnect = true
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url)
    } catch {
      return
    }

    this.ws.onopen = () => {
      this.retries = 0
      this.onOpen?.()
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        this.onMessage?.(msg)
      } catch {
        // malformed message — ignore
      }
    }

    this.ws.onclose = () => {
      this.onClose?.()
      if (this.shouldReconnect && this.retries < this.maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, this.retries) * 1000
        this.retries++
        setTimeout(() => this.connect(), delay)
      }
    }

    this.ws.onerror = () => this.onError?.()
  }

  sendMessage(msg) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  disconnect() {
    this.shouldReconnect = false
    this.ws?.close()
  }
}
