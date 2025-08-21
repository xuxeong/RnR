# alembic/env.py

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv
import os
import sys

# 프로젝트의 루트 경로를 시스템 경로에 추가하여 모델을 찾을 수 있도록 합니다.
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Alembic Config 객체이며, alembic.ini 파일의 값에 접근할 수 있습니다.
config = context.config

# .env 파일 로드
load_dotenv()

# Python 로깅을 위해 fileConfig를 해석합니다.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- 이 부분이 중요합니다 ---
# .env 파일에서 DATABASE_URL을 가져와 alembic.ini에 설정합니다.
# 이렇게 하면 Alembic이 DB에 연결할 수 있습니다.
db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise ValueError("DATABASE_URL 환경변수가 설정되지 않았습니다.")
# 비동기 드라이버(asyncpg)를 동기 드라이버(psycopg2)로 잠시 변경합니다.
config.set_main_option('sqlalchemy.url', db_url.replace("postgresql+asyncpg", "postgresql"))

# 프로젝트의 모든 모델이 의존하는 Base 객체를 가져옵니다.
from database import Base
# models 폴더의 __init__.py를 통해 모든 모델을 로드합니다.
import models

# Alembic이 사용할 target_metadata를 설정합니다.
target_metadata = Base.metadata

# --- !!! 아래 디버깅 코드를 추가해주세요 !!! ---
print("--- DEBUG: Loaded Tables in Metadata ---")
for table in target_metadata.tables.values():
    print(f"  - Detected table: {table.name}")
if not target_metadata.tables:
    print("  - !!! No tables detected in metadata !!!")
print("------------------------------------")
# --- 여기까지 추가 ---

def run_migrations_offline() -> None:
    """'오프라인' 모드에서 마이그레이션을 실행합니다."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """'온라인' 모드에서 마이그레이션을 실행합니다."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}), # config_ini_section 으로 수정
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()