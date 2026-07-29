from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class PostCreate(BaseModel):
    title: str
    content: str
    tags: Optional[str] = ""


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    username: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    author_id: int
    author_username: str
    author_top_platform_name: Optional[str] = ""
    author_top_platform_handle: Optional[str] = ""
    author_top_platform_url: Optional[str] = ""
    author_skills: Optional[str] = ""
    title: str
    content: str
    tags: Optional[str] = ""
    timestamp: datetime
    upvotes_count: int
    is_upvoted_by_me: bool
    comments_count: int

    class Config:
        from_attributes = True
