// src/pages/PostsPage.jsx

import React, { useState, useEffect } from 'react';
import { getPosts } from '../api/post';
import CreatePostModal from '../components/CreatePostModal/CreatePostModal'; // 새로 만든 모달 임포트
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard/PostCard';

export default function PostsPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('lastTab') || 'recent');
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // 탭을 클릭할 때마다 localStorage에 'lastTab'으로 저장
    localStorage.setItem('lastTab', tab);
  };
  
  // 게시물 데이터를 가져오는 함수
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // activeTab 값을 sort라는 이름으로 명확하게 전달합니다.
      const data = await getPosts({ sort: activeTab });
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
              onClick={() => handleTabClick('popular')}
            >
              popular
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-200 ${activeTab === 'recent' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              onClick={() => handleTabClick('recent')}
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
         {posts.length === 0 && !loading ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-xl">아직 게시물이 없습니다.</p>
            <p className="mt-2">첫 글을 작성해보세요!</p>
          </div>
        ) : (
          // 게시물 목록을 PostCard를 이용해 그리드 형태로 표시
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <PostCard key={post.post_id} post={post} />
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
