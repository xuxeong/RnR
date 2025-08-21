// src/pages/AuthCallbackPage.jsx

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // URL에서 'token'이라는 이름의 파라미터 값을 가져옵니다.
    const token = searchParams.get('token');

    if (token) {
      // 토큰을 로컬 스토리지에 저장합니다.
      localStorage.setItem('accessToken', token);
      // 홈페이지('/')로 사용자를 보냅니다. 페이지를 새로고침하여 로그인 상태가 즉시 반영되도록 합니다.
      window.location.replace('/');
    } else {
      // 토큰이 없는 경우, 에러 메시지를 보여주고 로그인 페이지로 보낼 수 있습니다.
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      window.location.replace('/');
    }
    // 이 컴포넌트는 화면에 아무것도 보여주지 않고 즉시 이동하므로,
    // 아래와 같이 빈 배열을 넣어 한 번만 실행되도록 합니다.
  }, []);

  // 토큰 처리 중 잠시 보여줄 로딩 메시지
  return <div>로그인 처리 중...</div>;
}