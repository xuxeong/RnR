// src/components/Footer.jsx
// 애플리케이션의 하단 푸터 컴포넌트입니다.
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-lightPink text-white p-4 mt-8 shadow-inner">
      <div className="container mx-auto text-center text-pinkBrown">
        <p>&copy; 2025 R&R (Reel & Read). All rights reserved.</p>
        <p className="text-sm mt-2">책과 영화를 사랑하는 당신을 위한 커뮤니티</p>
      </div>
    </footer>
  );
}
