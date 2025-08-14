from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Users, Profile
from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserOut
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileOut
# 비밀번호 해싱 및 JWT 관련 라이브러리 임포트
from passlib.context import CryptContext
from jose import JWTError, jwt

# JWT 관련 설정 (실제 환경에서는 .env 파일에서 가져와야 함)
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 토큰 생성 함수
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 현재 사용자 정보 가져오는 의존성 주입 함수
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(Users).get(user_id)
    # 삭제 대기 상태의 유저는 인증에 실패하도록 처리
    if user is None or user.is_deleted:
        raise credentials_exception
    return user

router = APIRouter(prefix="/users", tags=["User"])

# ----------------- 사용자 관리 -----------------

# 회원가입
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    # 이메일 중복 확인
    if db.query(Users).filter(Users.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    # 비밀번호 해싱
    hashed_password = pwd_context.hash(payload.pw)
    user = Users(
        **payload.model_dump(exclude={"pw"}),
        pw=hashed_password,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# 로그인
@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.email == payload.email).first()
    # 해시된 비밀번호 검증
    if not user or not pwd_context.verify(payload.pw, user.pw):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    # 삭제 대기 상태인 유저는 로그인 불가
    if user.is_deleted:
        raise HTTPException(status_code=400, detail="This account has been deactivated.")
    # JWT 토큰 발급
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.user_id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# 내 정보 조회 (인증 필요)
@router.get("/me", response_model=UserOut)
def read_user_me(current_user: Users = Depends(get_current_user)):
    return current_user

# 내 정보 수정 (인증 필요)
@router.patch("/me", response_model=UserOut)
def update_user_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, k, v)
    db.commit()
    db.refresh(current_user)
    return current_user

# 회원 탈퇴 (30일 유예)
@router.patch("/me/deactivate", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_user_me(db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    current_user.is_deleted = True
    current_user.deleted_at = datetime.utcnow()
    db.commit()
    return

# 특정 사용자 정보 조회 (공개 프로필)
@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Users).get(user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user

# ----------------- 프로필 관리 -----------------

# 내 프로필 생성 (인증 필요)
@router.post("/me/profile", response_model=ProfileOut)
def create_profile_me(payload: ProfileCreate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    profile = Profile(
        user_id=current_user.user_id,
        **payload.model_dump()
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

# 내 프로필 수정 (인증 필요)
@router.patch("/me/profile", response_model=ProfileOut)
def update_profile_me(payload: ProfileUpdate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.user_id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile