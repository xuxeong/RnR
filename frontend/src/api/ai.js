import axiosInstance from './axiosInstance';

/**
 * 작품 AI 요약 생성을 요청하는 API 호출
 * @param {number} workId - 요약을 생성할 작품의 ID
 * @returns {Promise<object>} - 생성된 요약 정보 포함 응답
 */
export const generateWorkSummary = async (workId) => {
  try {
    const response = await axiosInstance.post(`/works/${workId}/ai-summary`);
    return response.data;
  } catch (error) {
    console.error(`AI 요약 생성 실패 (Work ID: ${workId}):`, error.response?.data || error.message);
    throw error;
  }
};