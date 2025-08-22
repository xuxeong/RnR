// src/api/auth.js
// 사용자 인증 및 프로필 관련 API 호출 함수들을 정의합니다.
import axiosInstance from './axiosInstance';

/**
 * 사용자 로그인 API 호출
 * @param {string} username - 사용자 이메일
 * @param {string} pw - 사용자 비밀번호
 * @returns {Promise<object>} - 로그인 성공 시 토큰 정보를 포함한 응답
 */
export const login = async (username, pw) => {
  try {
    const response = await axiosInstance.post('/users/login', { username, pw });
    return response.data; 
  } catch (error) {
    console.error('로그인 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Google 로그인 URL 요청 API 호출
 * @returns {Promise<object>} - Google 로그인 페이지로 이동할 URL을 포함한 응답
 */
export const getGoogleLoginUrl = async () => {
  try {
    const response = await axiosInstance.get('/auth/google');
    return response.data.url;
  } catch (error) {
    console.error('Google 로그인 URL 요청 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 사용자 회원가입 API 호출
 * @param {object} userData - 회원가입에 필요한 사용자 데이터 (UserCreate 스키마)
 * @returns {Promise<object>} - 회원가입 성공 시 사용자 정보를 포함한 응답
 */
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('회원가입 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 현재 로그인한 사용자 정보 조회 API 호출 (getMyInfo 역할)
 * GET /users/me
 * @returns {Promise<object>} - 현재 사용자 정보를 포함한 응답
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 내 프로필 조회 API 호출 (getMyProfile 역할)
 * GET /users/me/profile
 * @returns {Promise<object>} - 현재 사용자 프로필 정보를 포함한 응답
 */
export const getMyProfile = async () => {
  try {
    const response = await axiosInstance.get('/profile/me');
    return response.data;
  } catch (error) {
    console.error('내 프로필 조회 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 사용자 프로필 업데이트 API 호출 (updateMyProfile 역할)
 * PATCH /users/me/profile
 * @param {object} profileData - 업데이트할 프로필 데이터 (ProfileUpdate 스키마)
 * @returns {Promise<object>} - 업데이트된 프로필 정보를 포함한 응답
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.patch('/profile/me', profileData);
    return response.data;
  } catch (error) {
    console.error('프로필 업데이트 실패:', error.response?.data || error.message);
    throw error;
  }
};

//사용자 계정 업데이트 API 호출
export const updateUser = async (userData) => {
  try {
    const response = await axiosInstance.patch('/users/me', userData);
    return response.data;
  } catch (error) {
    console.error('사용자 정보 업데이트 실패:', error.response?.data || error.message);
    throw error;
  }
};


/**
 * 사용자 계정 비활성화 (탈퇴 유예) API 호출
 * PATCH /users/me/deactivate
 * @returns {Promise<void>}
 */
export const deactivateAccount = async () => {
  try {
    await axiosInstance.patch('/users/me/deactivate');
    console.log('계정 비활성화 요청 성공');
  } catch (error) {
    console.error('계정 비활성화 실패:', error.response?.data || error.message);
    throw error;
  }
};
