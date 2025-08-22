// src/components/PostCard/PostCard.jsx

import React from 'react';
import './PostCard.css'; // 카드 디자인을 위한 CSS 파일

export default function PostCard({ post }) {
  // post 객체에서 필요한 정보를 추출합니다.
  // user 객체가 아직 없으므로, 일단 post.user_id를 표시합니다.
  const { title, content, user_id, img } = post;

  return (
    <div className="post-card">
      <div className="post-card-image-wrapper">
        <img 
          src={img || 'https://placehold.co/600x400/EEE/31343C?text=R%26R'} 
          alt={title} 
          className="post-card-image" 
        />
      </div>
      <div className="post-card-content">
        <h3 className="post-card-title">{title}</h3>
        <p className="post-card-author">by User {user_id}</p>
      </div>
    </div>
  );
}