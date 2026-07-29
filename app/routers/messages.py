from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.schemas.message import MessageCreate, MessageResponse
from app.services.message_service import send_message
from app.services.message_service import get_conversation


router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)


@router.post(
    "/send",
    response_model=MessageResponse
)
def send(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return send_message(
        db,
        current_user,
        message
    )
@router.get(
    "/{user_id}",
    response_model=list[MessageResponse]
)
def conversation(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return get_conversation(
        db,
        current_user,
        user_id
    )