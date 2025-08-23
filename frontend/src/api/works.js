// src/api/works.js
// 작품(책, 영화) 관련 API 호출 함수들을 정의합니다.
import axiosInstance from './axiosInstance';

/**
 * 작품 목록 조회 API 호출 (페이지네이션 추가)
 * @param {string} [type] - 'book' 또는 'movie'
 * @param {string} [query] - 검색어
 * @param {number} [skip=0] - 건너뛸 항목 수
 * @param {number} [limit=20] - 가져올 항목 수
 * @returns {Promise<Array<object>>} - 작품 목록 배열
 */
export const getWorks = async (type = null, query = null, skip = 0, limit = 20) => {
  try {
    // 기본 파라미터에 skip과 limit 추가
    const params = { skip, limit };
    if (type) params.type = type;
    if (query) params.q = query;

    // 검색 API와 일반 목록 조회 API를 분기 처리
    const url = query ? '/works/search' : '/works';
    
    const response = await axiosInstance.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('작품 목록 조회 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 특정 작품 상세 정보 조회 API 호출
 * GET /works/{work_id}
 * @param {number} workId - 작품 ID
 * @returns {Promise<object>} - 작품 상세 정보
 */
export const getWorkDetail = async (workId) => {
  try {
    const response = await axiosInstance.get(`/works/${workId}`);
    return response.data;
  } catch (error) {
    console.error(`작품 상세 조회 실패 (ID: ${workId}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 작품 검색 API 호출
 * GET /works/search?q={query}&type={type}
 * @param {string} query - 검색어
 * @param {string} [type] - 'book' 또는 'movie' (선택 사항)
 * @returns {Promise<Array<object>>} - 검색된 작품 목록
 */
export const searchWorks = async (query, type = null) => {
  try {
    const params = { q: query };
    if (type) {
      params.type = type;
    }
    const response = await axiosInstance.get('/works/search', { params });
    return response.data;
  } catch (error) {
    console.error(`작품 검색 실패 (쿼리: ${query}):`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 작품 생성 API 호출 (책 또는 영화)
 * POST /works/create
 * @param {object} workData - 작품 공통 데이터 (WorkCreate 스키마)
 * @param {object} payloadData - 책 또는 영화 고유 데이터 (BookCreate 또는 MovieCreate 스키마)
 * @returns {Promise<object>} - 생성된 작품 정보
 */
export const createWork = async (workData, payloadData) => {
  try {
    const response = await axiosInstance.post('/works/create', { ...workData, ...payloadData });
    return response.data;
  } catch (error) {
    console.error('작품 생성 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 작품 정보 수정 API 호출 (책 또는 영화)
 * PATCH /works/{work_id}
 * @param {number} workId - 작품 ID
 * @param {object} updateData - 업데이트할 작품 데이터 (WorkUpdate, BookUpdate, MovieUpdate 스키마)
 * @returns {Promise<object>} - 업데이트된 작품 정보
 */
export const updateWork = async (workId, updateData) => {
  try {
    const response = await axiosInstance.patch(`/works/${workId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`작품 업데이트 실패 (ID: ${workId}):`, error.response?.data || error.message);
    throw error;
  }
};