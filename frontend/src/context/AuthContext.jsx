// src/context/AuthContext.jsx
// React Context를 사용하여 사용자 인증 상태를 전역적으로 관리합니다.
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as authLogin } from '../api/auth'; // auth.js에서 login 함수를 authLogin으로 별칭 지정
import { useNavigate } from 'react-router-dom';

// AuthContext 생성
const AuthContext = createContext(null);

// AuthProvider 컴포넌트: 인증 상태를 제공하고 관리합니다.
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 인증 상태
  const [user, setUser] = useState(null); // 사용자 정보
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 사용자 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await getCurrentUser(); // 현재 사용자 정보 가져오기
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('인증 실패:', error);
          localStorage.removeItem('accessToken'); // 유효하지 않은 토큰 삭제
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // 로그인 함수
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const data = await authLogin(username, password); // auth.js의 login 함수 호출
      localStorage.setItem('accessToken', data.access_token); // 토큰 저장
      const userData = await getCurrentUser(); // 로그인 후 사용자 정보 다시 가져오기
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('로그인 중 에러 발생:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error; // 에러를 다시 던져서 로그인 폼에서 처리할 수 있도록 함
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('accessToken'); // 토큰 삭제
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 훅: 다른 컴포넌트에서 인증 컨텍스트에 쉽게 접근할 수 있도록 합니다.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
};