from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class Genre(Base):
    __tablename__ = "genre"
    genre_id = Column(Integer, primary_key=True)
    label = Column(String, nullable=False, doc="어떤 장르인지")

    works = relationship("Works", back_populates="genre")
    interests = relationship("User_interest", back_populates="genre")
    posts = relationship("Posts", back_populates="genre")
