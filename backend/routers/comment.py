from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from typing import List

from database import get_db
from models import Comment, Posts, Users
from schemas.comment import CommentCreate, CommentOut
from .user import get_current_user

comment_router = APIRouter(prefix="/comments", tags=["Comments"])

@comment_router.get("/post/{post_id}", response_model=List[CommentOut])
async def get_comments_for_post(post_id: int, db: Session = Depends(get_db)):
    """
    특정 게시물의 모든 댓글 목록을 반환합니다.
    """
    stmt = (
        select(Comment)
        .options(joinedload(Comment.user).joinedload(Users.profiles)) # 댓글 작성자 정보 로드
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
    )
    result = await db.execute(stmt)
    comments = result.scalars().unique().all()
    return comments

@comment_router.post("/post/{post_id}", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment_for_post(
    post_id: int,
    payload: CommentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """
    특정 게시물에 새로운 댓글을 작성합니다.
    """
    post = await db.get(Posts, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = Comment(
        post_id=post_id,
        user_id=current_user.user_id,
        context=payload.context,
        last_update_ip=request.client.host 
    )
    db.add(new_comment)
    post.comment += 1 # 게시물의 댓글 수 증가
    await db.commit()
    await db.refresh(new_comment)
    
    # Eager load user and profile for the response
    stmt = select(Comment).options(joinedload(Comment.user).joinedload(Users.profiles)).where(Comment.comment_id == new_comment.comment_id)
    result = await db.execute(stmt)
    final_comment = result.scalars().unique().first()

    return final_comment

@comment_router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    comment = await db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
        
    # 게시물의 댓글 수 감소
    post = await db.get(Posts, comment.post_id)
    if post:
        post.comment -= 1
        
    await db.delete(comment)
    await db.commit()
    return