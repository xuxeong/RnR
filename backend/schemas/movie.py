from pydantic import BaseModel
from typing import Optional
from .works import WorkBase, WorkOut # WorkBase를 임포트

# 영화 생성 시 고유 필드만 정의 (WorkBase 상속)
class MovieCreate(WorkBase):
    director: str

# 영화 수정 시 고유 필드만 정의 (WorkBase 상속)
class MovieUpdate(BaseModel):
    name: Optional[str] = None
    director: Optional[str] = None
    publisher: Optional[str] = None
    cover_img: Optional[str] = None
    reward: Optional[str] = None

# 영화 응답 스키마 (WorkOut 상속)
class MovieOut(WorkOut):
    director: str

    class Config:
        from_attributes = True