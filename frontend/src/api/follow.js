import axiosInstance from './axiosInstance';

/**
 * 다른 사용자를 팔로우/언팔로우하는 API
 * @param {number} userId - 팔로우할 사용자의 ID
 * @returns {Promise<object>} - 최신 팔로우 상태({ is_followed: boolean })를 포함한 응답
 */
export const toggleFollowUser = async (userId) => {
  try {
    const response = await axiosInstance.post(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error(`팔로우/언팔로우 실패 (User ID: ${userId}):`, error.response?.data || error.message);
    throw error;
  }
};