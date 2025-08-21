// src/components/Header/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logoImage from '@/assets/logo.svg';

function Header({ isLoggedIn, onLoginClick, onSignupClick, onLogout }) {
  // 1. 드롭다운 메뉴가 열렸는지 관리하는 state
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  
  // 2. 드롭다운 DOM 요소에 접근하기 위한 ref
  const dropdownRef = useRef(null);

  // 3. 드롭다운 메뉴 바깥을 클릭하면 메뉴가 닫히도록 하는 로직
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    // 이벤트 리스너 등록
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // 컴포넌트가 사라질 때 이벤트 리스너 제거
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <header className="main-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src={logoImage} alt="RNR Logo" />
        </Link>
        <nav className="nav-links">
          {isLoggedIn ? (
            // === 로그인 되었을 때 보여줄 UI ===
            <>
              <Link to="/works">Works</Link>
              <Link to="/recommend">Recommend</Link>
              <Link to="/community">Community</Link>
              <div className="profile-menu" ref={dropdownRef}>
                <button 
                  className="profile-icon" 
                  onClick={() => setDropdownOpen(!isDropdownOpen)} // 클릭 시 드롭다운 상태를 토글
                />
                
                {/* isDropdownOpen이 true일 때만 드롭다운 메뉴를 보여줌 */}
                {isDropdownOpen && (
                  <ul className="dropdown-menu">
                    <li><Link to="/my-feed">MY FEED</Link></li>
                    <li><Link to="/likes">LIKES</Link></li>
                    <li><Link to="/settings">SETTINGS</Link></li>
                    <li><button onClick={onLogout} className="logout-button">LOGOUT</button></li>
                  </ul>
                )}
              </div>
            </>
          ) : (
            // === 로그아웃 상태일 때 보여줄 UI ===
            <>
              <button onClick={onLoginClick} className="auth-link">LOGIN</button>
              <button onClick={onSignupClick} className="auth-link">SIGNUP</button>
              <Link to="/works">Works</Link>
              <Link to="/recommend">Recommend</Link>
              <Link to="/community">Community</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;