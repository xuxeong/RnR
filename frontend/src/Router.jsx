// src/Router.jsx

import React from 'react';
// 'react-router-dom' 임포트 구문의 오타를 수정했습니다.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App';
import ProfilePage from './pages/ProfilePage';
import WorksPage from './pages/WorksPage';
import WorkDetailPage from './pages/WorkDetailPage';
import PostsPage from './pages/PostsPage'; // 메인 페이지로 사용할 컴포넌트
import PostDetailPage from './pages/PostDetailPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import RecommendPage from './pages/RecommendPage';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* '/auth/callback' 경로를 새로 추가합니다. 이 경로는 App의 레이아웃(헤더/푸터)이 필요 없습니다. */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* App 컴포넌트가 모든 페이지의 기본 레이아웃(헤더, 푸터)을 담당하게 합니다. */}
        <Route path="/" element={<App />}>
          {/* '/' 경로로 접속하면 기본으로 PostsPage를 보여줍니다. */}
          <Route path="community" element={<PostsPage />} />
          <Route path="posts/:postId" element={<PostDetailPage />} />
          
          {/* '/profile' 경로로 접속하면 ProfilePage를 보여줍니다. */}
          <Route path="profile" element={<ProfilePage />} />

          {/* '/works' 경로로 접속하면 WorksPage를 보여줍니다. */}
          <Route path="works" element={<WorksPage />} />
          <Route path="works/:workId" element={<WorkDetailPage />} />

          {/* 계정 설정 페이지 경로 추가 */}
          <Route path="settings/account" element={<AccountSettingsPage />} />
          
          {/* Recommend 페이지 경로 추가 */}
          <Route path="recommend" element={<RecommendPage />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}