from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Books(Base):
    __tablename__ = "books"
    work_id = Column(Integer, ForeignKey("works.work_id"), primary_key=True)
    name = Column(String, nullable=False)
    ISBN = Column(String, nullable=True)
    author = Column(String, nullable=False)
    ai_summary = Column(String, nullable=True)
    created_at = Column(Date, nullable=False)
    publisher = Column(String, nullable=True)
    cover_img = Column(String, nullable=True)
    reward = Column(String, nullable=True)

    work = relationship("Works", back_populates="book")
