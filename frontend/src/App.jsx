import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WorksPage from './pages/WorksPage.jsx';
import LoginModal from './components/modal/LoginModal.jsx';
import SignupModal from './components/modal/SignupModal.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setSignupModalOpen] = useState(false);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('accessToken', token); // 토큰 저장
    setIsLoggedIn(true);
    setLoginModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // 토큰 삭제
    setIsLoggedIn(false);
    // 필요하다면 홈페이지로 리디렉션
  };

  return (
    <BrowserRouter>
      <Header 
        isLoggedIn={isLoggedIn} 
        onLoginClick={() => setLoginModalOpen(true)}
        onSignupClick={() => setSignupModalOpen(true)}
        onLogout={handleLogout}
      />

      <main style={{ paddingTop: '80px' }}> {/* 헤더 높이만큼 패딩 */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/works" element={<WorksPage />} />
        </Routes>
      </main>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setSignupModalOpen(false)} 
      />
    </BrowserRouter>
  );
}

export default App;