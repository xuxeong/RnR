from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Rating(Base):
    __tablename__ = "rating"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    work_id = Column(Integer, ForeignKey("works.work_id"), primary_key=True)
    rating = Column(Float, nullable=True)

    user = relationship("Users", back_populates="ratings")
    work = relationship("Works", back_populates="ratings")
