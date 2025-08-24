from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from typing import List, Optional
import subprocess
import sys

from database import get_db
from models import Recommend_work, Recommend_user, User_interest, Users, Works, Follow
from schemas.recommend import RecommendUserOut
from schemas.work import WorkOut
from schemas.genre import GenreOut
from .user import get_current_user

recommend_router = APIRouter(prefix="/recommend", tags=["Recommendation"])

# 1. 작품 추천 API
@recommend_router.get("/works", response_model=List[WorkOut])
async def get_work_recommendations(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """현재 로그인한 사용자에게 추천하는 작품 목록을 반환합니다."""
    stmt = (
        select(Recommend_work)
        .options(
            joinedload(Recommend_work.work).joinedload(Works.book),
            joinedload(Recommend_work.work).joinedload(Works.movie),
            joinedload(Recommend_work.work).subqueryload(Works.genres)
        )
        .where(Recommend_work.user_id == current_user.user_id)
        .order_by(Recommend_work.score.desc())
        .limit(20)
    )
    result = await db.execute(stmt)
    recommendations = result.scalars().unique().all() # .unique() 추가
    
    response_data = []
    for rec in recommendations:
        if rec.work:
            work_detail = rec.work.book if rec.work.Type == 'book' else rec.work.movie
            if work_detail:
                response_data.append({
                    "work_id": rec.work.work_id, "Type": rec.work.Type, "rating": rec.work.rating,
                    "name": work_detail.name, "created_at": work_detail.created_at,
                    "publisher": work_detail.publisher, "cover_img": work_detail.cover_img,
                    "reward": work_detail.reward, "ai_summary": work_detail.ai_summary,
                    "author": getattr(work_detail, 'author', None),
                    "ISBN": getattr(work_detail, 'ISBN', None),
                    "director": getattr(work_detail, 'director', None),
                    "genres": rec.work.genres
                })
    return response_data

# 2. 비슷한 사용자 추천 API
@recommend_router.get("/users", response_model=List[RecommendUserOut])
async def get_user_recommendations(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """현재 로그인한 사용자에게 추천하는 비슷한 사용자 목록을 반환합니다."""
    stmt = (
        select(Recommend_user)
        .options(joinedload(Recommend_user.target).joinedload(Users.profiles))
        .where(Recommend_user.user_id == current_user.user_id)
        .order_by(Recommend_user.score.desc())
        .limit(10)
    )
    result = await db.execute(stmt)
    recommendations = result.scalars().unique().all()

    following_stmt = select(Follow.followed_id).where(Follow.follower_id == current_user.user_id)
    following_result = await db.execute(following_stmt)
    following_ids = set(following_result.scalars().all())

    response_data = []
    for rec in recommendations:
        if rec.target:
            profile_data = rec.target.profiles[0] if rec.target.profiles else None
            response_data.append({
                "target_id": rec.target.user_id,
                "score": rec.score,
                "name": rec.target.name,
                "profile": profile_data,
                "is_followed": rec.target.user_id in following_ids
            })
    return response_data

# 3. 사용자 관심 장르 API
@recommend_router.get("/interests", response_model=List[GenreOut])
async def get_user_interest_genres(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """현재 로그인한 사용자의 관심 장르 목록을 반환합니다."""
    stmt = (
        select(User_interest)
        .options(joinedload(User_interest.genre))
        .where(User_interest.user_id == current_user.user_id)
    )
    result = await db.execute(stmt)
    interests = result.scalars().all()
    
    return [interest.genre for interest in interests if interest.genre]

@recommend_router.post("/run-update", status_code=status.HTTP_202_ACCEPTED)
async def run_recommendation_update(
    current_user: Users = Depends(get_current_user) # 관리자만 실행하게 하려면 권한 체크 로직 추가
):
    """
    백그라운드에서 추천 알고리즘 스크립트(run_recommendation.py)를 실행합니다.
    """
    try:
        # 현재 파이썬 실행 파일의 경로를 가져옵니다.
        python_executable = sys.executable
        # run_recommendation.py 스크립트의 경로를 지정합니다.
        # 이 파일은 backend 폴더 바로 아래에 있어야 합니다.
        script_path = "run_recommendation.py"
        
        # 비동기적으로 스크립트를 실행하고, 서버는 즉시 응답합니다.
        # Popen을 사용하여 새로운 프로세스를 시작하고 기다리지 않습니다.
        subprocess.Popen([python_executable, script_path])
        
        return {"message": "Recommendation update process started successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
