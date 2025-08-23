import os
from openai import OpenAI
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# OpenAI 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_summary_from_gpt(title: str, author_or_director: str, work_type: str = "책") -> str:
    """
    GPT-3.5-turbo 모델을 사용하여 작품의 예상 줄거리를 생성합니다.
    """
    if not client.api_key:
        return "OpenAI API 키가 설정되지 않았습니다."

    try:
        # 작품 타입에 따라 저자 또는 감독으로 표시
        creator_label = "저자" if work_type == "책" else "감독"
        
        # GPT에 전달할 프롬프트(명령문)
        prompt = (
            f"'{title}'({creator_label}: {author_or_director})라는 제목의 {work_type}이 있다고 상상하고, "
            f"이 작품에 대한 흥미를 유발할 만한 짧은 예상 줄거리를 200자 내외로 작성해줘. "
            f"실제 존재하는 작품이 아니라면 알 수 없는 작품이라고 해줘."
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a creative storyteller who writes fascinating plot summaries."},
                {"role": "user", "content": prompt}
            ]
        )
        
        summary = response.choices[0].message.content
        return summary.strip()

    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return "줄거리 생성에 실패했습니다."
    
def get_emotion_from_gpt(content: str) -> str:
    """
    GPT-3.5-turbo 모델을 사용하여 게시물 내용의 감성을 분석합니다.
    """
    if not client.api_key:
        return "neutral" # API 키가 없으면 기본값 반환

    try:
        prompt = (
            "다음은 사용자가 작성한 책 또는 영화 리뷰의 내용이야. "
            "이 내용의 전체적인 감성이 긍정적인지, 부정적인지, 아니면 중립적인지 판단해줘. "
            "너의 답변은 반드시 'positive', 'negative', 'neutral' 이 세 단어 중 하나여야만 해. 다른 설명은 절대 추가하지 마."
            f"\n\n--- 리뷰 내용 ---\n{content}"
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a sentiment analysis expert who classifies text into 'positive', 'negative', or 'neutral'."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1 # 일관된 답변을 위해 temperature를 낮게 설정
        )
        
        emotion = response.choices[0].message.content.lower().strip()

        # 응답이 세 가지 중 하나인지 확인, 아니면 neutral로 처리
        if emotion not in ['positive', 'negative', 'neutral']:
            return 'neutral'
            
        return emotion

    except Exception as e:
        print(f"Error calling OpenAI API for emotion analysis: {e}")
        return "neutral" # 에러 발생 시 기본값 반환