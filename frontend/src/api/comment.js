import axiosInstance from './axiosInstance';

/**
 * 특정 게시물의 댓글 목록 조회
 */
export const getComments = async (postId) => {
  try {
    const response = await axiosInstance.get(`/comments/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`댓글 조회 실패 (Post ID: ${postId}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 댓글 작성
 */
export const createComment = async (postId, context) => {
  try {
    const response = await axiosInstance.post(`/comments/post/${postId}`, { context });
    return response.data;
  } catch (error) {
    console.error(`댓글 작성 실패 (Post ID: ${postId}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/comments/${commentId}`);
    } catch (error) {
      console.error(`댓글 삭제 실패 (ID: ${commentId}):`, error.response?.data || error.message);
      throw error;
    }
  };