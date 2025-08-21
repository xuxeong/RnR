import React from 'react';
import './PostCard.css';

function PostCard({ post }) { // props로 post 객체를 받음
  // post 객체에 이미지 URL, 제목 등이 있다고 가정합니다.
  // 실제 데이터 구조에 맞게 수정이 필요합니다.
  const { title, imageUrl, author } = post;

  return (
    <div className="post-card">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="post-image" />
      ) : (
        <div className="placeholder-image"></div>
      )}
      <div className="post-info">
        <h3 className="post-title">{title || '제목 없음'}</h3>
        <p className="post-author">{author?.nickname || '작성자 미상'}</p>
      </div>
    </div>
  );
}

export default PostCard;