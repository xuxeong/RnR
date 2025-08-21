// src/components/Header.jsx
// 애플리케이션의 상단 헤더 컴포넌트입니다.
import React, { useState } from 'react'; // useState 임포트 추가
import { useAuth } from '../../context/AuthContext.jsx'; // 로그아웃 기능을 위해 AuthContext 사용
import { Link } from 'react-router-dom'; // <a> 태그 대신 Link를 사용합니다.

export default function Header({ onLoginClick }) { // onLoginClick 프롭스 추가
  const { user, logout } = useAuth(); // 현재 로그인된 사용자 정보와 로그아웃 함수 가져오기
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 메뉴 상태

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoutClick = () => {
    logout();
    setIsDropdownOpen(false); // 로그아웃 후 드롭다운 닫기
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* 로고를 클릭하면 홈('/')으로 갑니다. */}
        <h1 className="text-3xl font-extrabold tracking-tight">
          <Link to="/" className="hover:text-blue-200">R&R</Link>
        </h1>
        <nav className="flex items-center space-x-6">
          {/* Works 메뉴를 클릭하면 '/works'로 갑니다. */}
          {/* 주요 메뉴 링크 */}          
          <Link to="/works" className="text-lg font-medium hover:text-blue-200">Works</Link>
          <Link to="/Recommend" className="text-lg font-medium hover:text-blue-200 transition duration-200">Recommend</Link>
          <Link to="/Community" className="text-lg font-medium hover:text-blue-200 transition duration-200">Community</Link>
         
          {user ? (
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">MY FEED</Link> #바꿔야됨
                  <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">LIKES</Link> # 바꿔야됨
                  <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">SETTINGS</Link>
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition duration-200 shadow-md"
              >
                LOGIN
              </button>
              <button
                onClick={() => { /* SIGNUP 모달 열기 또는 페이지 이동 */ }}
                className="px-4 py-2 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 transition duration-200 shadow-md"
              >
                SIGNUP
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}