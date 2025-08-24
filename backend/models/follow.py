from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, func
from database import Base

class Follow(Base):
    __tablename__ = 'follow'
    follower_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), primary_key=True)
    followed_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())