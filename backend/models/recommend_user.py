from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Recommend_user(Base):
    __tablename__ = "recommend_user"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    target_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    score = Column(Float, nullable=False)

    user = relationship("Users", foreign_keys=[user_id], back_populates="recommend_users")
    target = relationship("Users", foreign_keys=[target_id], back_populates="recommend_targets")
