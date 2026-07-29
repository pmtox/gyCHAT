# GyChat — Frontend

React + Vite + Tailwind frontend for the existing GyChat FastAPI backend.
This project only consumes the backend's REST/WebSocket contract — no backend
files were touched.

## Setup

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and expects the FastAPI
backend on `http://127.0.0.1:8000` (see `src/api/axios.js` and
`src/websocket/socket.js`).

## Theme

- Toggle in the top-right of every screen switches between **pure white**
  (`#FFFFFF`) and **pure black** (`#000000`) — no grey backgrounds.
- Accent color is a phosphor green (`#17E88F`), used for the online indicator,
  send button (dark mode), links, and toggle LED.
- A subtle animated grain/noise layer sits over the whole app, plus a faint
  scanline grid behind chat content, for a CRT-phosphor texture.
- Fonts: Space Grotesk (display/brand), Inter (UI/body), JetBrains Mono
  (timestamps, ids, meta text).

## Notes on the backend contract

- `POST /auth/register` and `POST /auth/login` are called exactly as
  specified — bodies and response shapes are untouched.
- The login response only returns `access_token` / `token_type`, not a user
  object, so the Login screen also collects the user's `id` and a display
  name locally — that id is what opens `ws://127.0.0.1:8000/ws/{user_id}`.
- There's no "list users" endpoint in the contract, so contacts are added
  manually (by id + name) from the sidebar and persisted in `localStorage`.
- WebSocket send/receive payloads match the spec exactly:
  `{ receiver_id, message }` out, `{ id, sender_id, receiver_id, message, timestamp }` in.
