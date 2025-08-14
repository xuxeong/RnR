# backend/alembic/env.py
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from dotenv import load_dotenv
import os
import sys

# 프로젝트 루트 경로를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise ValueError("DATABASE_URL 환경변수가 설정되지 않았습니다.")

# 프로젝트의 Base와 모든 모델을 임포트
from database import Base
from models import (
    user, profile, user_interest,
    works, books, movies, genre,
    posts, comment, like, rating,
    recommend_user, recommend_work
)

target_metadata = Base.metadata

def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        # 이 부분이 중요합니다.
        # do_run_migrations는 동기적으로 실행되므로,
        # connection 객체는 동기 연결이어야 합니다.
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    connectable = create_async_engine(db_url)
    
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

def run_migrations_offline() -> None:
    url = db_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio
    asyncio.run(run_migrations_online())