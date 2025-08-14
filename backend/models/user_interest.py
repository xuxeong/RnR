from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User_interest(Base):
    __tablename__ = "user_interest"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    genre_id = Column(Integer, ForeignKey("genre.genre_id"), primary_key=True)

    user = relationship("Users", back_populates="interests")
    genre = relationship("Genre", back_populates="interests")
