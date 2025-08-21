from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Recommend_user, Recommend_work
from schemas.recommend import RecommendUserOut, RecommendWorkOut

rec_router = APIRouter(prefix="/recommend", tags=["Recommend"])

@rec_router.get("/users", response_model=List[RecommendUserOut])
def recommend_users(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    return (
        db.query(Recommend_user)
        .filter(Recommend_user.user_id == user_id)
        .order_by(Recommend_user.score.desc())
        .limit(limit)
        .all()
    )

@rec_router.get("/works", response_model=List[RecommendWorkOut])
def recommend_works(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    return (
        db.query(Recommend_work)
        .filter(Recommend_work.user_id == user_id)
        .order_by(Recommend_work.score.desc())
        .limit(limit)
        .all()
    )