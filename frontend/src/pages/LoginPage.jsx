// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { register, getGoogleLoginUrl } from '../api/auth';

export default function LoginPage({ isOpen, onClose, initialMode = 'login' }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(''); //비밀번호 확인 상태 변수
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [loginId, setLoginId] = useState('');
  const [isRegistering, setIsRegistering] = useState(initialMode === 'register');
  const { login } = useAuth();

  useEffect(() => {
  if (isOpen) {
    setIsRegistering(initialMode === 'register');
  }
}, [initialMode, isOpen]);
  
  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      onClose();
    } catch (error) {
      alert('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if(password !== confirm){
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const userData = {
        email,
        pw: password,
        name,
        birth: birth || '2000-01-01',
        provider: 'local',
        login_id: loginId,
      };
      await register(userData);
      alert('회원가입 성공! 이제 로그인해주세요.');
      setIsRegistering(false); // 로그인 폼으로 전환
      // 입력 필드 초기화
      setEmail('');
      setPassword('');
      setConfirm('');
      setName('');
      setBirth('');
      setLoginId('');
    } catch (error) {
      alert(`회원가입 실패: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const googleLoginUrl = await getGoogleLoginUrl();
      window.location.href = googleLoginUrl;
    } catch (error) {
      alert('Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-lightPink p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        {/* 로그인 뷰 */}
        {!isRegistering ? (
          <>
            <h2 className="text-3xl font-julius font-bold text-center text-browny mb-8">WELCOME!!</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="이메일 또는 로그인 ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-pink w-full p-3 rounded-full focus:ring-light-500"
                required
              />
              <input
                type="password"
                placeholder="PW"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-pink w-full p-3 rounded-full focus:ring-light-500"
                required
              />
              <button
                type="submit"
                className="bg-pinkBrown w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-pinkBrown-700"
              >
                login
              </button>
            </form>
            
            <p className="text-browny my-4 text-center">소셜계정으로 로그인</p>
            <div className="flex justify-center space-x-4">
              <button onClick={handleGoogleLogin} className="w-12 h-12 flex items-center justify-center rounded-full bg-light hover:bg-gray-300">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6"/>
              </button>
              {/* 다른 소셜 로그인 버튼 추가 공간 */}
            </div>

            <p className="text-center text-brown mt-6">
              계정이 없으신가요?
              <button
                onClick={() => setIsRegistering(true)}
                className="text-pinkBrown ml-2 hover:underline"
              >
                회원가입
              </button>
            </p>
          </>
        ) : (
          /* 회원가입 뷰 */
          <>
            <h2 className="text-3xl font-julius font-bold text-center text-browny mb-8">welcome!!</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-pink w-full p-3 rounded-full focus:ring-light-500"
                required
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-pink w-full p-3 rounded-full focus:ring-light-500"
                required
              />
              <input
                type="password"
                placeholder="비밀번호확인"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="bg-pink w-full p-3 rounded-full focus:ring-light-500"
                required
              />
              <input
                type="text"
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-pink w-full p-3 rounded-full focus:ring-light-500"
                required
              />
              <input
                type="date"
                placeholder="생년월일"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                className="bg-pink w-full p-3 rounded-full focus:ring-light-500"
                required
              />
              <input
                type="text"
                placeholder="로그인 ID (선택 사항)"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="bg-pink w-full p-3 rounded-full focus:ring-light-500"
              />
              <button
                type="submit"
                className="bg-pinkBrown w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-pinkBrown-700"
              >
                가입
              </button>
            </form>

            <p className="text-center text-brown mt-6">
              이미 계정이 있으신가요?
              <button
                onClick={() => setIsRegistering(false)}
                className="text-pinkBrown ml-2 hover:underline"
              >
                로그인
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}