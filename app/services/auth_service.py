import json
import os
from urllib import parse, request
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token


def create_user(db: Session, user: UserCreate):

    existing_email = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    existing_username = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=409,
            detail="Username already taken"
        )

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        is_admin=False
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def login_user(db: Session, email: str, password: str):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {"sub": str(user.id)}
    )

    return token


def verify_google_credential(credential: str):
    if not credential or not credential.strip():
        raise HTTPException(status_code=400, detail="Google credential is required")

    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    token_info_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={parse.quote(credential)}"

    try:
        with request.urlopen(token_info_url, timeout=5) as response:
            payload = json.load(response)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Unable to verify Google sign-in") from exc

    if payload.get("email_verified") not in (True, "true"):
        raise HTTPException(status_code=401, detail="Google email is not verified")

    if client_id and payload.get("aud") and payload.get("aud") != client_id:
        raise HTTPException(status_code=401, detail="Google token audience mismatch")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Google account email not available")

    return email


def google_register_user(db: Session, credential: str, username: str, password: str):
    google_email = verify_google_credential(credential)

    if not username or not username.strip():
        raise HTTPException(status_code=400, detail="Username is required")

    if not password or not password.strip():
        raise HTTPException(status_code=400, detail="Password is required")

    existing_email = db.query(User).filter(User.email == google_email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="A user with this Google account already exists")

    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username:
        raise HTTPException(status_code=409, detail="Username already taken")

    normalized_username = username.strip().lower()
    existing_username_case_insensitive = db.query(User).filter(func.lower(User.username) == normalized_username).first()
    if existing_username_case_insensitive:
        raise HTTPException(status_code=409, detail="Username already taken")

    user = User(
        username=username.strip(),
        email=google_email,
        hashed_password=hash_password(password),
        bio="",
        top_platform_name="",
        top_platform_handle="",
        top_platform_url="",
        skills="",
        is_admin=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user