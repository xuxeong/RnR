// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
// updateProfile 함수를 임포트합니다.
import { getMyProfile, updateProfile } from '../api/auth'; 

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getMyProfile();
        setProfile(profileData);
      } catch (err) {
        setError("프로필 정보를 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };
  
  const handleSave = async () => {
    try {
      // updateProfile 함수를 호출하도록 수정
      const updatedProfile = await updateProfile({ 
          nickname: profile.nickname,
          bio: profile.bio,
      });
      setProfile(updatedProfile);
      setIsEditing(false);
      alert('프로필이 성공적으로 저장되었습니다.');
    } catch (error) {
      alert('프로필 업데이트에 실패했습니다.');
    }
  };
  
  if (isLoading) return <div className="text-center mt-10">프로필 정보를 불러오는 중...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">내 프로필</h1>
      
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">닉네임</label>
            <input 
              type="text" 
              id="nickname"
              name="nickname"
              value={profile.nickname || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">소개</label>
            <textarea
              id="bio"
              name="bio"
              rows="3"
              value={profile.bio || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="자신을 소개해보세요."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">저장</button>
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">닉네임</h2>
            <p className="text-lg text-gray-900">{profile.nickname}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">소개</h2>
            <p className="text-lg text-gray-900">{profile.bio || '아직 소개가 없습니다.'}</p>
          </div>
          <div className="text-right">
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">프로필 수정</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;