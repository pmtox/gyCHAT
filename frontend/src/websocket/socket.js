// Thin wrapper around the native WebSocket API.
// Connection + message shape match app/routers/websocket.py and
// app/websocket/manager.py exactly — do not alter the payload format.

let socket = null
const listeners = new Set()

export function connectSocket(userId, token) {
  if (socket && socket.readyState === WebSocket.OPEN) return socket

  // Token is required now — the backend verifies it belongs to userId
  // before accepting the connection (see app/routers/ws.py).
socket = new WebSocket(
  `${import.meta.env.VITE_WS_URL}/ws/${userId}?token=${encodeURIComponent(token)}`
)

  socket.onmessage = (event) => {
    let data
    try {
      data = JSON.parse(event.data)
    } catch {
      return
    }
    listeners.forEach((cb) => cb(data))
  }

  socket.onclose = () => {
    socket = null
  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.close()
    socket = null
  }
}

export function onMessage(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// Sends { receiver_id, message } — the exact shape the backend expects.
export function sendMessage(receiverId, message) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false
  socket.send(JSON.stringify({ receiver_id: receiverId, message }))
  return true
}

export function isConnected() {
  return !!socket && socket.readyState === WebSocket.OPEN
}
