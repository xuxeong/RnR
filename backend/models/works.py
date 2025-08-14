from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Works(Base):
    __tablename__ = "works"
    work_id = Column(Integer, primary_key=True)
    Type = Column(Enum("book", "movie", name="work_type"), nullable=False)
    rating = Column(Float, nullable=True, doc="평균평점")
    genre_id = Column(Integer, ForeignKey("genre.genre_id"), nullable=False)

    genre = relationship("Genre", back_populates="works")
    book = relationship("Books", uselist=False, back_populates="work")
    movie = relationship("Movies", uselist=False, back_populates="work")
    posts = relationship("Posts", back_populates="work")
    ratings = relationship("Rating", back_populates="work")
    recommend_works = relationship("Recommend_work", back_populates="work")
