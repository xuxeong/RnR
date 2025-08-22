from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PostCreate(BaseModel):
    # user_id: int 는 백엔드에서 인증된 사용자 토큰을 통해 얻어야 함. 프론트엔드에서 받아오는거 아님!
    genre_id: int
    post_type: str  # review | general | vote
    title: str
    content: str
    img: Optional[str] = None
    work_id: Optional[int] = None

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    img: Optional[str] = None

class PostOut(BaseModel):
    post_id: int
    user_id: int
    genre_id: int
    post_type: str
    title: str
    content: str
    img: Optional[str]
    hit: int
    like: Optional[int]
    comment: Optional[int]
    work_id: Optional[int]
    ai_summary: Optional[str]
    ai_emotion: Optional[str]
    created_at: datetime
    modify_at: datetime
    lastupdate_ip: Optional[str] = None

    class Config:
        from_attributes = True