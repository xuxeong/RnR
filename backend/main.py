import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from fastapi import FastAPI
from routers.user import user_router
from routers.auth import auth_router
from routers.profile import profile_router
from routers.work import work_router 
from routers.post import post_router 
from routers.genre import genre_router
from routers.rating import rating_router
from routers.ai_request import ai_router 
from routers.recommend import rec_router 

# CORS 미들웨어 추가를 위한 임포트
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 미들웨어 설정 (프론트엔드와 통신을 위해 필수)
origins = [
    "http://localhost:5173", # Vite 개발 서버 기본 포트
    # "http://localhost:3000", # React 개발 서버 기본 포트 (필요 시 추가)
    # 여기에 실제 프론트엔드 배포 주소를 추가하세요.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 모든 HTTP 메서드 허용 (GET, POST, PUT, DELETE 등)
    allow_headers=["*"], # 모든 HTTP 헤더 허용
)

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(work_router)
app.include_router(post_router)
app.include_router(genre_router)
app.include_router(rating_router)
app.include_router(ai_router)
app.include_router(rec_router)

@app.get("/")
def hello():
    return {"msg": "Hello, RnR!"}