# routers/ai_request.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Works, Books, Movies, Posts
from services.ai_service import get_summary_from_gpt, get_emotion_from_gpt

ai_router = APIRouter(prefix="", tags=["AI request"])

# --- 비동기 방식으로 수정 ---
async def get_work_by_id(db: Session, work_id: int):
    """
    비동기 세션을 사용하여 work_id로 작품을 조회합니다.
    """
    # db.query(Model).get(id) -> await db.get(Model, id)
    work = await db.get(Works, work_id)
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    # work.Type에 따라 books 또는 movies 테이블에서 상세 정보 조회
    if work.Type == "book":
        return await db.get(Books, work_id)
    elif work.Type == "movie":
        return await db.get(Movies, work_id)
    return None

# --- 비동기 방식으로 수정 ---
@ai_router.post("/works/{work_id}/ai-summary")
async def ai_summary_work(work_id: int, db: Session = Depends(get_db)):
    work_obj = await get_work_by_id(db, work_id)
    if not work_obj:
        raise HTTPException(status_code=404, detail="Work not found")

    if isinstance(work_obj, Books):
        creator = work_obj.author
        work_type = "책"
    elif isinstance(work_obj, Movies):
        creator = work_obj.director
        work_type = "영화"
    else:
        raise HTTPException(status_code=400, detail="Unsupported work type")

    summary_text = get_summary_from_gpt(title=work_obj.name, author_or_director=creator, work_type=work_type)
    
    work_obj.ai_summary = summary_text
    
    db.add(work_obj)
    await db.commit()
    await db.refresh(work_obj)
    
    return {
        "message": "Work summary updated successfully",
        "work_id": work_id,
        "ai_summary": summary_text
    }

@ai_router.post("/posts/{post_id}/ai-summary")
async def ai_summary_post(post_id: int, db: Session = Depends(get_db)):
    post = await db.get(Posts, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 간단한 요약 프롬프트를 위해 get_summary_from_gpt를 재활용하거나
    # 별도의 post 요약 함수를 ai_service에 만들 수 있습니다. 여기서는 재활용.
    summary_text = get_summary_from_gpt(title=post.title, author_or_director=f"게시물 내용: {post.content[:200]}...", work_type="게시물")
    post.ai_summary = summary_text
    
    db.add(post)
    await db.commit()
    
    return {
        "message": "Post summary updated successfully",
        "post_id": post_id,
        "ai_summary": summary_text
    }

@ai_router.post("/posts/{post_id}/emotion")
async def ai_emotion_post(post_id: int, db: Session = Depends(get_db)):
    post = await db.get(Posts, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 새로 만든 감성 분석 함수 호출
    emotion_result = get_emotion_from_gpt(post.content)
    post.ai_emotion = emotion_result
    
    db.add(post)
    await db.commit()
    
    return {
        "message": "Post emotion analyzed successfully",
        "post_id": post_id,
        "ai_emotion": emotion_result
    }