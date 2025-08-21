import axios from 'axios';

// API의 기본 URL
const baseURL = 'http://localhost:8080'; // 예시: 로컬 백엔드 서버 주소. 나중에 실제 백엔드 서버 주소로 변경하세요.

const axiosInstance = axios.create({
  baseURL: baseURL,
});

// 요청 인터셉터: 모든 API 요청을 보내기 전에 이 함수를 거칩니다.
axiosInstance.interceptors.request.use(
  (config) => {
    // localStorage에서 accessToken을 가져옵니다.
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 토큰이 있다면 헤더에 추가합니다.
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;