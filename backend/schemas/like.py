from pydantic import BaseModel

class LikeCreate(BaseModel):
    user_id: int
    post_id: int