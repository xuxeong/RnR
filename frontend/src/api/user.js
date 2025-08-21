import axiosInstance from './axiosInstance';

// 로그인 (POST /users/login)
export const loginUser = async ({ id, password }) => {
  const response = await axiosInstance.post('/users/login', { id, password });
  return response.data;
};

// 회원가입 (POST /users/register)
export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/users/register', userData);
  return response.data;
};

// 내 정보 조회 (GET /users/me)
export const getMyInfo = async () => {
  const response = await axiosInstance.get('/users/me');
  return response.data;
};

// 내 프로필 조회 (GET /users/me/profile)
export const getMyProfile = async () => {
  const response = await axiosInstance.get('/users/me/profile');
  return response.data;
};

// 내 프로필 수정 (PATCH /users/me/profile)
export const updateMyProfile = async (profileData) => {
    const response = await axiosInstance.patch('/users/me/profile', profileData);
    return response.data;
};