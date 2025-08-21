from pydantic import BaseModel
from typing import Optional
from .work import WorkBase, WorkOut # WorkBase를 임포트

# 책 생성 시 고유 필드만 정의 (WorkBase 상속)
class BookCreate(WorkBase):
    ISBN: str
    author: str

# 책 수정 시 고유 필드만 정의 (WorkBase 상속)
class BookUpdate(BaseModel):
    name: Optional[str] = None
    ISBN: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    cover_img: Optional[str] = None
    reward: Optional[str] = None

# 책 응답 스키마 (WorkOut 상속)
class BookOut(WorkOut):
    ISBN: str
    author: str
    
    class Config:
        from_attributes = True