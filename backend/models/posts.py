from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Posts(Base):
    __tablename__ = "posts"
    post_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    genre_id = Column(Integer, ForeignKey("genre.genre_id"), nullable=False)
    last_update_ip = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False)
    modify_at = Column(TIMESTAMP(timezone=True), nullable=False)
    post_type = Column(Enum("review", "general", "vote", name="post_type"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    img = Column(String, nullable=True)
    hit = Column(Integer, default=0, nullable=False)
    like = Column(Integer, default=0, nullable=False)
    comment = Column(Integer, default=0, nullable=False)
    work_id = Column(Integer, ForeignKey("works.work_id"), nullable=True)
    ai_summary = Column(String, nullable=True)
    ai_emotion = Column(Enum("positive", "neutral", "negative", name="ai_emotion"), nullable=True)

    user = relationship("Users", back_populates="posts")
    genre = relationship("Genre", back_populates="posts")
    work = relationship("Works", back_populates="posts")
    comments = relationship("Comment", back_populates="post")
    likes = relationship("Likes", back_populates="post")
