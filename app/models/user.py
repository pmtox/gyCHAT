from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    bio = Column(String, nullable=True, default="")
    top_platform_name = Column(String, nullable=True, default="")
    top_platform_handle = Column(String, nullable=True, default="")
    top_platform_url = Column(String, nullable=True, default="")
    skills = Column(String, nullable=True, default="")
    is_admin = Column(Boolean, default=False)