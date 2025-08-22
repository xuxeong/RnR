// src/pages/AccountSettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../api/auth'; // 현재 사용자 정보(이름, 이메일 등)를 가져오는 API
// import { updateUser } from '../api/user'; // 사용자 정보를 업데이트하는 API (api/auth.js에 만들어야 함)

export default function AccountSettingsPage() {
  const [user, setUser] = useState({ name: '', phone: '' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser({ name: userData.name, phone: userData.phone || '' });
        setLoading(false);
      } catch (error) {
        console.error("사용자 정보 로딩 실패:", error);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    // TODO: 이름, 전화번호 업데이트 API 호출
    alert('사용자 정보가 저장되었습니다. (API 연동 필요)');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // TODO: 비밀번호 변경 API 호출
    if (password.new !== password.confirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    alert('비밀번호가 변경되었습니다. (API 연동 필요)');
  };
  
  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">
      {/* 이름 및 연락처 변경 폼 */}
      <form onSubmit={handleUserSubmit}>
        <h2 className="text-2xl font-bold">계정 정보</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
            <input type="text" name="name" id="name" value={user.name} onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">연락처</label>
            <input type="tel" name="phone" id="phone" value={user.phone} onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </div>
        <div className="text-right mt-4">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">정보 저장</button>
        </div>
      </form>
      
      <hr />

      {/* 비밀번호 변경 폼 */}
      <form onSubmit={handlePasswordSubmit}>
        <h2 className="text-2xl font-bold">비밀번호 변경</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="current" className="block text-sm font-medium text-gray-700">현재 비밀번호</label>
            <input type="password" name="current" id="current" value={password.current} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="new" className="block text-sm font-medium text-gray-700">새 비밀번호</label>
            <input type="password" name="new" id="new" value={password.new} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
            <input type="password" name="confirm" id="confirm" value={password.confirm} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </div>
        <div className="text-right mt-4">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">비밀번호 변경</button>
        </div>
      </form>
    </div>
  );
}