// src/pages/WorksPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getWorks, searchWorks } from '../api/works';
import StarRating from '../components/StarRating/StarRating';
import { createOrUpdateRating } from '../api/ratings';

export default function WorksPage() {
  const [works, setWorks] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const PAGE_SIZE = 20;

  const fetchWorks = useCallback(async (currentType, currentQuery, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const skip = currentPage * PAGE_SIZE;
      let data;
      
      // 검색어가 있으면 searchWorks, 없으면 getWorks 호출
      if (currentQuery) {
        data = await searchWorks(currentQuery, currentType, skip, PAGE_SIZE);
      } else {
        data = await getWorks(currentType, skip, PAGE_SIZE);
      }

      setWorks(prevWorks => (currentPage === 0 ? data : [...prevWorks, ...data]));
      
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setPage(currentPage);

    } catch (err) {
      setError('작품을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // useCallback의 의존성 배열은 비워둡니다.

  // 컴포넌트가 처음 마운트될 때만 데이터를 불러옵니다.
  useEffect(() => {
    fetchWorks(filterType, searchTerm, 0);
  }, []);

  // 검색 버튼 클릭 시, 페이지를 0으로 초기화하고 검색합니다.
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorks(filterType, searchTerm, 0);
  };

  // 필터 변경 시, 페이지를 0으로 초기화하고 다시 불러옵니다.
  const handleFilterChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);
    fetchWorks(newType, searchTerm, 0);
  };

  // '더 보기' 버튼 클릭 시, 다음 페이지를 불러옵니다.
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchWorks(filterType, searchTerm, page + 1);
    }
  };
  
  const handleRatingSubmitted = async (workId, rating) => {
    try {
      await createOrUpdateRating(workId, rating);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('평점을 매기려면 로그인이 필요합니다.');
      } else {
        alert('평점 등록에 실패했습니다. 다시 시도해주세요.');
      }
      throw error;
    }
  };

  // 이하 JSX 렌더링 부분은 이전과 동일합니다.
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">작품 둘러보기</h1>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-grow w-full sm:w-auto">
          <input
            type="text"
            placeholder="작품 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-l-lg"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-r-lg font-semibold">
            검색
          </button>
        </form>
        <select value={filterType} onChange={handleFilterChange} className="p-3 border border-gray-300 rounded-lg w-full sm:w-auto">
          <option value="">모든 작품</option>
          <option value="book">책</option>
          <option value="movie">영화</option>
        </select>
      </div>

      {works.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {works.map((work) => (
            <div key={`${work.work_id}-${work.name}`} className="bg-white border rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition duration-300">
              <img 
                src={work.cover_img || `https://placehold.co/200x300/e0e0e0/555555?text=${work.Type === 'book' ? '책' : '영화'}`} 
                alt={work.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold truncate mb-2">{work.name}</h3>
                <p className="text-sm text-gray-600">
                  {work.Type === 'book' ? '책' : '영화'}
                </p>
                <StarRating workId={work.work_id} onRatingSubmitted={handleRatingSubmitted} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        {loading && <p>로딩 중...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && works.length === 0 && <p>표시할 작품이 없습니다.</p>}
        {hasMore && !loading && works.length > 0 && (
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-pinkBrown text-white rounded-lg font-semibold hover:bg-gray-700"
          >
            더 보기
          </button>
        )}
      </div>
    </div>
  );
}