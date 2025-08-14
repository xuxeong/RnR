from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Works, Books, Movies
from app.schemas.work import WorkCreate, WorkOut, WorkUpdate # WorkUpdate 스키마 추가
from app.schemas.book import BookCreate, BookOut, BookUpdate # BookUpdate 스키마 추가
from app.schemas.movie import MovieCreate, MovieOut, MovieUpdate # MovieUpdate 스키마 추가

work_router = APIRouter(prefix="/works", tags=["Work"])

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
    w = Works(Type=work.Type, genre_id=work.genre_id)
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
def list_works(type: Optional[str] = Query(None, regex="^(book|movie)$"), db: Session = Depends(get_db)):
    query = db.query(Works)
    if type:
        query = query.filter(Works.Type == type)
    return query.all()

# 특정 작품 상세 조회
@work_router.get("/{work_id}", response_model=WorkOut)
def get_work(work_id: int, db: Session = Depends(get_db)):
    work = db.query(Works).filter_by(work_id=work_id).first()
    if not work:
        raise HTTPException(404, "Work not found")
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
def search_works(
    q: str = Query(..., min_length=1),
    type: Optional[str] = Query(None, regex="^(book|movie)$"),
    db: Session = Depends(get_db)
):
    # Works 테이블에서 공통으로 검색 (name 필드가 Work 모델에 있어야 함)
    # 현재 models/works.py에는 name 필드가 없으므로, models/books.py와 models/movies.py에서 검색해야 합니다.
    query = db.query(Works).join(Books).filter(Books.name.ilike(f"%{q}%"))
    
    if type == "movie":
        query = db.query(Works).join(Movies).filter(Movies.name.ilike(f"%{q}%"))

    # type에 따른 필터링
    if type:
        query = query.filter(Works.Type == type)
        
    return query.all()