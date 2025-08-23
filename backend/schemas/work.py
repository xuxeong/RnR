from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from .genre import GenreOut

# 작품 생성/수정 시 공통으로 사용되는 필드를 정의하는 기본 스키마
class WorkBase(BaseModel):
    name: str
    created_at: date
    publisher: Optional[str] = None
    cover_img: Optional[str] = None
    reward: Optional[str] = None
    ai_summary: Optional[str] = None

# 새로운 작품을 생성할 때 사용하는 스키마
class WorkCreate(BaseModel):
    Type: str  # "book" | "movie"
    genre_id: int
    name: str
    created_at: date
    publisher: Optional[str] = None
    cover_img: Optional[str] = None
    reward: Optional[str] = None
    ai_summary: Optional[str] = None

# 작품 정보를 업데이트할 때 사용하는 스키마
class WorkUpdate(BaseModel):
    name: Optional[str] = None
    publisher: Optional[str] = None
    cover_img: Optional[str] = None
    reward: Optional[str] = None
    ai_summary: Optional[str] = None
    rating: Optional[float] = None
    genre_id: Optional[int] = None

# API 응답으로 작품 정보를 보낼 때 사용하는 스키마
class WorkOut(BaseModel):
    work_id: int
    Type: str
    name: str
    created_at: date
    genres: List[GenreOut]

    rating: Optional[float] = None
    publisher: Optional[str] = None
    cover_img: Optional[str] = None
    reward: Optional[str] = None
    ai_summary: Optional[str] = None

    author: Optional[str] = None
    ISBN: Optional[str] = None
    director: Optional[str] = None
    
    class Config:
        from_attributes = True