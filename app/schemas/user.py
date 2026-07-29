from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str


class GoogleRegisterRequest(BaseModel):
    credential: str
    username: str
    password: str


class UserProfileUpdate(BaseModel):
    bio: Optional[str] = None
    top_platform_name: Optional[str] = None
    top_platform_handle: Optional[str] = None
    top_platform_url: Optional[str] = None
    skills: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    bio: Optional[str] = ""
    top_platform_name: Optional[str] = ""
    top_platform_handle: Optional[str] = ""
    top_platform_url: Optional[str] = ""
    skills: Optional[str] = ""
    is_admin: Optional[bool] = False

    class Config:
        from_attributes = True