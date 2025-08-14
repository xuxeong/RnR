from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from database import Base

class Comment(Base):
    __tablename__ = "comment"
    comment_id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    context = Column(String, nullable=False)
    like = Column(Integer, default=0, nullable=False)
    last_update_ip = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False)
    modify_at = Column(TIMESTAMP(timezone=True), nullable=False)

    post = relationship("Posts", back_populates="comments")
    user = relationship("Users", back_populates="comments")
