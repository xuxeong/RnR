// src/pages/AccountSettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUser } from '../api/auth'; // 현재 사용자 정보(이름, 이메일 등)를 가져오고 업데이트하는 API

export default function AccountSettingsPage() {
  const [user, setUser] = useState({ name: '', phone: '' , login_id: ''});
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); //사용자에게 피드백을 주기 위한 state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser({ 
          name: userData.name, 
          phone: userData.phone || '', 
          login_id: userData.login_id || ''});
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

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // 메시지 초기화
    try {
      // API에 보낼 데이터를 updateData 객체로 만듭니다.
      const updateData = {
        login_id: user.login_id, // user.loginId -> user.login_id 로 수정
        name: user.name,
        phone: user.phone,
      };
      // updateUser를 한 번만 호출합니다.
      await updateUser(updateData);
      setMessage('✅ 정보가 성공적으로 저장되었습니다.');
    } catch (error) {
      setMessage('❌ 저장에 실패했습니다. 다시 시도해주세요.');
      console.error(error); // 콘솔에서 실제 에러 확인을 위해 추가
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
        setMessage('');
        if (password.new !== password.confirm) {
            setMessage('❌ 새 비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            // --- 이 부분을 수정했습니다 ---
            // 백엔드 스키마에 맞게 필드 이름을 current_pw, new_pw로 변경
            const updateData = { 
                current_pw: password.current,
                new_pw: password.new 
            };
            await updateUser(updateData);
            setMessage('✅ 비밀번호가 성공적으로 변경되었습니다.');
            setPassword({ current: '', new: '', confirm: '' });
        } catch (error) {
            // 백엔드에서 보낸 에러 메시지를 표시
            setMessage(`❌ ${error.response?.data?.detail || '비밀번호 변경에 실패했습니다.'}`);
        }
    };
  
  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">
      {/* 연락처, 로그인ID 변경 폼 */}
      <form onSubmit={handleUserSubmit}>
        <h2 className="text-2xl font-bold">계정 정보</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="login_id" className="block text-sm font-medium text-gray-700">로그인 아이디</label>
            <input type="text" name="login_id" id="login_id" value={user.login_id} onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
            <input type="text" name="name" id="name" value={user.name} disabled readonly onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">연락처</label>
            <input type="tel" name="phone" id="phone" value={user.phone} onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </div>
        <div className="text-right mt-4">
          <button type="submit" className="px-4 py-2 bg-pinkBrown text-white rounded-md hover:bg-pink">정보 저장</button>
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
          <button type="submit" className="px-4 py-2 bg-pinkBrown text-white rounded-md hover:bg-pink">비밀번호 변경</button>
        </div>
      </form>
      {/* 성공/실패 메시지를 보여줄 영역 추가 */}
      {message && <p className="text-center font-semibold">{message}</p>}
    </div>
  );
}