import React, { useState, useEffect } from 'react';
import { getMyPosts } from '../api/post';
import PostCard from '../components/PostCard/PostCard';

export default function MyFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        const data = await getMyPosts();
        setPosts(data);
      } catch (err) {
        setError('내가 쓴 게시물을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, []);

  if (loading) return <div className="text-center p-10">로딩 중...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Feed</h1>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map(post => <PostCard key={post.post_id} post={post} />)}
        </div>
      ) : (
        <p>아직 작성한 게시물이 없습니다.</p>
      )}
    </div>
  );
}