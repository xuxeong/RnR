from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .user import UserOut

class CommentCreate(BaseModel):
    context: str

class CommentOut(BaseModel):
    comment_id: int
    post_id: int
    user_id: int
    context: str
    like: Optional[int] = None
    created_at: datetime
    modify_at: datetime
    lastupdate_ip: Optional[str] = None
    user: UserOut
    class Config:
        from_attributes = True