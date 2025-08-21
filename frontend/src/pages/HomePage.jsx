import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard/PostCard.jsx';
import { getPosts } from '../api/post'; // post API 함수 임포트
import './HomePage.css';

function HomePage() {
  const [posts, setPosts] = useState([]); // 게시물 데이터를 저장할 state
  const [loading, setLoading] = useState(true); // 로딩 상태 관리

  useEffect(() => {
    // 페이지가 처음 렌더링될 때 게시물 목록을 불러옵니다.
    const fetchPosts = async () => {
      try {
        const postData = await getPosts();
        setPosts(postData); // 받아온 데이터로 state 업데이트
      } catch (error) {
        console.error("게시물 목록을 불러오는 데 실패했습니다.", error);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchPosts();
  }, []); // []를 비워두면 컴포넌트가 마운트될 때 한 번만 실행됩니다.

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="home-container">
      <div className="filter-tabs">
        <button className="active">popular</button>
        <button>recent</button>
        <button>feed</button>
      </div>
      <div className="post-grid">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p>게시물이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;