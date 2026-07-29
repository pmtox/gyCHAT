from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.post import Post, PostUpvote, PostComment
from app.schemas.post import PostCreate, PostResponse, CommentCreate, CommentResponse

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)


@router.get("", response_model=List[PostResponse])
def get_posts(
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Post)
    if tag:
        query = query.filter(Post.tags.ilike(f"%{tag}%"))
    
    posts = query.order_by(Post.timestamp.desc()).all()
    result = []

    for p in posts:
        author = db.query(User).filter(User.id == p.author_id).first()
        upvotes_count = db.query(PostUpvote).filter(PostUpvote.post_id == p.id).count()
        is_upvoted = db.query(PostUpvote).filter(
            PostUpvote.post_id == p.id,
            PostUpvote.user_id == current_user.id
        ).first() is not None
        comments_count = db.query(PostComment).filter(PostComment.post_id == p.id).count()

        result.append(PostResponse(
            id=p.id,
            author_id=p.author_id,
            author_username=author.username if author else "Unknown",
            author_top_platform_name=author.top_platform_name if author else "",
            author_top_platform_handle=author.top_platform_handle if author else "",
            author_top_platform_url=author.top_platform_url if author else "",
            author_skills=author.skills if author else "",
            title=p.title,
            content=p.content,
            tags=p.tags or "",
            timestamp=p.timestamp,
            upvotes_count=upvotes_count,
            is_upvoted_by_me=is_upvoted,
            comments_count=comments_count
        ))

    return result


@router.post("", response_model=PostResponse)
def create_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_post = Post(
        author_id=current_user.id,
        title=post_data.title,
        content=post_data.content,
        tags=post_data.tags or ""
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return PostResponse(
        id=new_post.id,
        author_id=current_user.id,
        author_username=current_user.username,
        author_top_platform_name=current_user.top_platform_name or "",
        author_top_platform_handle=current_user.top_platform_handle or "",
        author_top_platform_url=current_user.top_platform_url or "",
        author_skills=current_user.skills or "",
        title=new_post.title,
        content=new_post.content,
        tags=new_post.tags or "",
        timestamp=new_post.timestamp,
        upvotes_count=0,
        is_upvoted_by_me=False,
        comments_count=0
    )


@router.post("/{post_id}/upvote")
def toggle_upvote(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(PostUpvote).filter(
        PostUpvote.post_id == post_id,
        PostUpvote.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        upvoted = False
    else:
        new_upvote = PostUpvote(post_id=post_id, user_id=current_user.id)
        db.add(new_upvote)
        db.commit()
        upvoted = True

    upvotes_count = db.query(PostUpvote).filter(PostUpvote.post_id == post_id).count()
    return {"upvoted": upvoted, "upvotes_count": upvotes_count}


@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comments = db.query(PostComment).filter(PostComment.post_id == post_id).order_by(PostComment.timestamp.asc()).all()
    result = []
    for c in comments:
        commenter = db.query(User).filter(User.id == c.user_id).first()
        result.append(CommentResponse(
            id=c.id,
            post_id=c.post_id,
            user_id=c.user_id,
            username=commenter.username if commenter else "Unknown",
            content=c.content,
            timestamp=c.timestamp
        ))
    return result


@router.post("/{post_id}/comments", response_model=CommentResponse)
def add_comment(
    post_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = PostComment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_data.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return CommentResponse(
        id=new_comment.id,
        post_id=new_comment.post_id,
        user_id=current_user.id,
        username=current_user.username,
        content=new_comment.content,
        timestamp=new_comment.timestamp
    )
