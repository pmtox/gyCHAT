from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserProfileUpdate

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(User).filter(User.id != current_user.id).all()


@router.get("/search", response_model=List[UserResponse])
def search_users(
    q: str = Query("", description="Search term for username or email"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not q.strip():
        return []

    term = q.strip()
    if "@" in term:
        return db.query(User).filter(
            (User.id != current_user.id) &
            (User.email.ilike(term))
        ).limit(20).all()

    like_term = f"%{term}%"
    return db.query(User).filter(
        (User.id != current_user.id) &
        (User.username.ilike(like_term) | User.email.ilike(like_term))
    ).limit(20).all()


@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.get("/profile/{user_id}", response_model=UserResponse)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    return target_user


@router.put("/profile/me", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    if profile_data.top_platform_name is not None:
        current_user.top_platform_name = profile_data.top_platform_name
    if profile_data.top_platform_handle is not None:
        current_user.top_platform_handle = profile_data.top_platform_handle
    if profile_data.top_platform_url is not None:
        current_user.top_platform_url = profile_data.top_platform_url
    if profile_data.skills is not None:
        current_user.skills = profile_data.skills

    db.commit()
    db.refresh(current_user)
    return current_user