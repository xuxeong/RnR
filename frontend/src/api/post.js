import axiosInstance from './axiosInstance';

// 전체 글 목록 조회 (GET /posts)
export const getPosts = async () => {
  const response = await axiosInstance.get('/posts');
  return response.data;
};

// 게시글 작성 (POST /posts)
export const createPost = async (postData) => {
  const response = await axiosInstance.post('/posts', postData);
  return response.data;
};