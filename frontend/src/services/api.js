import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization header interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  signup: async (name, email, phone, password, role = 'USER') => {
    const response = await apiClient.post('/auth/signup', { name, email, phone, password, role });
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Articles CRUD (Spring Boot / PostgreSQL)
  getArticles: async (page = 0, size = 10, categoryId = null, sourceId = null, keyword = '') => {
    const params = { page, size };
    if (categoryId) params.categoryId = categoryId;
    if (sourceId) params.sourceId = sourceId;
    if (keyword) params.keyword = keyword;
    const response = await apiClient.get('/articles', { params });
    return response.data;
  },
  getArticlesByIds: async (ids) => {
    const response = await apiClient.get(`/articles?ids=${ids.join(',')}`);
    return response.data;
  },
  getArticle: async (id) => {
    const response = await apiClient.get(`/articles/${id}`);
    return response.data;
  },
  createArticle: async (title, sourceId, categoryId) => {
    const response = await apiClient.post('/articles', { title, sourceId, categoryId });
    return response.data;
  },
  updateArticle: async (id, title, sourceId, categoryId) => {
    const response = await apiClient.put(`/articles/${id}`, { title, sourceId, categoryId });
    return response.data;
  },
  deleteArticle: async (id) => {
    const response = await apiClient.delete(`/articles/${id}`);
    return response.data;
  },

  // Categories CRUD (Spring Boot / PostgreSQL)
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },
  createCategory: async (categoryName) => {
    const response = await apiClient.post('/categories', { categoryName });
    return response.data;
  },
  updateCategory: async (id, categoryName) => {
    const response = await apiClient.put(`/categories/${id}`, { categoryName });
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  // Sources CRUD (Spring Boot / PostgreSQL)
  getSources: async () => {
    const response = await apiClient.get('/sources');
    return response.data;
  },
  createSource: async (sourceName, website) => {
    const response = await apiClient.post('/sources', { sourceName, website });
    return response.data;
  },
  updateSource: async (id, sourceName, website) => {
    const response = await apiClient.put(`/sources/${id}`, { sourceName, website });
    return response.data;
  },
  deleteSource: async (id) => {
    const response = await apiClient.delete(`/sources/${id}`);
    return response.data;
  },

  // Likes and Bookmarks (Spring Boot / PostgreSQL)
  toggleLike: async (articleId) => {
    const response = await apiClient.post('/likes', { articleId });
    return response.data;
  },
  getLikeStatus: async (articleId) => {
    const response = await apiClient.get(`/likes/status/${articleId}`);
    return response.data;
  },
  getLikeCount: async (articleId) => {
    const response = await apiClient.get(`/likes/count/${articleId}`);
    return response.data;
  },
  toggleBookmark: async (articleId) => {
    const response = await apiClient.post('/bookmarks', { articleId });
    return response.data;
  },
  getBookmarks: async () => {
    const response = await apiClient.get('/bookmarks');
    return response.data;
  },

  // MongoDB content / embeddings / AI Search (Node.js / MongoDB)
  getContent: async (articleId) => {
    const response = await apiClient.get(`/content/${articleId}`);
    return response.data;
  },
  createContent: async (articleId, title, fullContent, summary = '', keywords = []) => {
    const response = await apiClient.post('/content', { articleId, title, fullContent, summary, keywords });
    return response.data;
  },
  updateContent: async (articleId, title, fullContent, summary = '', keywords = []) => {
    const response = await apiClient.put(`/content/${articleId}`, { title, fullContent, summary, keywords });
    return response.data;
  },
  deleteContent: async (articleId) => {
    const response = await apiClient.delete(`/content/${articleId}`);
    return response.data;
  },
  semanticSearch: async (query) => {
    const response = await apiClient.get(`/semantic-search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  logReadingHistory: async (articleId, readingDuration) => {
    const response = await apiClient.post('/reading-history', { articleId, readingDuration });
    return response.data;
  },
  getReadingHistory: async () => {
    const response = await apiClient.get('/reading-history');
    return response.data;
  },
  getReadingStats: async () => {
    const response = await apiClient.get('/reading-history/stats');
    return response.data;
  },
};

export default api;
