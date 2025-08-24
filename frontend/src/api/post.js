// src/api/posts.js
// 게시물 관련 API 호출 함수들을 정의합니다.
import axiosInstance from './axiosInstance';

/**
 * 게시물 목록 조회 API 호출
 * GET /posts
 * @param {string} [type] - 'review', 'general', 'vote' (선택 사항)
 * @param {number} [workId] - 작품 ID (선택 사항)
 * @returns {Promise<Array<object>>} - 게시물 목록 배열
 */
export const getPosts = async ({ sort = 'recent', type = null, workId = null } = {}) => {
  try {
    const params = { sort, timestamp: new Date().getTime(), };
    if (type) params.type = type;
    if (workId) params.work_id = workId;
    
    const response = await axiosInstance.get('/posts', { params });
    return response.data;
  } catch (error) {
    console.error('게시물 목록 조회 실패 (정렬: ${sort}):', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 특정 게시물 상세 정보 조회 API 호출
 * GET /posts/{post_id}
 * @param {number} postId - 게시물 ID
 * @returns {Promise<object>} - 게시물 상세 정보
 */
export const getPostDetail = async (postId) => {
  try {
    const response = await axiosInstance.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`게시물 상세 조회 실패 (ID: ${postId}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 새 게시물 생성 API 호출
 * POST /posts
 * @param {object} postData - 생성할 게시물 데이터 (PostCreate 스키마)
 * @returns {Promise<object>} - 생성된 게시물 정보
 */
export const createPost = async (postData) => {
  try {
    const response = await axiosInstance.post('/posts', postData);
    return response.data;
  } catch (error) {
    console.error('게시물 생성 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 게시물 정보 수정 API 호출
 * PATCH /posts/{post_id}
 * @param {number} postId - 게시물 ID
 * @param {object} updateData - 업데이트할 게시물 데이터 (PostUpdate 스키마)
 * @returns {Promise<object>} - 업데이트된 게시물 정보
 */
export const updatePost = async (postId, updateData) => {
  try {
    const response = await axiosInstance.patch(`/posts/${postId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`게시물 업데이트 실패 (ID: ${postId}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 게시물 삭제 API 호출
 * DELETE /posts/{post_id}
 * @param {number} postId - 게시물 ID
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  try {
    await axiosInstance.delete(`/posts/${postId}`);
    console.log(`게시물 (ID: ${postId}) 삭제 성공`);
  } catch (error) {
    console.error(`게시물 삭제 실패 (ID: ${postId}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 특정 작품에 대한 리뷰 목록 조회 API
 */
export const getPostsForWork = async (workId) => {
  try {
    const response = await axiosInstance.get(`/posts/work/${workId}`);
    return response.data;
  } catch (error) {
    console.error(`작품 리뷰 조회 실패 (Work ID: ${workId}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 게시물 좋아요 토글 API
 */
export const toggleLikePost = async (postId) => {
  try {
    // 성공 시 별도의 데이터를 반환하지 않으므로 response를 받지 않아도 됩니다.
    await axiosInstance.post(`/posts/${postId}/like`);
  } catch (error) {
    console.error(`좋아요 실패 (Post ID: ${postId}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 내가 좋아요한 게시물 목록 조회 API
 */
export const getLikedPosts = async () => {
  try {
    const response = await axiosInstance.get('/posts/likes/me');
    return response.data;
  } catch (error) {
    console.error('좋아요한 게시물 조회 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 내가 쓴 게시물 목록 조회 API
 */
export const getMyPosts = async () => {
  try {
    const response = await axiosInstance.get('/posts/my-feed');
    return response.data;
  } catch (error) {
    console.error('내가 쓴 게시물 조회 실패:', error.response?.data || error.message);
    throw error;
  }
};