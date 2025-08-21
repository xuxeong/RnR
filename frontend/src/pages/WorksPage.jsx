// src/pages/WorksPage.jsx
// 작품 목록을 조회하고 표시하는 페이지 컴포넌트입니다.
import React, { useState, useEffect } from 'react';
import { getWorks, getWorkDetail, searchWorks } from '../api/works';
import { useAuth } from '../context/AuthContext'; // 로그아웃 기능을 위해 AuthContext 사용

export default function WorksPage() {
  const { logout } = useAuth(); // 로그아웃 함수 가져오기
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(''); // 'book', 'movie', ''

  // 작품 목록을 가져오는 함수
  const fetchWorks = async (type = '', query = '') => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (query) {
        data = await searchWorks(query, type); // 검색어가 있으면 검색 API 호출
      } else {
        data = await getWorks(type); // 없으면 전체 또는 타입별 목록 조회
      }
      setWorks(data);
    } catch (err) {
      setError('작품을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 작품 목록 로드
  useEffect(() => {
    fetchWorks();
  }, []);

  // 검색어 입력 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 검색 버튼 클릭 또는 Enter 키 입력 시 검색 실행
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorks(filterType, searchTerm);
  };

  // 필터 타입 변경 핸들러
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    fetchWorks(e.target.value, searchTerm); // 필터 변경 시 즉시 다시 불러오기
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-700">작품 로딩 중...</div>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className="text-center text-red-600 text-lg mt-8">
        {error}
        <button onClick={() => fetchWorks(filterType, searchTerm)} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">작품 둘러보기</h1>
      
      {/* 검색 및 필터링 UI */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-grow w-full sm:w-auto">
          <input
            type="text"
            placeholder="작품 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-r-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
          >
            검색
          </button>
        </form>
        
        <select
          value={filterType}
          onChange={handleFilterChange}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 w-full sm:w-auto"
        >
          <option value="">모든 작품</option>
          <option value="book">책</option>
          <option value="movie">영화</option>
        </select>
      </div>

      {/* 작품 목록 */}
      {works.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '아직 작품이 없습니다.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {works.map((work) => (
            <div key={work.work_id} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition duration-300">
              <img 
                src={work.cover_img || `https://placehold.co/200x300/e0e0e0/555555?text=${work.Type === 'book' ? '책' : '영화'}`} 
                alt={work.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 truncate mb-2">{work.name}</h3>
                <p className="text-sm text-gray-600">
                  {work.Type === 'book' ? '책' : '영화'}
                  {work.rating ? ` | 평점: ${work.rating.toFixed(1)}` : ''}
                </p>
                {/* 추가 정보 표시 (예: 작가/감독, 요약 등) */}
                {/* <p className="text-sm text-gray-500 mt-2 line-clamp-2">{work.ai_summary || '요약 정보가 없습니다.'}</p> */}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 로그아웃 버튼 (임시) */}
      <div className="text-center mt-10">
        <button
          onClick={logout}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition duration-200 shadow-md"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}