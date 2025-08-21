# routers/profile.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from database import get_db
from models import Users, Profile
from schemas.profile import ProfileOut, ProfileUpdate
from auth_utils import get_current_user
from datetime import datetime

profile_router = APIRouter(prefix="/profile", tags=["Profile"])

@profile_router.get("/me", response_model=ProfileOut)
async def get_my_profile(db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    # 비동기 문법으로 수정
    stmt = select(Profile).where(Profile.user_id == current_user.user_id)
    result = await db.execute(stmt)
    profile = result.scalars().first()

    """
    현재 로그인된 사용자의 프로필 정보를 조회합니다.
    프로필이 없으면 생성하여 반환합니다.
    """

    if not profile:
        # 프로필이 없는 초기 사용자를 위해 기본 프로필 생성
        new_profile = Profile(
            user_id=current_user.user_id,
            nickname=current_user.name, # 초기 닉네임은 사용자 이름으로 설정
            created_at=datetime.now(),
            modify_at=datetime.now()
        )
        db.add(new_profile)
        await db.commit()
        await db.refresh(new_profile)
        return new_profile
        
    return profile

@profile_router.patch("/me", response_model=ProfileOut)
async def update_my_profile(profile_update: ProfileUpdate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    # 비동기 문법으로 수정
    stmt = select(Profile).where(Profile.user_id == current_user.user_id)
    result = await db.execute(stmt)
    profile = result.scalars().first()

    """
    현재 로그인된 사용자의 프로필 정보를 수정합니다.
    """
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    profile.modify_at = datetime.now()
    
    await db.commit()
    await db.refresh(profile)
    return profile

