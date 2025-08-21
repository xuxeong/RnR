# routers/auth.py

import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
import httpx
from jose import jwt, JWTError

from database import get_db
from models import Users
from schemas.user import UserCreate
from datetime import datetime, timedelta

# .env 파일에서 환경 변수 로드
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"

# JWT 토큰 설정
SECRET_KEY = os.getenv("JWT_SECRET_KEY") # .env 파일에서 키를 읽어오도록 변경
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@auth_router.get("/google")
async def login_google():
    """
    Google 로그인 페이지로 리디렉션합니다.
    """
    return {
        "url": f"https://accounts.google.com/o/oauth2/v2/auth?"
               f"response_type=code&client_id={GOOGLE_CLIENT_ID}&"
               f"redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile"
    }

@auth_router.get("/google/callback")
# 함수를 async def로 변경하고, db Session 타입을 올바르게 명시 (실제 DB 설정에 따라)
async def auth_google_callback(code: str, db: Session = Depends(get_db)): 
    """
    Google 로그인 후 콜백을 처리합니다.
    사용자 정보를 가져와 DB에 저장하거나 기존 사용자를 로그인 처리하고 JWT 토큰을 발급합니다.
    """
    # 1. Access Token 요청
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        token_data = token_response.json()
        if "error" in token_data:
            raise HTTPException(status_code=400, detail=f"Google API Error: {token_data['error_description']}")

    # 2. 사용자 정보 요청
    access_token = token_data["access_token"]
    async with httpx.AsyncClient() as client:
        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_info = user_info_response.json()

    # 3. 사용자 DB 조회 및 생성
    # 기존 코드: user = db.query(Users).filter(Users.email == user_info["email"]).first()
    stmt = select(Users).where(Users.email == user_info["email"])
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        # 새로운 사용자 생성
        new_user = Users(
            email=user_info["email"],
            name=user_info.get("name", "Unknown"),
            provider="google",
            pw="social_login_user", 
            birth=datetime.strptime('2000-01-01', '%Y-%m-%d').date(),
            created_at=datetime.now(),
            modify_at=datetime.now(),
            last_login_ip="127.0.0.1"
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        user = new_user
    
    # 4. JWT 토큰 생성
    jwt_token = create_access_token(data={"sub": user.email})

    # 5. 프론트엔드로 토큰과 함께 리디렉션
    # 실제 운영 시에는 프론트엔드 URL로 변경해야 합니다.
    frontend_url = f"http://localhost:5173/auth/callback?token={jwt_token}" 
    return RedirectResponse(url=frontend_url)