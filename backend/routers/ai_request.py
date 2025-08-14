from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Works, Books, Movies, Posts

ai_router = APIRouter(prefix="", tags=["AI request"])

def get_work_by_id(db: Session, work_id: int):
    """
    Works 테이블에서 work_id로 작품을 조회하고,
    Type에 따라 Books 또는 Movies 객체를 반환합니다.
    """
    work = db.query(Works).get(work_id)
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    if work.Type == "book":
        return db.query(Books).get(work_id)
    elif work.Type == "movie":
        return db.query(Movies).get(work_id)
    return None

@ai_router.post("/works/{work_id}/ai-summary")
def ai_summary_work(work_id: int, db: Session = Depends(get_db)):
    # get_work_by_id 함수로 통합된 로직을 사용합니다.
    work_obj = get_work_by_id(db, work_id)
    if not work_obj:
        raise HTTPException(status_code=404, detail="Work not found")

    # AI 요약 로직 (placeholder)
    # 실제로는 GPT API를 호출하여 요약 내용을 가져와야 합니다.
    summary_text = f"Auto summary for {work_obj.name}"
    work_obj.ai_summary = summary_text
    
    db.commit()
    
    return {
        "message": "Work summary updated successfully",
        "work_id": work_id,
        "ai_summary": summary_text
    }

@ai_router.post("/posts/{post_id}/ai-summary")
def ai_summary_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Posts).get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # AI 요약 로직 (placeholder)
    # 실제로는 GPT API를 호출하여 요약 내용을 가져와야 합니다.
    summary_text = f"Auto summary for post {post.post_id}"
    post.ai_summary = summary_text
    
    db.commit()
    
    return {
        "message": "Post summary updated successfully",
        "post_id": post_id,
        "ai_summary": summary_text
    }

@ai_router.post("/posts/{post_id}/emotion")
def ai_emotion_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Posts).get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # AI 감정 분석 로직 (placeholder)
    # 실제로는 GPT API를 호출하여 감정 분석 결과를 가져와야 합니다.
    emotion_result = "neutral"
    post.ai_emotion = emotion_result
    
    db.commit()
    
    return {
        "message": "Post emotion analyzed successfully",
        "post_id": post_id,
        "ai_emotion": emotion_result
    }