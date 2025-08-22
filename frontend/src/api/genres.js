// src/api/genres.js

import axiosInstance from './axiosInstance';

/**
 * 장르 목록 조회 API 호출
 * @param {object} [params] - API 요청에 사용할 쿼리 파라미터 (예: { genre_type: 'community' })
 * @returns {Promise<Array<object>>} - 장르 목록 배열
 */
export const getGenres = async (params = {}) => {
  try {
    // getGenres 함수로 전달된 params 객체를 그대로 요청에 사용합니다.
    const response = await axiosInstance.get('/genres', { params });
    return response.data;
  } catch (error) {
    console.error('장르 목록 조회 실패:', error.response?.data || error.message);
    throw error;
  }
};