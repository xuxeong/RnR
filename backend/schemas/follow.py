from pydantic import BaseModel

class FollowStatus(BaseModel):
    is_followed: bool