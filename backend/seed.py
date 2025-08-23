# backend/seed.py

import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from datetime import date, datetime
from passlib.context import CryptContext
import logging

# --- 로깅 설정 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logging.getLogger('passlib').setLevel(logging.ERROR)

# --- SQLAlchemy 모델 임포트 ---
# 이 스크립트가 모델을 찾을 수 있도록 경로를 설정합니다.
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from models.user import Users
from models.genre import Genre
from models.works import Works
from models.books import Books
from models.movies import Movies
from models.rating import Rating
from models.work_genere import work_genre_association

# --- 비밀번호 해싱을 위한 설정 ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- 데이터베이스 연결 설정 ---
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL 환경변수가 설정되지 않았습니다.")

# 시딩 스크립트는 동기(synchronous) 엔진을 사용하는 것이 더 간단하고 안정적입니다.
# asyncpg -> psycopg2로 드라이버를 변경합니다.
SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")
engine = create_engine(SYNC_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_data():
    """
    모든 CSV 파일과 더미 사용자 데이터를 데이터베이스에 삽입하는 메인 함수.
    """
    db = SessionLocal()
    try:
        # --- 1. Genres 시딩 ---
        logging.info("Seeding genres...")
        df_genres = pd.read_csv("db_genres.csv")
        df_genres.rename(columns={'name': 'label'}, inplace=True)
        df_genres['genre_type'] = 'content'

        # --- 이 부분을 수정했습니다 ---
        # 기존 장르의 가장 큰 ID 값을 찾습니다.
        last_genre_id = df_genres['genre_id'].max()

        # 커뮤니티용 장르를 만들 때, 찾은 ID 다음 번호부터 순서대로 부여합니다.
        community_genres = pd.DataFrame([
            {'genre_id': last_genre_id + 1, 'label': '일상', 'genre_type': 'community'},
            {'genre_id': last_genre_id + 2, 'label': '잡담', 'genre_type': 'community'},
            {'genre_id': last_genre_id + 3, 'label': '질문', 'genre_type': 'community'}
        ])
        
        df_genres_all = pd.concat([df_genres, community_genres], ignore_index=True)

        db.bulk_insert_mappings(Genre, df_genres_all.to_dict(orient="records"))
        db.commit()
        logging.info("✅ Genres seeded successfully.")

        # --- 2. 더미 Users 시딩 ---
        logging.info("Generating and seeding dummy users...")
        df_ratings = pd.read_csv("db_ratings.csv")
        max_user_id = df_ratings['userId'].max()
        users_to_create = []
        for i in range(1, max_user_id + 1):
            users_to_create.append({
                'user_id': i,
                'name': f'testuser{i}',
                'birth': date(2000, 1, 1),
                'provider': 'local',
                'email': f'test{i}@example.com',
                'pw': pwd_context.hash('password'), # 모든 더미 유저의 비밀번호는 'password'
                'created_at': datetime.now(),
                'modify_at': datetime.now()
            })
        db.bulk_insert_mappings(Users, users_to_create)
        db.commit()
        logging.info("✅ Dummy users seeded successfully.")

        # --- 3. Works 시딩 ---
        logging.info("Seeding works...")
        df_works = pd.read_csv("db_works.csv")
        # 모델의 'Type' 컬럼명에 맞게 CSV 컬럼명을 변경합니다.
        df_works.rename(columns={'type': 'Type'}, inplace=True)
        db.bulk_insert_mappings(Works, df_works.to_dict(orient="records"))
        db.commit()
        logging.info("✅ Works seeded successfully.")

        # --- 4. Movies 시딩 ---
        logging.info("Seeding movies...")
        df_movies = pd.read_csv("db_movies.csv")
        # 결측값(NaN)을 파이썬의 None으로 변환하여 오류를 방지합니다.
        df_movies = df_movies.where(pd.notnull(df_movies), None)
        db.bulk_insert_mappings(Movies, df_movies.to_dict(orient="records"))
        db.commit()
        logging.info("✅ Movies seeded successfully.")

        # --- 5. Books 시딩 ---
        logging.info("Seeding books...")
        df_books = pd.read_csv("db_books.csv")
        df_books = df_books.where(pd.notnull(df_books), None)
        
        if 'cover_img' not in df_books.columns:
            df_books['cover_img'] = None

        def fix_date(val):
            if isinstance(val, int) or (isinstance(val, str) and val.isdigit() and len(val) == 4):
                return f"{val}-01-01"
            return val

        df_books['created_at'] = df_books['created_at'].apply(fix_date)

        # pandas 날짜 타입으로 변환, 변환 실패시 기본값으로 대체
        df_books['created_at'] = pd.to_datetime(df_books['created_at'], errors='coerce')
        df_books['created_at'] = df_books['created_at'].fillna(pd.to_datetime('1900-01-01'))
        
        db.bulk_insert_mappings(Books, df_books.to_dict(orient="records"))
        db.commit()
        logging.info("✅ Books seeded successfully.")

        # --- 6. Work-Genre 연결 테이블 시딩 ---
        logging.info("Seeding work_genre associations...")
        df_work_genre = pd.read_csv("db_work_genre.csv")
        # bulk_insert_mappings는 ORM 모델에만 사용 가능하므로,
        # 연결 테이블에는 execute를 사용하여 직접 삽입합니다.
        db.execute(work_genre_association.insert(), df_work_genre.to_dict(orient="records"))
        db.commit()
        logging.info("✅ Work-genre associations seeded successfully.")

        # --- 7. Ratings 시딩 ---
        logging.info("Seeding ratings...")
        df_ratings.rename(columns={'userId': 'user_id'}, inplace=True)
        db.bulk_insert_mappings(Rating, df_ratings.to_dict(orient="records"))
        db.commit()
        logging.info("✅ Ratings seeded successfully.")

        logging.info("Resetting user_suser_id_seq sequence...")
        max_id_result = db.execute(text("SELECT MAX(user_id) FROM users")).scalar_one_or_none()
        if max_id_result is not None:
            # PostgreSQL의 시퀀스 값을 가장 큰 user_id로 재설정합니다.
            # 시퀀스 이름은 보통 '테이블명_컬럼명_seq' 규칙을 따릅니다.
            db.execute(text(f"SELECT setval('users_user_id_seq', {max_id_result}, true)"))
            db.commit()
            logging.info(f"✅ User ID sequence reset to {max_id_result}.")

        logging.info("🎉 All data has been seeded successfully!")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # 이 스크립트를 직접 실행했을 때만 seed_data 함수가 호출됩니다.
    seed_data()
