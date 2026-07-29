from fastapi import APIRouter, WebSocket, Query, status
from jose import JWTError, jwt
import asyncio

from app.websocket.manager import ConnectionManager
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.services.message_service import save_message
from app.auth.jwt_handler import SECRET_KEY, ALGORITHM
from app.models.user import User


router = APIRouter()

manager = ConnectionManager()


def _user_exists(user_id: int) -> bool:
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == user_id).first() is not None
    finally:
        db.close()


async def _authenticate_socket(token: str | None, user_id: int) -> bool:
    if token is None:
        return False

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_user_id = payload.get("sub")
        if token_user_id is None:
            return False
    except JWTError:
        return False

    if int(token_user_id) != user_id:
        return False
    return await asyncio.to_thread(_user_exists, user_id)


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    if not await _authenticate_socket(token, user_id):
        # Close before accepting the connection — no data is exchanged
        # with an unauthenticated or mismatched caller.
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(
        user_id,
        websocket
    )

    try:

        while True:

            data = await websocket.receive_json()


            receiver_id = data["receiver_id"]


            saved_message = save_message(
                db,
                user_id,
                receiver_id,
                data["message"]
            )


            message = {
                "id": saved_message.id,
                "sender_id": user_id,
                "receiver_id": receiver_id,
                "message": saved_message.content,
                "timestamp": str(saved_message.timestamp)
            }


            await manager.send_to_user(
                receiver_id,
                message
            )


    except:

        manager.disconnect(user_id)