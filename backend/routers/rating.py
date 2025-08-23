# routers/rating.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from typing import List

from database import get_db
from models import Rating, Users
from schemas.rating import RatingCreate, RatingOut
from auth_utils import get_current_user

rating_router = APIRouter(prefix="/ratings", tags=["Ratings"])

@rating_router.post("", response_model=RatingOut, status_code=status.HTTP_201_CREATED)
async def create_or_update_rating(
    payload: RatingCreate, 
    db: Session = Depends(get_db), 
    current_user: Users = Depends(get_current_user)
):
    """
    특정 작품에 대한 평점을 생성하거나 업데이트합니다.
    사용자가 이미 해당 작품에 평점을 남겼다면, 새로운 평점으로 덮어씁니다.
    """
    # 기존 평점이 있는지 확인
    stmt = select(Rating).where(
        and_(
            Rating.user_id == current_user.user_id,
            Rating.work_id == payload.work_id
        )
    )
    result = await db.execute(stmt)
    existing_rating = result.scalars().first()

    if existing_rating:
        # 기존 평점이 있으면 업데이트
        existing_rating.rating = payload.rating
        db.add(existing_rating)
    else:
        # 기존 평점이 없으면 새로 생성
        new_rating = Rating(
            user_id=current_user.user_id,
            work_id=payload.work_id,
            rating=payload.rating
        )
        db.add(new_rating)
    
    await db.commit()
    
    # 응답을 위해 다시 조회 (또는 기존/새 객체를 바로 반환)
    # 여기서는 간단하게 입력받은 값으로 응답 객체를 구성합니다.
    return RatingOut(
        user_id=current_user.user_id,
        work_id=payload.work_id,
        rating=payload.rating
    )