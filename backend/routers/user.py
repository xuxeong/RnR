import os
from typing import Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from jose import jwt, JWTError
from passlib.context import CryptContext

from database import get_db
from models import Users
from schemas.user import UserCreate, UserLogin, UserUpdate, UserOut

user_router = APIRouter(prefix="/users", tags=["Users"])

# --- 1. 보안 관련 설정 및 변수 정의 ---
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "a_very_secret_key") # 기본값 추가
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/users/login", auto_error=False)


# --- 2. 인증 관련 유틸리티 및 의존성 함수 정의 ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Users:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    stmt = select(Users).where(Users.email == username)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    return user

async def get_optional_current_user(
    # oauth2_scheme -> oauth2_scheme_optional 로 변경
    token: Optional[str] = Depends(oauth2_scheme_optional), 
    db: Session = Depends(get_db)
) -> Optional[Users]:
    """
    사용자가 로그인 상태이면 사용자 정보를, 아니면 None을 반환합니다.
    """
    # 토큰이 아예 없는 경우 (비로그인), 바로 None을 반환
    if not token:
        return None
    
    # 토큰이 있지만 유효하지 않은 경우를 대비해 try-except 사용
    try:
        user = await get_current_user(token=token, db=db)
        return user
    except HTTPException:
        return None

# --- 3. API 엔드포인트 정의 ---
@user_router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    # ... (회원가입 로직은 이전과 동일, 잘 작동합니다)
    stmt = select(Users).where(Users.email == payload.email)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_password = pwd_context.hash(payload.pw)
    new_user = Users(
        **payload.model_dump(exclude={'pw'}),
        pw=hashed_password,
        created_at=datetime.now(),
        modify_at=datetime.now()
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@user_router.post("/login")
async def login(payload: UserLogin, db: Session = Depends(get_db)):
    # ... (로그인 로직은 이전과 동일, 잘 작동합니다)
    stmt = select(Users).where(or_(Users.email == payload.username, Users.login_id == payload.username))
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not pwd_context.verify(payload.pw, user.pw):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ... (이하 내 정보 수정, 회원 탈퇴, 특정 사용자 조회 API는 기존 코드와 동일하게 유지)
# 내 정보 조회 (인증 필요)
@user_router.get("/me", response_model=UserOut)
async def read_user_me(current_user: Users = Depends(get_current_user)):
    return current_user

# 내 정보 수정 (인증 필요)
@user_router.patch("/me", response_model=UserOut)
async def update_user_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    # --- 비밀번호 변경 로직 ---
    if payload.current_pw and payload.new_pw:
        # 1. 현재 비밀번호가 맞는지 확인
        if not pwd_context.verify(payload.current_pw, current_user.pw):
            raise HTTPException(status_code=400, detail="현재 비밀번호가 일치하지 않습니다.")
        
        # 2. 새 비밀번호를 해싱하여 저장
        hashed_password = pwd_context.hash(payload.new_pw)
        setattr(current_user, 'pw', hashed_password)

    # --- 일반 정보 수정 로직 ---
    # 비밀번호 관련 필드를 제외한 나머지 정보를 업데이트합니다.
    update_data = payload.model_dump(exclude_unset=True, exclude={'current_pw', 'new_pw'})
    for key, value in update_data.items():
        setattr(current_user, key, value)
            
    current_user.modify_at = datetime.now()
    await db.commit()
    await db.refresh(current_user)
    return current_user


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