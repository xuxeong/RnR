import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostDetail, toggleLikePost, deletePost } from '../api/post';
import { getComments, createComment, deleteComment } from '../api/comment';
import { useAuth } from '../context/AuthContext';
import EditPostModal from '../components/EditPostModal/EditPostModal';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅
  const { user } = useAuth(); // 현재 로그인한 사용자 정보
  
  const [post, setPost] = useState(null);
   const [comments, setComments] = useState([]); 
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 수정 모달 상태
  
    const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      const [postData, commentsData] = await Promise.all([
        getPostDetail(postId),
        getComments(postId)
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      setError('게시물을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
    
    useEffect(() => {
    fetchPostAndComments();
  }, [postId]);

  // --- 게시물 삭제 핸들러 추가 ---
  const handlePostDelete = async () => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      try {
        await deletePost(post.post_id);
        alert('게시물이 삭제되었습니다.');
        navigate('/community'); // 삭제 후 커뮤니티 목록으로 이동
      } catch (error) {
        alert('게시물 삭제에 실패했습니다.');
      }
    }
  };

  // --- 댓글 삭제 핸들러 추가 ---
  const handleCommentDelete = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await deleteComment(commentId);
        // 화면에서 즉시 반영되도록 state에서 해당 댓글 제거
        setComments(comments.filter(comment => comment.comment_id !== commentId));
        alert('댓글이 삭제되었습니다.');
      } catch (error) {
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const createdComment = await createComment(postId, newComment);
      // 새 댓글을 기존 댓글 목록에 추가하여 즉시 반영
      setComments([...comments, createdComment]);
      setNewComment(""); // 입력창 비우기
    } catch (error) {
      alert('댓글 작성에 실패했습니다. 로그인했는지 확인해주세요.');
    }
  };

  // 수정된 게시물 정보를 받아 state를 업데이트하는 함수
  const handlePostUpdated = (updatedPost) => {
    setPost(updatedPost);
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
          {user && user.user_id === post.user_id && (
              <div className="flex space-x-2">
                {/* --- 수정 버튼 추가 --- */}
                <button onClick={() => setIsEditModalOpen(true)} className="text-sm text-blue-500 hover:underline">
                  수정
                </button>
                <button onClick={handlePostDelete} className="text-sm text-red-500 hover:underline">
                  삭제
                </button>
              </div>
            )}
      </div>
      
      {/* 게시물 본문 */}
      <div className="prose lg:prose-xl max-w-none">
        <p>{post.content}</p>
      </div>

      {/* 좋아요 버튼 추가 */}
      <div className="mt-8 pt-4 border-t flex justify-center">
        <button
          onClick={handleLike}
          className="bg-red-400 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300"
        >
          ❤️ 좋아요 ({post.like})
        </button>
      </div>

      {/* 댓글 영역 */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">댓글 ({comments.length})</h2>
        {/* 댓글 작성 폼 */}
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="3"
            placeholder="댓글을 입력하세요..."
          ></textarea>
          <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
            댓글 등록
          </button>
        </form>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.comment_id} className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center">
                <p className="font-semibold">{comment.user?.profiles?.[0]?.nickname || `User ${comment.user_id}`}</p>
                {/* --- 댓글 작성자일 경우에만 삭제 버튼 표시 --- */}
                {user && user.user_id === comment.user_id && (
                  <button onClick={() => handleCommentDelete(comment.comment_id)} className="text-xs text-red-500 hover:underline">
                    삭제
                  </button>
                )}
              </div>
              <p className="text-gray-700">{comment.context}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
      {/* --- 수정 모달 렌더링 --- */}
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={post}
        onPostUpdated={handlePostUpdated}
      />
    </div>
  );
}