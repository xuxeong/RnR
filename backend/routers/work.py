# routers/work.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, or_
from typing import List, Optional

from database import get_db
from models import Works, Books, Movies
from schemas.work import WorkCreate, WorkOut, WorkUpdate # WorkUpdate 스키마 추가
from schemas.book import BookCreate, BookOut, BookUpdate # BookUpdate 스키마 추가
from schemas.movie import MovieCreate, MovieOut, MovieUpdate # MovieUpdate 스키마 추가
from schemas.genre import GenreOut

work_router = APIRouter(prefix="/works", tags=["Works"])

# 작품 생성 (책, 영화 통합)
@work_router.post("/create", response_model=WorkOut)
def create_work(
    work: WorkCreate, 
    payload: BookCreate | MovieCreate,
    db: Session = Depends(get_db)
):
    if work.Type == "book" and not isinstance(payload, BookCreate):
        raise HTTPException(400, "Payload must be BookCreate for type 'book'")
    if work.Type == "movie" and not isinstance(payload, MovieCreate):
        raise HTTPException(400, "Payload must be MovieCreate for type 'movie'")
    
    # Works 테이블에 먼저 레코드 생성
    w = Works(Type=work.Type, genre_id=work.genre_id, created_at=work.created_at)
    db.add(w)
    db.flush() # work_id를 얻기 위해 db.flush() 사용
    
    # Books 또는 Movies 테이블에 레코드 생성
    if work.Type == "book":
        b = Books(work_id=w.work_id, **payload.model_dump())
        db.add(b)
    elif work.Type == "movie":
        m = Movies(work_id=w.work_id, **payload.model_dump())
        db.add(m)
        
    db.commit()
    db.refresh(w)
    return w

# 작품 목록 조회 (쿼리 파라미터로 필터링)
@work_router.get("", response_model=List[WorkOut])
async def read_works(
    type: str = Query(None, description="Filter by type: 'book' or 'movie'"),
    db: Session = Depends(get_db)
):
    # 쿼리에 genres도 함께 로드하도록 joinedload를 추가합니다.
    stmt = select(Works).options(
        joinedload(Works.book),
        joinedload(Works.movie),
        joinedload(Works.genres)
    )
    if type:
        stmt = stmt.where(Works.Type == type)

    result = await db.execute(stmt)
    works = result.scalars().unique().all() # unique() 추가로 중복 방지

    results = []
    for work in works:
        work_detail = work.book if work.Type == 'book' else work.movie

        if not work_detail or not work_detail.name or not work_detail.created_at:
            continue

        work_data = {
            "work_id": work.work_id,
            "Type": work.Type,
            "rating": work.rating,
            "name": work_detail.name,
            "created_at": work_detail.created_at,
            "publisher": work_detail.publisher,
            "cover_img": work_detail.cover_img,
            "reward": work_detail.reward,
            "ai_summary": work_detail.ai_summary,
            "author": getattr(work_detail, 'author', None),
            "ISBN": getattr(work_detail, 'ISBN', None),
            "director": getattr(work_detail, 'director', None),
            "genres": work.genres # <- 스키마에 맞게 장르 리스트를 추가!
        }
        results.append(work_data)

    return results

# 특정 작품 상세 조회
@work_router.get("/{work_id}", response_model=WorkOut)
async def get_work_detail(work_id: int, db: Session = Depends(get_db)):
    """
    ID로 특정 작품의 상세 정보를 조회합니다.
    """
    stmt = select(Works).where(Works.work_id == work_id).options(joinedload(Works.book), joinedload(Works.movie))
    result = await db.execute(stmt)
    work = result.scalars().first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    return work

# 작품 정보 수정 (책, 영화 통합)
@work_router.patch("/{work_id}", response_model=WorkOut)
def update_work(
    work_id: int, 
    payload: WorkUpdate | BookUpdate | MovieUpdate,
    db: Session = Depends(get_db)
):
    work = db.query(Works).filter_by(work_id=work_id).first()
    if not work:
        raise HTTPException(404, "Work not found")

    # Works 테이블의 공통 필드 업데이트
    for k, v in payload.model_dump(exclude_unset=True).items():
        if hasattr(work, k):
            setattr(work, k, v)
    
    # Books 또는 Movies 테이블의 고유 필드 업데이트
    if work.Type == "book" and isinstance(payload, BookUpdate):
        book = db.query(Books).filter_by(work_id=work_id).first()
        for k, v in payload.model_dump(exclude_unset=True).items():
            if hasattr(book, k):
                setattr(book, k, v)
    elif work.Type == "movie" and isinstance(payload, MovieUpdate):
        movie = db.query(Movies).filter_by(work_id=work_id).first()
        for k, v in payload.model_dump(exclude_unset=True).items():
            if hasattr(movie, k):
                setattr(movie, k, v)
    
    db.commit()
    db.refresh(work)
    return work

# 작품 검색
@work_router.get("/search", response_model=List[WorkOut])
async def search_works(
    q: str = Query(..., min_length=1),
    type: Optional[str] = Query(None, regex="^(book|movie)$"),
    db: Session = Depends(get_db)
):
    """
    제목으로 작품을 검색합니다.
    """
    # Books와 Movies 테이블을 JOIN하여 각 테이블의 name 컬럼에서 검색합니다.
    stmt = select(Works).join(Books, Works.work_id == Books.work_id, isouter=True)\
                        .join(Movies, Works.work_id == Movies.work_id, isouter=True)\
                        .options(joinedload(Works.book), joinedload(Works.movie))\
                        .where(or_(
                            Books.name.ilike(f"%{q}%"),
                            Movies.name.ilike(f"%{q}%")
                        ))

    if type:
        stmt = stmt.where(Works.Type == type)

    result = await db.execute(stmt)
    works = result.scalars().all()
    return works