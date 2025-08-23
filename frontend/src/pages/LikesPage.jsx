import React, { useState, useEffect } from 'react';
import { getLikedPosts } from '../api/post';
import PostCard from '../components/PostCard/PostCard';

export default function LikesPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        setLoading(true);
        const data = await getLikedPosts();
        setPosts(data);
      } catch (err) {
        setError('좋아요한 게시물을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchLikedPosts();
  }, []);

  if (loading) return <div className="text-center p-10">로딩 중...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">내가 좋아요한 게시물</h1>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map(post => <PostCard key={post.post_id} post={post} />)}
        </div>
      ) : (
        <p>아직 좋아요한 게시물이 없습니다.</p>
      )}
    </div>
  );
}