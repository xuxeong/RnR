import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '../api/user';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getMyProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("프로필 정보를 불러오는 데 실패했습니다.", error);
      }
    };
    fetchProfile();
  }, []);
  
  const handleSave = async () => {
    try {
      await updateMyProfile(profile);
      setIsEditing(false);
      alert('프로필이 저장되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 실패', error);
    }
  };
  
  if (!profile) return <div>프로필 정보를 불러오는 중...</div>;

  return (
    <div>
      <h1>내 프로필</h1>
      {isEditing ? (
        <div>
          <input 
            type="text" 
            value={profile.nickname}
            onChange={e => setProfile({...profile, nickname: e.target.value})}
          />
          {/* 다른 프로필 필드들... */}
          <button onClick={handleSave}>저장</button>
          <button onClick={() => setIsEditing(false)}>취소</button>
        </div>
      ) : (
        <div>
          <p>닉네임: {profile.nickname}</p>
          {/* 다른 프로필 정보 표시... */}
          <button onClick={() => setIsEditing(true)}>프로필 수정</button>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;