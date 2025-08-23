// src/components/CreatePostModal/CreatePostModal.jsx

import React, { useState, useEffect } from 'react';
import { createPost } from '../../api/post'; // 게시물 생성 API 함수
import { searchWorks } from '../../api/works'; //작품 검색 API
import { getGenres } from '../../api/genres'; // 새로 만든 장르 API 함수

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  // 폼 기본 정보 state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [error, setError] = useState(null);
  
  // 작품 검색 관련 state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null); // 선택된 작품 정보 (work_id, genre_id 포함)
  
  // 장르 목록을 저장할 새로운 state
  const [genres, setGenres] = useState([]); 
  const [genreId, setGenreId] = useState(''); // 초기값은 비워둡니다.
  
  // --- 추가된 useEffect: 모달이 열릴 때 커뮤니티 장르를 불러옵니다 ---
  useEffect(() => {
    if (isOpen && postType === 'general') {
      const fetchCommunityGenres = async () => {
        try {
          const genreData = await getGenres({ genre_type: 'community' });
          setGenres(genreData);
          if (genreData.length > 0) {
            setGenreId(genreData[0].genre_id);
          }
        } catch (err) {
          console.error("커뮤니티 장르 목록을 불러오는 데 실패했습니다.", err);
        }
      };
      fetchCommunityGenres();
    }
  }, [isOpen, postType]);

  // 컴포넌트가 닫힐 때 모든 state를 초기화하는 함수
  const resetState = () => {
    setTitle('');
    setContent('');
    setPostType('general');
    setError(null);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedWork(null);
    setGenres([]); // 장르 목록도 초기화
    setGenreId(''); // 장르 선택도 초기화
  };

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  // 작품검색 useEffect. 검색어 입력이 멈춘 후 0.5초 뒤에 검색 API를 호출 (Debounce)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchWorks(searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error("작품 검색 실패:", err);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (postType === 'review' && !selectedWork) {
      setError('리뷰할 작품을 선택해주세요.');
      return;
    }
    // --- 추가: 선택된 작품에 장르 정보가 있는지 확인 ---
    if (postType === 'review' && (!selectedWork.genres || selectedWork.genres.length === 0)) {
        setError('선택된 작품에 장르 정보가 없어 리뷰를 작성할 수 없습니다.');
        return;
    }
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const postData = {
        title,
        content,
        post_type: postType,
        // --- 이 부분을 수정합니다 ---
        // selectedWork.genre_id -> selectedWork.genres[0].genre_id
        genre_id: postType === 'review' ? selectedWork.genres[0].genre_id : parseInt(genreId),
        work_id: postType === 'review' ? selectedWork.work_id : null,
      };
      
      await createPost(postData);
      alert('게시물이 성공적으로 등록되었습니다.');
      handleClose(); 
      onPostCreated();

    } catch (err) {
      setError('게시물 등록에 실패했습니다. 다시 시도해주세요.');
      console.error(err);
    }
  };

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  } 

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">새 게시물 작성</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 글 종류 선택 */}
          <div>
            <label htmlFor="postType" className="block text-sm font-medium text-gray-700">종류</label>
            <select
              id="postType"
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="general">일반글</option>
              <option value="review">리뷰</option>
            </select>
          </div>
          {/* '리뷰' 선택 시 작품 검색 UI 표시 */}
          {postType === 'review' && (
            <div>
              <label htmlFor="workSearch" className="block text-sm font-medium text-gray-700">작품 검색</label>
              <input
                type="text"
                id="workSearch"
                value={selectedWork ? selectedWork.name : searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedWork(null); // 검색어를 바꾸면 선택된 작품 초기화
                }}
                className="mt-1 block w-full ..."
                placeholder="책 또는 영화 제목을 입력하세요"
              />
              {/* 검색 결과 표시 */}
              {searchResults.length > 0 && !selectedWork && (
                <ul className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {searchResults.map(work => (
                    <li
                      key={work.work_id}
                      onClick={() => {
                        setSelectedWork(work); // 작품 선택
                        setSearchResults([]); // 검색 결과 목록 숨기기
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {work.name} ({work.Type === 'book' ? '책' : '영화'})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/* '일반글' 선택 시 장르 선택 UI 표시 */}
          {postType === 'general' && (
            <div>
              <label htmlFor="genreSelect" className="block text-sm font-medium text-gray-700">장르</label>
              <select id="genreSelect" value={genreId} onChange={(e) => setGenreId(e.target.value)} className="mt-1 block w-full ..." 
              // 장르 목록이 비어있으면 비활성화
              disabled={genres.length === 0}
              >
                {/* g.id -> g.genre_id 로, g.label을 사용하도록 변경 */}
                {genres.length > 0 ? (
                  genres.map(g => (
                    <option key={g.genre_id} value={g.genre_id}>
                      {g.label}
                    </option>
                  ))
                ) : (
                  <option>불러오는 중...</option>
                )}
              </select>
            </div>
          )}
          {/* 제목 및 내용 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">내용</label>
            <textarea
              id="content"
              rows="8"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
              required
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}