import axiosInstance from './axiosInstance';

/**
 * 추천 작품 목록 조회 API
 */
export const getRecommendedWorks = async () => {
  try {
    const response = await axiosInstance.get('/recommend/works');
    return response.data;
  } catch (error) {
    console.error('추천 작품 조회 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 추천 사용자 목록 조회 API
 */
export const getSimilarUsers = async () => {
  try {
    const response = await axiosInstance.get('/recommend/users');
    return response.data;
  } catch (error) {
    console.error('추천 사용자 조회 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 내 관심 장르 조회 API
 */
export const getMyInterests = async () => {
    try {
      const response = await axiosInstance.get('/recommend/interests');
      return response.data;
    } catch (error) {
      console.error('관심 장르 조회 실패:', error.response?.data || error.message);
      throw error;
    }
  };

  /**
 * 추천 알고리즘 업데이트를 수동으로 실행하는 API
 */
export const runRecommendationUpdate = async () => {
  try {
    const response = await axiosInstance.post('/recommend/run-update');
    return response.data;
  } catch (error) {
    console.error('추천 업데이트 실행 실패:', error.response?.data || error.message);
    throw error;
  }
};