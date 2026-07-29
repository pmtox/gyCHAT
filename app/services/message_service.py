from sqlalchemy.orm import Session

from app.models.message import Message
from app.schemas.message import MessageCreate
from app.models.user import User
from sqlalchemy.orm import Session
from app.models.message import Message


def send_message(
    db: Session,
    sender: User,
    message: MessageCreate
):

    db_message = Message(
        sender_id=sender.id,
        receiver_id=message.receiver_id,
        content=message.content
    )

    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    return db_message
def get_conversation(
    db: Session,
    current_user: User,
    other_user_id: int
):

    messages = db.query(Message).filter(
        (
            (Message.sender_id == current_user.id) &
            (Message.receiver_id == other_user_id)
        )
        |
        (
            (Message.sender_id == other_user_id) &
            (Message.receiver_id == current_user.id)
        )
    ).order_by(
        Message.timestamp
    ).all()

    return messages
def save_message(
    db: Session,
    sender_id: int,
    receiver_id: int,
    content: str
):

    new_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message