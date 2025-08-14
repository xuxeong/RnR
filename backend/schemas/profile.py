from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileCreate(BaseModel):
    nickname: Optional[str] = None
    bio: Optional[str] = None
    profile_img: Optional[str] = None
    profile_color: Optional[str] = None
    profile_shape: Optional[str] = None

class ProfileUpdate(BaseModel):
    nickname: Optional[str] = None
    bio: Optional[str] = None
    profile_img: Optional[str] = None
    profile_color: Optional[str] = None
    profile_shape: Optional[str] = None
    
class ProfileOut(ProfileCreate):
    user_id: int
    modify_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True