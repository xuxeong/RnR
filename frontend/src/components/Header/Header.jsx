// src/components/Header.jsx
// 애플리케이션의 상단 헤더 컴포넌트입니다.
import React, { useState } from 'react'; // useState 임포트 추가
import { useAuth } from '../../context/AuthContext.jsx'; // 로그아웃 기능을 위해 AuthContext 사용
import { Link } from 'react-router-dom'; // <a> 태그 대신 Link를 사용합니다.

import logo from '../../assets/logo.svg'

export default function Header({ onLoginClick}) { // onLoginClick 프롭스 추가
  const { user, logout } = useAuth(); // 현재 로그인된 사용자 정보와 로그아웃 함수 가져오기
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 메뉴 상태

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoutClick = () => {
    logout();
    setIsDropdownOpen(false); // 로그아웃 후 드롭다운 닫기
  };

  // 로그인 텍스트 변수
  const loginElement = (
    <button onClick={() => onLoginClick('login')}
                className="font-julius text-brown text-xl px-4 py-2 hover:text-blue-200 transition duration-200">Login</button>
  );

  // 회원가입 텍스트 변수
  const signupElement = (
    <button onClick={() => onLoginClick('register')}
                className="font-julius text-lightBrown text-xl px-4 py-2 hover:text-blue-200 transition duration-200">Signup</button>
  );

  return (
    <header className="text-white p-4 shadow-lg border-black border-t border-b">
      <div className="container mx-auto flex justify-between items-center">
        {/* 로고를 클릭하면 홈('/')으로 갑니다. */}
        <h1 className="text-3xl font-extrabold tracking-tight">
          <Link to="/" className="hover:text-blue-200"><img src={logo} width="150" height="150"/></Link>
        </h1>
        <nav className="flex items-center space-x-6">
          {/* Works 메뉴를 클릭하면 '/works'로 갑니다. */}
          {/* 주요 메뉴 링크 */}
          {!user && loginElement}          
          {!user && signupElement}
          <Link to="/works" className="text-black font-junge text-xl px-4 font-medium hover:text-blue-200">Works</Link>
          <Link to="/Recommend" className="text-black font-junge text-xl px-4 font-medium hover:text-blue-200 transition duration-200">Recommend</Link>
          <Link to="/Community" className="text-black font-junge text-xl px-4 font-medium hover:text-blue-200 transition duration-200">Community</Link>
         
          {user && (
            <div className="relative">
              {/* 프로필 아이콘 (원형) */}
              <button
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
              </button>

              {/* 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <div className="bg-gray absolute right-0 mt-2 w-40 bg-white shadow-lg py-1 z-10">
                  <Link to="/myFeed" className="text-lightBrown font-julius block px-4 py-2 text-center hover:bg-gray-100">MY FEED</Link>
                  <Link to="/likes" className="text-lightBrown font-julius block px-4 py-2 text-center hover:bg-gray-100">LIKES</Link>
                  <Link to="/profile" className="text-lightBrown font-julius block px-4 py-2 text-center hover:bg-gray-100">SETTINGS</Link>
                  <button
                    onClick={handleLogoutClick}
                    className="text-center block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}