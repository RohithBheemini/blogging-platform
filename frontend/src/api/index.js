// src/api/index.js
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inkwell_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('inkwell_token');
      localStorage.removeItem('inkwell_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────
export const register   = (data) => api.post('/auth/register',   data);
export const login      = (data) => api.post('/auth/login',      data);
export const getMe      = ()     => api.get('/auth/me');
export const getStats   = ()     => api.get('/auth/stats');

// ── Posts ─────────────────────────────────────
export const getAllPosts  = (params)     => api.get('/posts',           { params });
export const getMyPosts   = ()           => api.get('/posts/mine');
export const getPost      = (id)         => api.get(`/posts/${id}`);
export const createPost   = (data)       => api.post('/posts',           data);
export const updatePost   = (id, data)   => api.put(`/posts/${id}`,      data);
export const deletePost   = (id)         => api.delete(`/posts/${id}`);

// ── Comments ──────────────────────────────────
export const getComments  = (postId)     => api.get(`/posts/${postId}/comments`);
export const addComment   = (postId, data) => api.post(`/posts/${postId}/comments`, data);
export const deleteComment = (postId, commentId) =>
  api.delete(`/posts/${postId}/comments/${commentId}`);

export default api;
