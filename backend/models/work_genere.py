# models/work_genre.py

from sqlalchemy import Table, Column, Integer, ForeignKey
from database import Base

# SQLAlchemy ORM 모델 클래스를 만들지 않고,
# 순수한 연결 테이블 자체를 정의합니다.
work_genre_association = Table(
    'work_genre', Base.metadata,
    Column('work_id', Integer, ForeignKey('works.work_id', ondelete="CASCADE"), primary_key=True),
    Column('genre_id', Integer, ForeignKey('genre.genre_id', ondelete="CASCADE"), primary_key=True)
)