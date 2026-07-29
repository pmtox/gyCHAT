from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

from app.database import Base, engine
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.models.message import Message
from app.routers.messages import router as messages_router
from app.routers.ws import router as ws_router

# Create database tables
Base.metadata.create_all(bind=engine)

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


app.add_middleware(
    WebSocketSafeCORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(messages_router)
app.include_router(ws_router)

@app.get("/")
def home():
    return {"message": "GyChat Backend Running "}