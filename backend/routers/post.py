# routers/post.py

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from database import get_db
from models import Posts, Users
from schemas.post import PostCreate, PostUpdate, PostOut
from auth_utils import get_current_user

post_router = APIRouter(prefix="/posts", tags=["Posts"])

# 게시물 목록 조회
@post_router.get("", response_model=List[PostOut])
async def list_posts(
    db: Session = Depends(get_db),
    # 쿼리 파라미터로 post_type을 받을 수 있도록 추가
    post_type: Optional[str] = Query(None, enum=["review", "general", "vote"])
):
    """
    모든 게시물을 조회합니다. post_type으로 필터링할 수 있습니다.
    """
    stmt = select(Posts)
    if post_type:
        stmt = stmt.where(Posts.post_type == post_type)
    
    result = await db.execute(stmt)
    posts = result.scalars().all()
    return posts

# 새 게시물 생성
@post_router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: PostCreate, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: Users = Depends(get_current_user)
):
    """
    새로운 게시물을 생성합니다.
    """
    new_post = Posts(
        **payload.model_dump(),
        user_id=current_user.user_id, # 현재 로그인한 사용자의 ID를 추가
        created_at=datetime.now(),
        modify_at=datetime.now(),
        last_update_ip=request.client.host
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    return new_post

# 특정 게시물 상세 조회
@post_router.get("/{post_id}", response_model=PostOut)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """
    ID로 특정 게시물을 조회합니다.
    """
    post = await db.get(Posts, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

# 게시물 수정
@post_router.patch("/{post_id}", response_model=PostOut)
async def update_post(
    post_id: int, 
    payload: PostUpdate, 
    db: Session = Depends(get_db), 
    current_user: Users = Depends(get_current_user)
):
    """
    자신이 작성한 게시물을 수정합니다.
    """
    post = await db.get(Posts, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(post, key, value)
        
    await db.commit()
    await db.refresh(post)
    return post

# 게시물 삭제
@post_router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int, 
    db: Session = Depends(get_db), 
    current_user: Users = Depends(get_current_user)
):
    """
    자신이 작성한 게시물을 삭제합니다.
    """
    post = await db.get(Posts, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
    await db.delete(post)
    await db.commit()
    return

@post_router.get("/work/{work_id}", response_model=List[PostOut])
async def get_posts_for_work(work_id: int, db: Session = Depends(get_db)):
    """
    특정 작품(work_id)에 대한 모든 리뷰 게시물을 반환합니다.
    """
    stmt = (
        select(Posts)
        .where(Posts.work_id == work_id, Posts.post_type == 'review')
        .order_by(Posts.created_at.desc())
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()
    return posts

@post_router.get("/{post_id}", response_model=PostOut)
async def get_post_detail(post_id: int, db: Session = Depends(get_db)):
    """
    특정 게시물의 상세 정보를 반환합니다.
    """
    # 게시물 정보와 함께 작성자 정보(user)를 미리 불러옵니다.
    stmt = select(Posts).options(joinedload(Posts.user)).where(Posts.post_id == post_id)
    result = await db.execute(stmt)
    post = result.scalars().first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    return post