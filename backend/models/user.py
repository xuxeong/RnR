from sqlalchemy import Column, Integer, String, Date, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Users(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, nullable=False)
    delete_at = Column(TIMESTAMP, nullable=True, doc="삭제 시 생성됨...")
    name = Column(String, nullable=False, doc="실명")
    # age 컬럼은 birth로 계산 가능하므로 모델에서 제외하는 것을 고려해볼 수 있습니다.
    #age = Column(Integer, nullable=False, doc="birth로 자동 계산")
    birth = Column(Date, nullable=False)
    provider = Column(Enum("google", "kakao", "naver", "local", name="provider_type"), nullable=False)
    provider_id = Column(String, nullable=True, doc="소셜 플랫폼 고유 ID")
    login_id = Column(String, nullable=True, doc="로컬 로그인 ID")
    pw = Column(String, nullable=False, doc="암호화 필요")
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False)
    modify_at = Column(TIMESTAMP(timezone=True), nullable=False)
    last_login_ip = Column(String, nullable=True)

    profiles = relationship("Profile", back_populates="user")
    interests = relationship("User_interest", back_populates="user")
    posts = relationship("Posts", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("Likes", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    recommend_users = relationship("Recommend_user", foreign_keys="[Recommend_user.user_id]", back_populates="user")
    recommend_targets = relationship("Recommend_user", foreign_keys="[Recommend_user.target_id]", back_populates="target")
    recommend_works = relationship("Recommend_work", back_populates="user")
