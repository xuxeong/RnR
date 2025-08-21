// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// import App from './App'; // App 대신 Router를 임포트합니다.
import Router from './Router';
import './styles/Global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router /> {/* App 대신 Router를 렌더링합니다. */}
  </React.StrictMode>
);