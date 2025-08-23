// src/api/ratings.js

import axiosInstance from './axiosInstance';

/**
 * 작품에 대한 평점을 생성하거나 업데이트하는 API 호출
 * @param {number} workId - 평점을 매길 작품의 ID
 * @param {number} rating - 1.0 ~ 5.0 사이의 평점
 * @returns {Promise<object>} - 생성/업데이트된 평점 정보
 */
export const createOrUpdateRating = async (workId, rating) => {
  try {
    const response = await axiosInstance.post('/ratings', {
      work_id: workId,
      rating: rating,
    });
    return response.data;
  } catch (error) {
    console.error(`Rating submission failed for work ${workId}:`, error.response?.data || error.message);
    throw error;
  }
};