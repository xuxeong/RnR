# backend/auth_utils.py

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy import select
from database import get_db
from models import Users

SECRET_KEY = os.getenv("JWT_SECRET_KEY") # .env 파일의 키와 일치하는지 확인하세요
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    JWT 토큰을 검증하고 해당 사용자 객체를 반환하는 최종 의존성 함수입니다.
    비동기 방식으로 작동합니다.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", # 인증 정보를 검증할 수 없습니다
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # 비동기 방식으로 사용자 조회
    stmt = select(Users).where(Users.email == email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if user is None:
        raise credentials_exception
    return user