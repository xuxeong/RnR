from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Posts
from schemas.post import PostCreate, PostUpdate, PostOut

post_router = APIRouter(prefix="/posts", tags=["Post"])

# 새 게시글 작성 (created_at, modify_at, like, comment는 DB에서 자동 관리)
@post_router.post("", response_model=PostOut)
def create_post(payload: PostCreate, request: Request, db: Session = Depends(get_db)):
    # request.client.host로 사용자의 IP 주소를 가져옴
    ip_address = request.client.host if request.client else "unknown"
    
    post = Posts(
        user_id=payload.user_id,
        genre_id=payload.genre_id,
        post_type=payload.post_type,
        title=payload.title,
        content=payload.content,
        img=payload.img,
        work_id=payload.work_id,
        last_update_ip=ip_address,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

# 게시글 목록 조회 (type 또는 work_id로 필터링)
@post_router.get("", response_model=List[PostOut])
def list_posts(
    type: Optional[str] = Query(None), 
    work_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Posts)
    if type:
        query = query.filter(Posts.post_type == type)
    if work_id:
        query = query.filter(Posts.work_id == work_id)
    return query.all()

# 특정 유저의 게시글 목록 조회
@post_router.get("/user/{user_id}", response_model=List[PostOut])
def list_user_posts(user_id: int, db: Session = Depends(get_db)):
    return db.query(Posts).filter(Posts.user_id == user_id).all()

# 특정 게시글 수정
@post_router.patch("/{post_id}", response_model=PostOut)
def update_post(post_id: int, payload: PostUpdate, db: Session = Depends(get_db)):
    post = db.query(Posts).get(post_id)
    if not post:
        raise HTTPException(404, "Post not found")
    
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(post, k, v)
    
    # modify_at은 모델의 onupdate 속성으로 자동 업데이트됨
    db.commit()
    db.refresh(post)
    return post

# 기타: 게시글 삭제, 특정 게시글 조회 등 다른 엔드포인트도 동일한 방식으로 수정 가능