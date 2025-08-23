// src/components/StarRating/StarRating.jsx

import React, { useState } from 'react';
import './StarRating.css'; // 별점 디자인을 위한 CSS 파일

export default function StarRating({ workId, onRatingSubmitted }) {
  const [rating, setRating] = useState(0); // 현재 선택된 별점
  const [hover, setHover] = useState(0); // 마우스가 올라간 위치의 별점

  const handleSubmitRating = async (ratingValue) => {
    try {
      await onRatingSubmitted(workId, ratingValue);
      setRating(ratingValue); // API 호출 성공 시, 선택된 별점으로 상태 고정
      alert(`${ratingValue}점을 주셨습니다!`);
    } catch (error) {
      // --- 이 부분을 수정합니다 ---
      // 401 에러인 경우 로그인 필요 알림을, 그 외에는 일반 실패 알림을 띄웁니다.
      if (error.response && error.response.status === 401) {
        alert('평점을 매기려면 로그인이 필요합니다.');
      } else {
        alert('평점 등록에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="star-rating">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={ratingValue <= (hover || rating) ? "on" : "off"}
            onClick={() => handleSubmitRating(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            <span className="star">&#9733;</span>
          </button>
        );
      })}
    </div>
  );
}