import React from 'react';
import { Link } from 'react-router-dom';
import './WorkCard.css'; // PostCard와 동일한 스타일을 사용

export default function WorkCard({ work }) {
  const { work_id, name, Type, cover_img } = work;

  return (
    // 작품 상세 페이지로 링크를 겁니다.
    <Link to={`/works/${work_id}`} className="work-card">
      <div className="work-card-image-wrapper">
        <img 
          src={cover_img || `https://placehold.co/600x400/EEE/31343C?text=${Type}`} 
          alt={name} 
          className="work-card-image" 
        />
      </div>
      <div className="work-card-content">
        <h3 className="work-card-title">{name}</h3>
        <p className="work-card-author">{Type === 'book' ? '책' : '영화'}</p>
      </div>
    </Link>
  );
}