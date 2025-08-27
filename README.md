# R\&R (Reel & Read): AI 추천 기반 영화/도서 커뮤니티

## 📖 프로젝트 소개

\*\*R\&R (Reel & Read)\*\*은 책과 영화를 사랑하는 사람들을 위한 문화 커뮤니티 서비스입니다. 넘쳐나는 콘텐츠 속에서 단순한 평점만으로는 부족했던 사용자들을 위해, 보다 많은 사람들과 책, 영화에 대해 소통하고 싶었던 사람들을 위해, AI 요약 및 감성 분석, 그리고 개인의 독서/시청 기록을 종합한 하이브리드 추천 시스템을 통해 새로운 콘텐츠를 발견하고 깊이 있는 감상을 나누는 경험을 제공합니다.

## 🔑 주요 기능

  - **작품 탐색 및 관리**: MovieLens, OpenLibrary 데이터를 기반으로 한 방대한 영화/도서 정보 탐색, 검색, 필터링 및 평점 기록 기능을 제공합니다.
  - **AI 기반 콘텐츠 요약**: 사용자가 작품 상세 페이지에 처음 방문 시, OpenAI(GPT) API를 통해 해당 작품의 줄거리를 실시간으로 생성하고, 이후 방문자를 위해 데이터베이스에 저장합니다.
  - **하이브리드 추천 시스템**: 사용자의 평점 패턴을 분석하는 **사용자 기반 협업 필터링**과 작품의 장르 정보를 분석하는 **콘텐츠 기반 필터링**을 결합하여 개인화된 작품 및 사용자 목록을 추천합니다.
  - **AI 감성 분석 기반 로직**: 사용자가 작성한 텍스트 리뷰의 뉘앙스(긍정/부정)를 AI가 분석하여, 숨겨진 명작을 발굴하는 등 추천 알고리즘의 정확도를 높입니다.
  - **포스트 기능**: 사용자들이 자유롭게 글을 작성하고, 다른 사람의 글에 '좋아요'와 '댓글'로 소통할 수 있는 커뮤니티 환경을 제공합니다.

## 🛠️ 기술 스택

### Backend

  - **Framework**: FastAPI
  - **Database**: PostgreSQL
  - **ORM**: SQLAlchemy (with Alembic for migrations)
  - **Authentication**: JWT (JSON Web Tokens), Passlib
  - **AI**: OpenAI (GPT-3.5)
  - **Recommendation**: Scikit-learn, Surprise

### Frontend

  - **Framework**: React (with Vite)
  - **State Management**: React Context
  - **HTTP Client**: Axios
  - **Styling**: Tailwind CSS

## ⚙️ 설치 및 실행 방법

### 1\. 프로젝트 복제

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2\. 백엔드(Backend) 설정

1.  **백엔드 폴더로 이동**
    ```bash
    cd backend
    ```
2.  **가상환경 생성 및 활성화**
    ```bash
    python -m venv .venv
    # Windows
    .venv\Scripts\activate
    # macOS/Linux
    source .venv/bin/activate
    ```
3.  **필요 라이브러리 설치**
    ```bash
    pip install -r requirements.txt
    ```
4.  **.env 파일 생성**
    `.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 아래와 같이 환경 변수를 설정합니다.
    ```
    DATABASE_URL="postgresql+asyncpg://USER:PASSWORD@localhost:5432/DB_NAME"
    JWT_SECRET_KEY="your_jwt_secret_key"
    OPENAI_API_KEY="sk-..."
    GOOGLE_CLIENT_ID="..."
    GOOGLE_CLIENT_SECRET="..."
    ```
5.  **데이터베이스 마이그레이션**
    `alembic`을 사용하여 데이터베이스 스키마를 최신 상태로 업데이트합니다.
    ```bash
    alembic upgrade head
    ```
6.  **초기 데이터 채우기 (Seeding)**
    `seed.py`를 실행하여 초기 데이터를 데이터베이스에 삽입합니다.
    ```bash
    python seed.py
    ```
7.  **백엔드 서버 실행**
    ```bash
    uvicorn main:app --reload
    ```
    서버가 `http://127.0.0.1:8000`에서 실행됩니다.

### 3\. 프론트엔드(Frontend) 설정

1.  **프론트엔드 폴더로 이동** (새 터미널에서 진행)
    ```bash
    cd frontend
    ```
2.  **필요 라이브러리 설치**
    ```bash
    npm install
    ```
3.  **프론트엔드 개발 서버 실행**
    ```bash
    npm run dev
    ```
    애플리케이션이 `http://localhost:5173`에서 실행됩니다. 브라우저에서 이 주소로 접속하세요.