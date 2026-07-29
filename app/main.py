import os

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.message import Message
from app.models.post import Post, PostUpvote, PostComment

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.messages import router as messages_router
from app.routers.ws import router as ws_router
from app.routers.posts import router as posts_router
from app.routers.admin import router as admin_router

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Startup schema note:", e)

# Auto-promote first user to admin if no admin exists
try:
    db = SessionLocal()
    has_admin = db.query(User).filter(User.is_admin == True).first()
    if not has_admin:
        first_user = db.query(User).first()
        if first_user:
            first_user.is_admin = True
            db.commit()
    db.close()
except Exception as e:
    print("Startup admin check note:", e)

app = FastAPI(
    title="GyChat"
)


class WebSocketSafeCORSMiddleware:
    """
    This starlette version applies CORSMiddleware's logic to WebSocket
    connections too, which conflicts with our own websocket.accept() call
    in ws.py and crashes the handshake. WebSocket connections don't need
    (or get blocked by) browser CORS the way fetch/axios calls do, so we
    just skip CORS entirely for scope["type"] == "websocket" and only
    apply it to normal HTTP requests.
    """

    def __init__(self, app: ASGIApp, **cors_kwargs):
        self.app = app
        self.cors_app = CORSMiddleware(app, **cors_kwargs)

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "websocket":
            await self.app(scope, receive, send)
        else:
            await self.cors_app(scope, receive, send)


cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://gychat.netlify.app",
).split(",")

app.add_middleware(
    WebSocketSafeCORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(messages_router)
app.include_router(ws_router)
app.include_router(posts_router)
app.include_router(admin_router)


@app.get("/")
def home():
    return {"message": "GyChat Backend Running"}