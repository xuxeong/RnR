# routers/post.py

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, desc
from typing import List, Optional

from database import get_db
from models import Posts, Users, Likes, Follow
from schemas.post import PostCreate, PostUpdate, PostOut
from auth_utils import get_current_user

post_router = APIRouter(prefix="/posts", tags=["Posts"])

# 게시물 목록 조회
@post_router.get("", response_model=List[PostOut])
async def list_posts(
    sort: Optional[str] = Query("recent", description="Sort by 'recent' or 'popular'"),
    db: Session = Depends(get_db)
):
    """
    모든 게시물 목록을 반환합니다. 최신순(recent) 또는 인기순(popular)으로 정렬할 수 있습니다.
    """
    query = select(Posts).options(joinedload(Posts.user))
    
    if sort == "popular":
        # 인기순 (좋아요 많은 순)
        query = query.order_by(desc(Posts.like))
    else:
        # 최신순 (기본값)
        query = query.order_by(desc(Posts.created_at))
        
    result = await db.execute(query)
    posts = result.scalars().all()
    return posts

# 1. My Feed API (내가 쓴 글)
@post_router.get("/my-feed", response_model=List[PostOut])
async def get_my_posts(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """
    현재 로그인한 사용자가 작성한 모든 게시물 목록을 반환합니다.
    """
    stmt = (
        select(Posts)
        .options(joinedload(Posts.user))
        .where(Posts.user_id == current_user.user_id)
        .order_by(desc(Posts.created_at))
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()
    return posts

# 2. Community 'Feed' Tab API (팔로우한 사용자 글)
@post_router.get("/feed", response_model=List[PostOut])
async def get_my_feed(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """
    현재 로그인한 사용자가 팔로우하는 모든 사용자의 게시물 목록 (피드)을 반환합니다.
    """
    # 1. 내가 팔로우하는 모든 사용자의 ID 목록을 가져옵니다.
    following_users_stmt = select(Follow.followed_id).where(Follow.follower_id == current_user.user_id)
    result = await db.execute(following_users_stmt)
    following_ids = result.scalars().all()

    # --- 여기에 현재 사용자 ID를 추가합니다 ---
    ids_to_fetch = following_ids + [current_user.user_id]
    # 중복을 제거할 수도 있습니다 (선택 사항)
    # ids_to_fetch = list(set(following_ids + [current_user.user_id]))

    if not ids_to_fetch:
        return []

    # 2. 해당 ID들이 작성한 모든 게시물을 최신순으로 가져옵니다.
    feed_stmt = (
        select(Posts)
        .options(joinedload(Posts.user))
        .where(Posts.user_id.in_(ids_to_fetch))
        .order_by(desc(Posts.created_at))
    )
    result = await db.execute(feed_stmt)
    feed_posts = result.scalars().all()
    
    return feed_posts

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
    # options(joinedload(Posts.user))를 추가하여 사용자 정보를 함께 가져옵니다.
    stmt = select(Posts).options(joinedload(Posts.user)).where(Posts.post_id == post_id)
    result = await db.execute(stmt)
    post = result.scalars().first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    # 받은 데이터로 게시물 내용 업데이트
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)
    
    # 수정 시간 자동 업데이트
    post.modify_at = datetime.now()
        
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

# 1. 좋아요 토글 API
@post_router.post("/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def toggle_like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """
    게시물에 대한 좋아요를 추가하거나 취소합니다 (토글).
    """
    # 먼저 게시물이 존재하는지 확인
    post = await db.get(Posts, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 이미 좋아요를 눌렀는지 확인
    like_stmt = select(Likes).where(
        Likes.user_id == current_user.user_id,
        Likes.post_id == post_id
    )
    result = await db.execute(like_stmt)
    existing_like = result.scalars().first()

    if existing_like:
        # 이미 좋아요를 눌렀다면, 좋아요 취소 (삭제)
        await db.delete(existing_like)
        post.like -= 1 # 게시물의 좋아요 카운트 감소
    else:
        # 누르지 않았다면, 좋아요 추가 (생성)
        new_like = Likes(user_id=current_user.user_id, post_id=post_id)
        db.add(new_like)
        post.like += 1 # 게시물의 좋아요 카운트 증가
    
    await db.commit()
    return

# 2. 내가 좋아요한 게시물 목록 API
@post_router.get("/likes/me", response_model=List[PostOut])
async def get_my_liked_posts(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """
    현재 로그인한 사용자가 좋아요를 누른 모든 게시물 목록을 반환합니다.
    """
    stmt = (
        select(Posts)
        .join(Likes, Posts.post_id == Likes.post_id)
        .where(Likes.user_id == current_user.user_id)
        .order_by(Posts.created_at.desc())
    )
    result = await db.execute(stmt)
    liked_posts = result.scalars().all()
    return liked_posts