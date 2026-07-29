from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.message import Message
from app.models.post import Post, PostComment
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


def verify_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    total_users = db.query(User).count()
    total_messages = db.query(Message).count()
    total_posts = db.query(Post).count()
    total_comments = db.query(PostComment).count()

    return {
        "status": "online",
        "total_users": total_users,
        "total_messages": total_messages,
        "total_posts": total_posts,
        "total_comments": total_comments,
    }


@router.get("/users", response_model=List[UserResponse])
def get_all_users_admin(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    return db.query(User).order_by(User.id.asc()).all()


@router.post("/users/{user_id}/toggle-admin")
def toggle_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    target.is_admin = not target.is_admin
    db.commit()
    db.refresh(target)
    return {"user_id": target.id, "username": target.username, "is_admin": target.is_admin}
