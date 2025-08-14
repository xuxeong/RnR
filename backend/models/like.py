from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Likes(Base):
    __tablename__ = "likes"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"), primary_key=True)

    user = relationship("Users", back_populates="likes")
    post = relationship("Posts", back_populates="likes")
