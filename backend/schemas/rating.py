# schemas/rating.py

from pydantic import BaseModel

class RatingCreate(BaseModel):
    work_id: int
    rating: float

class RatingOut(RatingCreate):
    user_id: int

    class Config:
        from_attributes = True