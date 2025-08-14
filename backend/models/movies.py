from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Movies(Base):
    __tablename__ = "movies"
    work_id = Column(Integer, ForeignKey("works.work_id"), primary_key=True)
    name = Column(String, nullable=False)
    director = Column(String, nullable=False)
    ai_summary = Column(String, nullable=True)
    created_at = Column(Date, nullable=False)
    publisher = Column(String, nullable=False)
    cover_img = Column(String, nullable=True)
    reward = Column(String, nullable=True)

    work = relationship("Works", back_populates="movie")
