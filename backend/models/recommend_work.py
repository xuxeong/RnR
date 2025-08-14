from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Recommend_work(Base):
    __tablename__ = "recommend_work"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    work_id = Column(Integer, ForeignKey("works.work_id"), primary_key=True)
    score = Column(Float, nullable=False)

    user = relationship("Users", back_populates="recommend_works")
    work = relationship("Works", back_populates="recommend_works")
