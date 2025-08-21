// src/App.jsx
// 이 파일은 애플리케이션의 메인 엔트리 포인트이며,
// 라우팅 및 전역 컨텍스트를 설정합니다.
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage.jsx'; // LoginPage는 이제 모달 컴포넌트
import PostsPage from './pages/PostsPage.jsx'; // 게시물 목록을 보여줄 PostsPage 추가
import Header from './components/Header/Header.jsx';
import Footer from './components/Footer/Footer.jsx';
import { Outlet } from 'react-router-dom'; // Outlet을 임포트합니다.

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 로그인 모달 상태

  // 인증 상태 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">로딩 중...</div>
      </div>
    );
  }

  // 로그인하지 않았을 때의 화면: 인증되지 않았다면 로그인 모달을 띄울 수 있는 헤더와 기본 콘텐츠를 보여줍니다.
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header onLoginClick={() => setIsLoginModalOpen(true)} />
        <main className="flex-grow container mx-auto p-4">
          {/* Outlet을 사용해서, 로그인하지 않은 상태에서도 자식 라우트가 있다면 보여줄 수 있습니다. */}
          {/* 현재 설정상으로는 특별히 보이는 것 없이 아래 문구가 기본입니다. */}
          <Outlet />
          <p className="text-gray-600 text-lg text-center mt-10">로그인하여 서비스를 이용해주세요.</p>
        </main>
        <Footer />
        <LoginPage isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  // 로그인했을 때의 화면: 인증되었다면 헤더, 게시물 페이지, 푸터를 보여줍니다.
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        {/* 이 위치에 주소에 맞는 페이지(PostsPage, ProfilePage 등)가 렌더링됩니다. */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// App 컴포넌트는 AuthProvider로 전체 앱을 감싸서 인증 컨텍스트를 제공합니다.
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}