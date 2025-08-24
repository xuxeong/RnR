import React, { useState, useEffect } from 'react';
import { getRecommendedWorks, getSimilarUsers } from '../api/recommend';
import { toggleFollowUser } from '../api/follow';
import WorkCard from '../components/WorkCard/WorkCard';

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

  // 팔로우 버튼 클릭 핸들러
  const handleFollow = async (userId) => {
    try {
      // API로부터 최신 팔로우 상태를 받아옵니다.
      const { is_followed } = await toggleFollowUser(userId);
      // 받은 최신 상태로 화면을 업데이트합니다.
      setUsers(users.map(user => 
        user.target_id === userId 
          ? { ...user, is_followed: is_followed }
          : user
      ));
    } catch (error) {
      alert('팔로우 처리에 실패했습니다.');
    }
  };

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
              <WorkCard key={work.work_id} work={work} />
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
                {/* --- 팔로우 버튼 추가 --- */}
                <button 
                  onClick={() => handleFollow(user.target_id)}
                  className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600"
                >
                  {user.is_followed ? 'Unfollow' : 'Follow'}
                </button>
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