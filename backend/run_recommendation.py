import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import logging
import ast

# --- 추천 알고리즘 라이브러리 ---
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import Dataset, Reader, KNNBasic
from collections import defaultdict
from tqdm import tqdm

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- 데이터베이스 연결 설정 ---
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL 환경변수가 설정되지 않았습니다.")

SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")
engine = create_engine(SYNC_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_all_recommendations():
    db = SessionLocal()
    try:
        # --- 1. 데이터 로드 ---
        logging.info("Loading data from database...")
        ratings_df = pd.read_sql("SELECT user_id, work_id, rating FROM rating", db.bind)
        works_genres_df = pd.read_sql("""
            SELECT w.work_id, g.label as genre_label 
            FROM works w 
            JOIN work_genre wg ON w.work_id = wg.work_id 
            JOIN genre g ON wg.genre_id = g.genre_id
        """, db.bind)
        
        if ratings_df.empty or works_genres_df.empty:
            logging.warning("Not enough data found. Exiting.")
            return

        works_df = works_genres_df.groupby('work_id')['genre_label'].apply(list).reset_index()
        works_df.rename(columns={'genre_label': 'genres'}, inplace=True)
        logging.info("✅ Data loaded and prepared successfully.")

        # --- 2. CBF 모델 생성 (작품 유사도) ---
        logging.info("Creating Content-Based Filtering (CBF) model...")
        works_df['genres_str'] = works_df['genres'].apply(lambda x: ' '.join(x))
        tfidf_matrix = TfidfVectorizer().fit_transform(works_df['genres_str'])
        work_similarity = cosine_similarity(tfidf_matrix)
        work_sim_df = pd.DataFrame(work_similarity, index=works_df['work_id'], columns=works_df['work_id'])
        logging.info("✅ CBF model created.")

        # --- 3. User-CF 모델 학습 (Surprise) ---
        logging.info("Training User-CF model (for work recommendations)...")
        reader = Reader(rating_scale=(0.5, 5.0))
        data = Dataset.load_from_df(ratings_df[['user_id', 'work_id', 'rating']], reader)
        trainset = data.build_full_trainset()
        sim_options_ucf = {'name': 'cosine', 'user_based': True}
        model_cf = KNNBasic(sim_options=sim_options_ucf)
        model_cf.fit(trainset)
        logging.info("✅ User-CF model for works trained.")

        # --- 4. 하이브리드 작품 추천 목록 생성 ---
        logging.info("Generating hybrid work recommendations...")
        # ... (이전과 동일한 작품 추천 로직) ...
        all_recommendations = []
        high_rating_threshold = 4.0
        top_k_works = 20

        for user_id in tqdm(ratings_df['user_id'].unique(), desc="Generating work recommendations"):
            seen_works = ratings_df[ratings_df['user_id'] == user_id]['work_id'].tolist()
            cbf_recs = defaultdict(float)
            high_rated_works = ratings_df[(ratings_df['user_id'] == user_id) & (ratings_df['rating'] >= high_rating_threshold)]['work_id']
            for work_id in high_rated_works:
                if work_id in work_sim_df.index:
                    similar_works = work_sim_df[work_id].sort_values(ascending=False)[1:top_k_works+1]
                    for sim_work_id, score in similar_works.items():
                        cbf_recs[sim_work_id] += score
            cf_recs = {}
            unseen_works = works_df[~works_df['work_id'].isin(seen_works)]['work_id']
            for work_id in unseen_works:
                prediction = model_cf.predict(user_id, work_id)
                cf_recs[prediction.iid] = prediction.est
            hybrid_scores = defaultdict(float)
            for work_id, score in cbf_recs.items(): hybrid_scores[work_id] += score * 0.5
            for work_id, score in cf_recs.items(): hybrid_scores[work_id] += score * 1.0
            for work_id in seen_works:
                if work_id in hybrid_scores: del hybrid_scores[work_id]
            sorted_recs = sorted(hybrid_scores.items(), key=lambda item: item[1], reverse=True)[:top_k_works]
            for work_id, score in sorted_recs:
                all_recommendations.append({'user_id': int(user_id), 'work_id': int(work_id), 'score': float(score)})
        
        logging.info(f"✅ Generated {len(all_recommendations)} work recommendations.")

        # --- 5. 사용자 추천 목록 생성 (User-User Similarity) ---
        logging.info("Generating user recommendations...")
        user_item_matrix = ratings_df.pivot_table(index='user_id', columns='work_id', values='rating').fillna(0)
        user_similarity = cosine_similarity(user_item_matrix)
        user_sim_df = pd.DataFrame(user_similarity, index=user_item_matrix.index, columns=user_item_matrix.index)
        
        all_user_recs = []
        top_n_users_to_recommend = 10
        for user_id in tqdm(user_sim_df.index, desc="Generating user recommendations"):
            similar_users = user_sim_df[user_id].sort_values(ascending=False)[1:top_n_users_to_recommend+1]
            for target_id, score in similar_users.items():
                all_user_recs.append({'user_id': int(user_id), 'target_id': int(target_id), 'score': float(score)})
        logging.info(f"✅ Generated {len(all_user_recs)} user recommendations.")

        # --- 6. 사용자 관심 장르 생성 ---
        logging.info("Generating user interest genres...")
        genres_from_db = pd.read_sql("SELECT genre_id, label FROM genre", db.bind)
        genre_to_id = dict(zip(genres_from_db['label'], genres_from_db['genre_id']))
        
        user_interests = []
        top_n_genres = 3
        user_genre_data = pd.merge(ratings_df[ratings_df['rating'] >= high_rating_threshold], works_df, on='work_id')

        for user_id in tqdm(user_genre_data['user_id'].unique(), desc="Generating user interests"):
            user_genres = user_genre_data[user_genre_data['user_id'] == user_id]['genres'].explode()
            top_genres = user_genres.value_counts().nlargest(top_n_genres).index.tolist()
            for genre_name in top_genres:
                genre_id = genre_to_id.get(genre_name)
                if genre_id:
                    user_interests.append({'user_id': int(user_id), 'genre_id': int(genre_id)})
        logging.info(f"✅ Generated {len(user_interests)} user interest entries.")

        # --- 7. 모든 결과를 DB에 저장 ---
        logging.info("Saving all recommendation data to the database...")
        # 기존 데이터 삭제
        db.execute(text("DELETE FROM recommend_work"))
        db.execute(text("DELETE FROM recommend_user"))
        db.execute(text("DELETE FROM user_interest"))
        
        # 새 데이터 삽입
        if all_recommendations:
            db.execute(text("INSERT INTO recommend_work (user_id, work_id, score) VALUES (:user_id, :work_id, :score)"), all_recommendations)
        if all_user_recs:
            db.execute(text("INSERT INTO recommend_user (user_id, target_id, score) VALUES (:user_id, :target_id, :score)"), all_user_recs)
        if user_interests:
            db.execute(text("INSERT INTO user_interest (user_id, genre_id) VALUES (:user_id, :genre_id)"), user_interests)
        
        db.commit()
        logging.info("✅ All data saved successfully.")

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_all_recommendations()