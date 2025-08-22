// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { register, getGoogleLoginUrl } from '../api/auth';

export default function LoginPage({ isOpen, onClose }) {
  //const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [loginId, setLoginId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth();

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
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        {/* 로그인 뷰 */}
        {!isRegistering ? (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">WELCOME!!</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="이메일 또는 로그인 ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                placeholder="PW"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                login
              </button>
            </form>
            
            <p className="text-gray-500 my-4 text-center">소셜계정으로 회원가입</p>
            <div className="flex justify-center space-x-4">
              <button onClick={handleGoogleLogin} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6"/>
              </button>
              {/* 다른 소셜 로그인 버튼 추가 공간 */}
            </div>

            <p className="text-center text-gray-600 mt-6">
              계정이 없으신가요?
              <button
                onClick={() => setIsRegistering(true)}
                className="text-blue-600 font-semibold ml-2 hover:underline"
              >
                회원가입
              </button>
            </p>
          </>
        ) : (
          /* 회원가입 뷰 */
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">회원가입</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="date"
                placeholder="생년월일"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="로그인 ID (선택 사항)"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                가입
              </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
              이미 계정이 있으신가요?
              <button
                onClick={() => setIsRegistering(false)}
                className="text-blue-600 font-semibold ml-2 hover:underline"
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