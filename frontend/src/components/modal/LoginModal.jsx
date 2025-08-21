import React, { useState } from 'react';
import './Modal.css';
import { loginUser } from '../../api/user'; // 1. API 함수 불러오기

function LoginModal({ isOpen, onClose, onLogin }) {
  // 2. 사용자가 입력한 아이디와 비밀번호를 관리할 state 추가
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  // 3. 로그인 버튼 클릭 시 실행될 함수
  const handleSubmit = async () => {
    try {
      // 4. API 함수를 호출하고, state에 저장된 id와 password를 전달
      const result = await loginUser(id, password);
      
      // 5. 로그인 성공 처리
      alert('로그인 성공!');
      console.log('서버로부터 받은 데이터:', result); // 보통 여기에 인증 토큰이 들어있습니다.
      onLogin(); // App.jsx에 있는 로그인 성공 처리 함수 호출
    } catch (error) {
      // 6. 로그인 실패 처리
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      console.error('로그인 실패:', error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button onClick={onClose} className="close-btn">X</button>
        <h2>로그인</h2>
        <input 
          type="text" 
          placeholder="ID" 
          value={id}
          onChange={(e) => setId(e.target.value)} // 입력값을 state에 반영
        />
        <input 
          type="password" 
          placeholder="PW" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} // 입력값을 state에 반영
        />
        {/* 로그인 버튼 클릭 시 handleSubmit 함수 실행 */}
        <button onClick={handleSubmit} className="login-btn">login</button> 
        {/* ... */}
      </div>
    </div>
  );
}

export default LoginModal;