# routers/genre.py

from fastapi import APIRouter, Depends, Query # Query를 임포트합니다.
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from database import get_db
from models import Genre
from schemas.genre import GenreOut

genre_router = APIRouter(prefix="/genres", tags=["Genres"])

@genre_router.get("", response_model=List[GenreOut])
async def list_genres(
    db: Session = Depends(get_db),
    # genre_type 파라미터를 Query로 명확하게 정의합니다.
    genre_type: Optional[str] = Query(None) 
):
    """
    모든 장르 목록을 조회합니다. genre_type으로 필터링할 수 있습니다.
    """
    stmt = select(Genre)
    if genre_type:
        stmt = stmt.where(Genre.genre_type == genre_type)

    result = await db.execute(stmt)
    genres = result.scalars().all()
    return genres