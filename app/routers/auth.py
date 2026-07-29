from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.token import Token
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import create_user
from app.schemas.user import UserLogin
from app.services.auth_service import login_user
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    return create_user(db, user)
@router.post(
    "/login",
    response_model=Token
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    token = login_user(
        db,
        form_data.username,
        form_data.password
    )
    if token is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

    return {
        "access_token": token,
        "token_type": "bearer"
    }