import React from 'react';
import { Link } from 'react-router-dom';
import './Modal.css';

function SignupModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button onClick={onClose} className="close-btn">X</button>
        <h2>WELCOME!!</h2>
        <input type="email" placeholder="email" />
        
        {/* Link 컴포넌트로 /register 페이지로 이동 */}
        <Link to="/register" onClick={onClose} className="signup-link-button">
          이메일로 회원가입
        </Link>
        
        <div className="social-signup">
          <p>소셜계정으로 회원가입</p>
          <div className="social-icons">
            {/* 소셜 로그인 버튼들 */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupModal;