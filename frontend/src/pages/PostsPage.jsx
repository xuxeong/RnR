// src/pages/PostsPage.jsx

import React, { useState, useEffect } from 'react';
import { getPosts } from '../api/post';
import CreatePostModal from '../components/CreatePostModal/CreatePostModal'; // 새로 만든 모달 임포트
import { useAuth } from '../context/AuthContext';

export default function PostsPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('popular');
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

  // 게시물 데이터를 가져오는 함수
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      setError('게시물을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  // 글이 성공적으로 생성되었을 때 호출될 함수
  const handlePostCreated = () => {
    // 글 목록을 다시 불러와서 새 글이 보이도록 합니다.
    fetchPosts();
  };

   if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-700">게시물 로딩 중...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-600 text-lg mt-8">
        {error}
        <button onClick={() => fetchPosts(activeTab)} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          다시 시도
        </button>
      </div>
    );
  }


  return (
    <>
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-8">
          {/* 탭 버튼 */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg ${activeTab === 'popular' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('popular')}
            >
              popular
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-200 ${activeTab === 'recent' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('recent')}
            >
              recent
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg ${activeTab === 'feed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('feed')}
            >
              feed
            </button>
          </div>

          {/* 로그인 상태일 때만 글쓰기 버튼을 보여줍니다. */}
          {isAuthenticated && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
            >
              글쓰기
            </button>
          )}
        </div>

        {/* 게시물 목록 */}
        {posts.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">아직 게시물이 없습니다. 첫 글을 작성해보세요!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* ... 게시물 카드 렌더링 부분은 그대로 ... */}
            {posts.map((post) => (
            <div key={post.post_id} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition duration-300">
              <img 
                src={post.img || `https://placehold.co/300x200/e0e0e0/555555?text=Post+Image`} 
                alt={post.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 truncate mb-2">{post.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                <div className="flex items-center justify-between text-gray-500 text-xs mt-3">
                  <span>{post.user_id}</span> {/* TODO: 사용자 닉네임으로 변경 */}
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* 모달 컴포넌트 렌더링 */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}
