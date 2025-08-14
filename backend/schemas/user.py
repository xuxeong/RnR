from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from .profile import ProfileOut

class UserBase(BaseModel):
    name: str
    birth: date
    provider: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    login_id: Optional[str] = None
    pw: str

class UserLogin(BaseModel):
    login_id: Optional[str] = None
    email: Optional[EmailStr] = None
    pw: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    pw: Optional[str] = None

class UserOut(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    created_at: datetime
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True
