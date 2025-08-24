from pydantic import BaseModel
from typing import Optional, List
from .work import WorkOut  # 작품 정보를 위해 WorkOut 임포트

# --- 비슷한 사용자 추천용 스키마 ---
class RecommendedUserProfile(BaseModel):
    nickname: Optional[str] = None
    profile_img: Optional[str] = None

class RecommendUserOut(BaseModel):
    target_id: int
    score: float
    name: str
    profile: Optional[RecommendedUserProfile] = None
    is_followed: bool = False

    class Config:
        from_attributes = True

# --- 작품 추천용 스키마 ---
# WorkOut 스키마를 그대로 사용하므로 별도 정의 필요 없음