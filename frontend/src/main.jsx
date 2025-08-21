import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/Global.css'; // 글로벌 스타일 적용

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);