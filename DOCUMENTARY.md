# !! EVERYTHING YOU NEED TO KNOW ABOUT GYCHAT — THE ULTIMATE DEVELOPER DOCUMENTARY & GUIDE !!

Welcome to the definitive guide and technical documentary for **GyChat**. This document explains every architectural decision, database flow, security rule, critical bug fixed during development, and the essential **WHAT TO DO** and **WHAT NOT TO DO** guidelines for extending this codebase.

---

## 🎬 1. !! THE GYCHAT STORY & ARCHITECTURE !!

GyChat was built to demonstrate a true production-grade, real-time messaging pipeline combining:
1. **FastAPI (Python 3)**: High-concurrency async web framework.
2. **PostgreSQL + SQLAlchemy**: Robust relational persistence with ACID transactions.
3. **WebSockets (ASGI)**: Bi-directional low-latency socket channels.
4. **React + Vite + Tailwind CSS**: Pure dark/light high-contrast UI with a CRT phosphor theme.

```
       [USER A (Chrome)]                       [USER B (Firefox)]
              │                                        ▲
     WS Send  │                                        │ WS Receive
              ▼                                        │
┌───────────────────────────┐                ┌───────────────────────────┐
│   FastAPI WS Endpoint     │                │   FastAPI WS Endpoint     │
│   (/ws/{user_id}?token=…) │                │   (/ws/{user_id}?token=…) │
└─────────────┬─────────────┘                └─────────────▲─────────────┘
              │                                            │
              │ 1. Save to DB                              │ 2. Broadcast via
              ▼                                            │    ConnectionManager
┌───────────────────────────┐                              │
│ PostgreSQL (`messages`)   │──────────────────────────────┘
└───────────────────────────┘
```

---

## 🔍 2. !! THE DEEP DIVE: CRITICAL BUGS & LESSONS LEARNED !!

During the development of GyChat, several tricky fullstack bugs were diagnosed and resolved. Studying these is essential for any developer touching this codebase:

### 🚨 Bug #1: The Missing WebSocket Client Export Crash
* **What Happened**: `Chat.jsx` attempted to import `{ connectSocket, disconnectSocket, onMessage, sendMessage, isConnected }` from `socket.js`, but `socket.js` only exported a dummy `connectSocket`.
* **The Symptom**: Clicking into `/chat` immediately crashed React with `TypeError: (0 , socket_js_1.onMessage) is not a function`.
* **The Fix**: Rewrote `socket.js` as a full-featured singleton module with a pub/sub event emitter pattern.

### 🚨 Bug #2: WebSocket Security Handshake Rejection (`WS_1008`)
* **What Happened**: The backend WebSocket endpoint in `app/routers/ws.py` validates the caller using `_authenticate_socket(token, user_id)` BEFORE calling `websocket.accept()`. If `token` is missing or mismatched, it drops the connection with code `1008 (WS_1008_POLICY_VIOLATION)`.
* **The Symptom**: The client failed to connect to WebSocket and stayed stuck on `connecting…`.
* **The Fix**: Updated `socket.js` to pass `?token=${encodeURIComponent(token)}` in the WebSocket URL string.

### 🚨 Bug #3: The `AttributeError: ConnectionManager has no attribute 'send_to_user'`
* **What Happened**: `app/routers/ws.py` called `await manager.send_to_user(receiver_id, message)`, but `app/websocket/manager.py` named the method `send_message`.
* **The Symptom**: The WebSocket server crashed every time a chat message was sent.
* **The Fix**: Renamed `send_message` to `send_to_user` in `manager.py`.

### 🚨 Bug #4: The Cross-Browser Contact Disappearance Mystery
* **What Happened**: Contacts were stored strictly in `localStorage.getItem('gychat_contacts_<user_id>')`. When User 1 logged in on Chrome and added User 2, Chrome saved it locally. But when User 1 or User 2 logged in on Firefox or Edge, `localStorage` was blank!
* **The Symptom**: Messages appeared on one browser but disappeared when switching browsers or opening incognito mode.
* **The Fix**: Implemented `GET /users` in `app/routers/users.py` and updated `Chat.jsx` to fetch contacts directly from PostgreSQL on startup.

### 🚨 Bug #5: OAuth2 Form Data vs JSON Body 422 Error
* **What Happened**: FastAPI's `login` route uses `OAuth2PasswordRequestForm = Depends()`, which expects `application/x-www-form-urlencoded` with fields `username` (email) and `password`. Standard JSON POST requests caused a 422 Unprocessable Entity error.
* **The Fix**: `AuthContext.jsx` constructs a `URLSearchParams` object with `Content-Type: application/x-www-form-urlencoded`.

---

## 🟢 3. !! WHAT TO DO (BEST PRACTICES & HOW TO EXTEND) !!

### ✅ DO Use Server-Driven State
Always fetch contacts (`GET /users`) and conversation history (`GET /messages/{user_id}`) from PostgreSQL. Use local state only for transient UI feedback (like optimism while socket message is sending).

### ✅ DO Normalize Message Field Names
- Backend REST endpoints return `content` (from `Message.content`).
- WebSocket payloads and React components use `message`.
- Always map REST response fields when loading history into component state:
  ```js
  const normalized = data.map(m => ({
    id: m.id,
    sender_id: m.sender_id,
    receiver_id: m.receiver_id,
    message: m.content,
    timestamp: m.timestamp
  }))
  ```

### ✅ DO Close WebSockets on Unmount/Logout
Always call `disconnectSocket()` when logging out or unmounting `Chat.jsx` to prevent memory leaks and dangling socket connections on the ASGI server.

### ✅ DO Keep CORS Origins Updated
If Vite switches ports (e.g. from `5173` to `5174`), ensure `app/main.py`'s `allow_origins` array contains the new origin.

---

## 🔴 4. !! WHAT NOT TO DO (CRITICAL PITFALLS TO AVOID) !!

### ❌ DO NOT Send JSON to `/auth/login`
Never call `api.post('/auth/login', { email, password })`. It MUST be form-urlencoded with key `username` set to the email address.

### ❌ DO NOT Accept Unauthenticated WebSockets
Never call `await websocket.accept()` before validating the JWT token. Once accepted, an unauthenticated client can consume memory and receive socket broadcasts.

### ❌ DO NOT Store Contacts Purely in LocalStorage
Browser `localStorage` is isolated per browser vendor and incognito profile. Always persist and query contact relationships from PostgreSQL.

### ❌ DO NOT Use `&&` in PowerShell Terminal Commands
PowerShell does not support `&&` statement chaining. Use `;` or run commands sequentially.

---

## 🧪 5. !! STEP-BY-STEP TESTING & VERIFICATION !!

1. **Verify Backend**:
   ```bash
   d:\gyCHAT\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
   ```
   Open `http://127.0.0.1:8000/docs` in your browser to inspect interactive Swagger documentation.

2. **Verify Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:5173` (or `5174`).

3. **Real-time Dual Browser Test**:
   - Open **Chrome** at `http://localhost:5173`, register `user1@test.com`.
   - Open **Firefox** (or Incognito) at `http://localhost:5173`, register `user2@test.com`.
   - `user1` will automatically see `user2` in the sidebar contacts list.
   - Click `user2` and send a message.
   - Observe real-time delivery in Firefox, and verify that refreshing both windows preserves the full chat history straight from PostgreSQL.

---

## 🏁 DOCUMENTARY CONCLUSION
GyChat is fully configured for scale, security, and cross-browser real-time persistence. Stick to the guidelines in this document to keep the project clean, bug-free, and maintainable!
