import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPostDetail, toggleLikePost } from '../api/post';

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

  // 좋아요 버튼 클릭 핸들러 추가
  const handleLike = async () => {
    try {
      await toggleLikePost(post.post_id);
      // 성공 시 화면에 즉시 반영 (실제 카운트는 백엔드에서 처리)
      // 여기서는 간단하게 좋아요 상태를 토글하는 것처럼 보이기만 합니다.
      alert('좋아요 상태가 변경되었습니다! (실제 반영은 새로고침 시 확인)');
    } catch (error) {
      alert('좋아요 처리에 실패했습니다.');
    }
  };

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

      {/* 좋아요 버튼 추가 */}
      <div className="mt-8 pt-4 border-t flex justify-center">
        <button
          onClick={handleLike}
          className="bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300"
        >
          ❤️ 좋아요 ({post.like})
        </button>
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