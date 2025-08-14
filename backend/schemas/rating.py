from pydantic import BaseModel
from typing import Optional

class RatingCreate(BaseModel):
    user_id: int
    work_id: int
    rating: float

class RatingOut(RatingCreate):
    class Config:
        from_attributes = True