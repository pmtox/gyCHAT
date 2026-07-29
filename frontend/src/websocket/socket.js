// ---------------------------------------------------------------------------
// WebSocket client — singleton connection per session.
// Exports the 5 functions that Chat.jsx depends on:
//   connectSocket, disconnectSocket, onMessage, sendMessage, isConnected
// ---------------------------------------------------------------------------

let ws = null
let listeners = []

/**
 * Open a WebSocket to the backend.
 * The JWT token is sent as a query-param so the server can authenticate
 * the handshake (see app/routers/ws.py → _authenticate_socket).
 */
export function connectSocket(userId, token) {
  // Don't open a second connection if one is already live.
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return
  }

  const url = `ws://127.0.0.1:8000/ws/${userId}?token=${encodeURIComponent(token)}`
  ws = new WebSocket(url)

  ws.onopen = () => {
    console.log('[ws] connected')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      listeners.forEach((fn) => fn(data))
    } catch (err) {
      console.error('[ws] failed to parse message', err)
    }
  }

  ws.onerror = (err) => {
    console.error('[ws] error', err)
  }

  ws.onclose = () => {
    console.log('[ws] disconnected')
  }
}

/**
 * Close the current connection and clear all listeners.
 */
export function disconnectSocket() {
  if (ws) {
    ws.close()
    ws = null
  }
  listeners = []
}

/**
 * Register a callback that fires for every incoming message.
 * Returns an unsubscribe function.
 */
export function onMessage(callback) {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter((fn) => fn !== callback)
  }
}

/**
 * Send a chat message through the open socket.
 * Returns true if the message was sent, false otherwise.
 */
export function sendMessage(receiverId, text) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false
  ws.send(JSON.stringify({ receiver_id: receiverId, message: text }))
  return true
}

/**
 * Check whether the socket is currently open.
 */
export function isConnected() {
  return ws !== null && ws.readyState === WebSocket.OPEN
}