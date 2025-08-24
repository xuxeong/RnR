import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWorkDetail } from '../api/works';
import { getPostsForWork } from '../api/post';
import { generateWorkSummary } from '../api/ai'; // 새로 만든 API 함수 임포트
import PostCard from '../components/PostCard/PostCard';

export default function WorkDetailPage() {
  const { workId } = useParams();
  const [work, setWork] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 작품 정보와 리뷰 목록을 함께 불러옵니다.
        const [workData, reviewsData] = await Promise.all([
          getWorkDetail(workId),
          getPostsForWork(workId)
        ]);
        setWork(workData);
        setReviews(reviewsData);

        // AI 요약 생성 로직
        if (workData && (!workData.ai_summary || workData.ai_summary === 'NaN')) {
          setIsSummaryLoading(true);
          try {
            const newSummaryData = await generateWorkSummary(workId);
            setWork(prevWork => ({ ...prevWork, ai_summary: newSummaryData.ai_summary }));
          } catch (summaryError) {
            console.error("AI 요약 생성 중 에러 발생:", summaryError);
            // 요약 생성에 실패하더라도 기존 작품 정보는 보여주기 위해 에러 메시지는 따로 표시하지 않음
          } finally {
            setIsSummaryLoading(false);
          }
        }
      } catch (err) {
        setError('정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workId]);

  if (loading && !work) return <div className="text-center p-10">작품 정보를 불러오는 중...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!work) return null;

  const creatorLabel = work.Type === 'book' ? '저자' : '감독';
  const creatorName = work.Type === 'book' ? work.author : work.director;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden md:flex">
        <img 
          src={work.cover_img || `https://placehold.co/400x600/e0e0e0/555555?text=${work.name}`} 
          alt={work.name}
          className="w-full md:w-1/3 object-cover"
        />
        <div className="p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {work.genres.map(genre => (
                <span key={genre.genre_id} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                  {genre.label}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold text-gray-900">{work.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{creatorLabel}: {creatorName}</p>
            <p className="text-md text-gray-500">출시일: {work.created_at}</p>
            {work.rating && <p className="text-md text-yellow-500 font-semibold">평균 평점: {work.rating.toFixed(1)}</p>}
          </div>
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-800">AI 요약</h2>
              {isSummaryLoading ? (
            // 로딩 중일 때: 회색 박스 + 깜빡임(pulse) 애니메이션
            <div className="mt-2 p-4 bg-pink rounded-lg animate-pulse">
                <div className="h-4 bg-lightpink rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-lightpink rounded w-full mb-2"></div>
                <div className="h-4 bg-lightpink rounded w-5/6"></div>
            </div>
            ) : (
            // 로딩 완료 후: 실제 요약 내용 표시
            <p className="text-gray-700 mt-2">
                {work.ai_summary && work.ai_summary !== 'NaN' 
                ? work.ai_summary 
                : "AI 요약 정보가 없습니다."}
            </p>
            )}
            </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold">관련 리뷰</h2>
          {reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {reviews.map(review => (
              <PostCard key={review.post_id} post={review} />
            ))}
          </div>
        ) : (
          <div className="mt-4 p-6 bg-gray-100 rounded-lg">
            <p>아직 작성된 리뷰가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}