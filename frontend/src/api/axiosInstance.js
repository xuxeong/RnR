// src/api/axiosInstance.js
// 모든 API 요청에 사용될 Axios 인스턴스를 설정합니다.
// 기본 URL, 헤더, 인터셉터 등을 설정할 수 있습니다.
import axios from 'axios';

// 백엔드 API의 기본 URL을 설정합니다.
// 개발 환경에서는 localhost:8000, 배포 환경에서는 실제 도메인으로 변경됩니다.
const API_BASE_URL = 'http://localhost:8000'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 JWT 토큰을 추가합니다.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // 로컬 스토리지에서 토큰 가져오기
    if (token) {
      config.headers.Authorization = 'Bearer ' + token; // Authorization 헤더에 토큰 추가
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: API 응답을 처리하고 에러를 중앙에서 관리합니다.
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized 에러 발생 시 로그인 페이지로 리다이렉트
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken'); // 유효하지 않은 토큰 삭제
      window.location.href = '/'; // 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;