import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPostDetail } from '../api/post';

export default function PostDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostDetail(postId);
        setPost(data);
      } catch (err) {
        setError('게시물을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (loading) return <div className="text-center p-10">게시물을 불러오는 중...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!post) return null;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* 게시물 헤더 */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
        <p className="text-md text-gray-500 mt-2">
          작성자: {post.user?.profile?.nickname || `User ${post.user_id}`} | 작성일: {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>
      
      {/* 게시물 본문 */}
      <div className="prose lg:prose-xl max-w-none">
        <p>{post.content}</p>
      </div>

      {/* 댓글 영역 (추후 구현) */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">댓글</h2>
        <div className="mt-4 p-6 bg-gray-100 rounded-lg">
          <p>여기에 댓글 기능이 추가될 예정입니다.</p>
        </div>
      </div>
    </div>
  );
}