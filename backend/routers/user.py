# routers/user.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy import or_
from typing import List
from datetime import datetime, timedelta

from database import get_db
from models import Users, Profile
from schemas.user import UserCreate, UserLogin, UserUpdate, UserOut

from passlib.context import CryptContext
from jose import jwt
from auth_utils import get_current_user
import os

user_router = APIRouter(prefix="/users", tags=["Users"])

# --- JWT 및 비밀번호 관련 설정 ---
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 토큰 생성 함수
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- 사용자 관리 API ---

# 회원가입
@user_router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    stmt = select(Users).where(Users.email == payload.email)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_password = pwd_context.hash(payload.pw)
    
    user_data = payload.model_dump(exclude={"pw"})
    new_user = Users(
        **user_data,
        pw=hashed_password,
        created_at=datetime.now(),
        modify_at=datetime.now()
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

# 로그인
@user_router.post("/login")
async def login(payload: UserLogin, db: Session = Depends(get_db)):
    stmt = select(Users).where(or_(Users.email == payload.username, Users.login_id == payload.username))
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not pwd_context.verify(payload.pw, user.pw):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# 내 정보 조회 (인증 필요)
@user_router.get("/me", response_model=UserOut)
async def read_user_me(current_user: Users = Depends(get_current_user)):
    return current_user

# 내 정보 수정 (인증 필요)
@user_router.patch("/me", response_model=UserOut)
async def update_user_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    try:
        for key, value in payload.model_dump(exclude_unset=True).items():
            if key == "pw":
                hashed_password = pwd_context.hash(value)
                setattr(current_user, key, hashed_password)
            else:
                setattr(current_user, key, value)
            print(f"Set attribute {key} to {getattr(current_user, key)}")
        current_user.modify_at = datetime.now()
        await db.commit()
        await db.refresh(current_user)
        return current_user
    except Exception as e:
        await db.rollback()
        print(f"Error in update_user_me: {e}")
        raise


# 회원 탈퇴 (인증 필요)
@user_router.patch("/me/deactivate", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user_me(db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    current_user.delete_at = datetime.now()
    await db.commit()
    return

# 특정 사용자 정보 조회 (공개 프로필용)
@user_router.get("/{user_id}", response_model=UserOut) # 여기를 user_router로 수정!
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = await db.get(Users, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user