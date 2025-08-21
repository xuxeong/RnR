// src/pages/PostsPage.jsx
// 게시물 목록을 "포토 카드" 디자인으로 표시하는 페이지 컴포넌트입니다.
import React, { useState, useEffect } from 'react';
import { getPosts } from '../api/post'; // 가상의 posts API 함수 (백엔드에 구현 필요)

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('popular'); // 'popular', 'recent', 'feed'

  // 게시물 데이터를 가져오는 함수
  const fetchPosts = async (type) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: 백엔드 API에 따라 적절한 파라미터로 호출
      // 예: getPosts({ type: activeTab }) 또는 getPosts({ sort: type })
      const data = await getPosts(); // 현재는 모든 게시물 가져오는 것으로 가정
      setPosts(data);
    } catch (err) {
      setError('게시물을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab]); // 탭 변경 시 게시물 다시 불러오기

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
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-center mb-8">
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
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">아직 게시물이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
  );
}

