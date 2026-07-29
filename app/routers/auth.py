from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.token import Token
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, GoogleAuthRequest, GoogleRegisterRequest
from app.services.auth_service import create_user
from app.schemas.user import UserLogin
from app.services.auth_service import login_user, google_register_user
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.auth.jwt_handler import create_access_token

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


@router.post(
    "/google/register",
    response_model=Token
)
def google_register(
    payload: GoogleRegisterRequest,
    db: Session = Depends(get_db)
):
    user = google_register_user(db, payload.credential, payload.username, payload.password)
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer"
    }