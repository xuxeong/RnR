from pydantic import BaseModel
from typing import List

class RecommendUserOut(BaseModel):
    user_id: int
    target_id: int
    score: float
    class Config:
        from_attributes = True

class RecommendWorkOut(BaseModel):
    user_id: int
    work_id: int
    score: float
    class Config:
        from_attributes = True
