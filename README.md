# ⚡ GyChat — Real-Time Messaging Platform

GyChat is a high-performance, real-time messaging application powered by a **FastAPI** backend, **PostgreSQL** database persistence, and a modern **React + Vite** frontend with a custom CRT phosphor aesthetic.

---

## 🌟 Key Features

- **⚡ Real-Time WebSockets**: Instant bi-directional chat messaging using FastAPI WebSocket endpoints.
- **🔐 JWT Authentication & Security**: Secure user registration, password hashing with `bcrypt`, OAuth2 form login, and token-based WebSocket handshake authentication.
- **💾 Full PostgreSQL Persistence**: Every message exchanged via WebSocket is committed to PostgreSQL in real time and fetched automatically across all browsers, devices, and sessions.
- **👥 Dynamic User Discovery**: Server-driven contacts list allowing registered users to discover each other dynamically.
- **🎨 High-Contrast Phosphor UI**: Premium dark/light themes (pure `#000000` / `#FFFFFF`), phosphor green (`#17E88F`) accent LED highlights, noise grain overlay, and CRT scanline grid layout.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
- **Authentication**: `python-jose` (JWT), `passlib[bcrypt]`
- **ASGI Server**: `uvicorn`

### **Frontend**
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: `react-router-dom`
- **HTTP Client**: `axios`
- **Typography**: Space Grotesk, Inter, JetBrains Mono

---

## 📐 Architecture & Data Flow

```
┌─────────────────┐             HTTP (REST) / WS             ┌─────────────────┐
│                 │ ───────────────────────────────────────► │                 │
│  React Client   │                                          │ FastAPI Backend │
│  (Port 5173/74) │ ◄─────────────────────────────────────── │   (Port 8000)   │
└─────────────────┘              JSON Payloads               └────────┬────────┘
                                                                      │
                                                                 SQLAlchemy
                                                                      │
                                                                      ▼
                                                             ┌─────────────────┐
                                                             │ PostgreSQL DB   │
                                                             │    (gyChat)     │
                                                             └─────────────────┘
```

---

## 🗄️ Database Schema

### `users` Table
| Column | Type | Constraints |
|---|---|---|
| `id` | `Integer` | Primary Key, Indexed |
| `username` | `String` | Unique, Non-null |
| `email` | `String` | Unique, Non-null |
| `hashed_password` | `String` | Non-null |

### `messages` Table
| Column | Type | Constraints |
|---|---|---|
| `id` | `Integer` | Primary Key, Indexed |
| `sender_id` | `Integer` | Foreign Key (`users.id`), Non-null |
| `receiver_id` | `Integer` | Foreign Key (`users.id`), Non-null |
| `content` | `String` | Non-null |
| `timestamp` | `DateTime` | Server Default `NOW()` |
| `is_phishing` | `Boolean` | Default `False` |

---

## 🔌 API & WebSocket Documentation

### **Authentication**
- `POST /auth/register`: Create a new user account.
- `POST /auth/login`: Authenticate via OAuth2 Password Form (`username` = email, `password`) and receive JWT access token.

### **Users**
- `GET /users/me`: Retrieve current logged-in user profile.
- `GET /users`: Retrieve list of all other registered users for contacts sidebar.

### **Messages**
- `GET /messages/{user_id}`: Fetch complete conversation history between current user and specified `user_id`.

### **WebSocket**
- `WS /ws/{user_id}?token=<JWT_TOKEN>`: Open persistent real-time socket.
  - **Outgoing JSON**: `{"receiver_id": 2, "message": "Hello!"}`
  - **Incoming JSON**: `{"id": 42, "sender_id": 1, "receiver_id": 2, "message": "Hello!", "timestamp": "2026-07-29T14:30:00"}`

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL database server running on `localhost:5432`

### 2️⃣ Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/gyCHAT.git
   cd gyCHAT
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql+psycopg2://postgres:YourPassword@localhost:5432/gyChat
   SECRET_KEY=your_super_secret_jwt_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 3️⃣ Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```
2. Run the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` (or `http://localhost:5174`) in your browser.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.