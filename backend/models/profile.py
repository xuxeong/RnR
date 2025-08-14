from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Profile(Base):
    __tablename__ = "profile"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    profile_id = Column(Integer, primary_key=True)
    nickname = Column(String, nullable=True, doc="초기값은 login_id")
    bio = Column(String, nullable=True)
    profile_img = Column(String, nullable=True)
    profile_color = Column(String, nullable=True, default="#87CEFA")
    profile_shape = Column(String, nullable=True, default="Circle")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    modify_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    user = relationship("Users", back_populates="profiles")
