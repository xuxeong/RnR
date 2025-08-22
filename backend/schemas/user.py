# backend/schemas/user.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from .profile import ProfileOut

class UserBase(BaseModel):
    name: str
    birth: date
    provider: str
    provider_id: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    login_id: Optional[str] = None
    pw: str

class UserLogin(BaseModel):
    # login_id와 email을 username으로 통합
    #login_id: Optional[str] = None
    #email: Optional[EmailStr] = None
    username: str
    pw: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    pw: Optional[str] = None

class UserOut(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    provider: str
    provider_id: Optional[str] = None
    created_at: datetime
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True