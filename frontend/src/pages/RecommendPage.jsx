import React, { useState, useEffect } from 'react';
import { getRecommendedWorks, getSimilarUsers } from '../api/recommend';
// PostCard를 재활용하여 작품을 표시합니다.
import PostCard from '../components/PostCard/PostCard'; 

export default function RecommendPage() {
  const [works, setWorks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // 두 API를 동시에 호출하여 더 빠르게 데이터를 가져옵니다.
        const [worksData, usersData] = await Promise.all([
          getRecommendedWorks(),
          getSimilarUsers()
        ]);
        setWorks(worksData);
        setUsers(usersData);
      } catch (err) {
        setError('추천 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return <div className="text-center p-10">추천 정보를 불러오는 중...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      {/* 나를 위한 맞춤 추천 작품 */}
      <section>
        <h2 className="text-3xl font-bold mb-6">회원님을 위한 맞춤 추천 작품</h2>
        {works.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {works.map(work => (
              // PostCard와 형식이 비슷하므로, work 객체를 post처럼 전달해 재활용
              <PostCard key={work.work_id} post={{ title: work.name, user_id: work.Type, img: work.cover_img }} />
            ))}
          </div>
        ) : (
          <p>추천할 작품이 아직 없습니다. 작품에 평점을 남겨주세요!</p>
        )}
      </section>

      <hr className="my-12" />

      {/* 나와 비슷한 취향의 사용자 */}
      <section>
        <h2 className="text-3xl font-bold mb-6">나와 비슷한 취향의 사용자</h2>
        {users.length > 0 ? (
          <div className="flex space-x-6 overflow-x-auto p-4">
            {users.map(user => (
              <div key={user.target_id} className="flex-shrink-0 w-40 text-center">
                <div className="w-24 h-24 mx-auto bg-blue-200 rounded-full flex items-center justify-center text-3xl font-bold">
                  {user.name[0]}
                </div>
                <p className="mt-2 font-semibold">{user.profile?.nickname || user.name}</p>
                <p className="text-sm text-gray-500">유사도: {(user.score * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        ) : (
          <p>비슷한 사용자를 찾을 수 없습니다.</p>
        )}
      </section>
    </div>
  );
}