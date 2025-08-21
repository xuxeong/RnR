// src/pages/RegisterPage.jsx
import React from 'react';
import './RegisterPage.css';

function RegisterPage() {
  // 회원가입 폼 로직 추가
  return (
    <div className="register-container">
      <form className="register-form">
        <h2>회원가입</h2>
        <p>회원가입을 위해 기본 정보를 입력해주세요</p>
        {/* ... Input fields ... */}
        <button type="submit">가입</button>
      </form>
    </div>
  );
}

export default RegisterPage;