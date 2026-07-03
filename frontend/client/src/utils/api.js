import axios from 'axios';
import { API_BASE_URL } from './constants.js';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't override Content-Type for FormData
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (userData) =>
    apiClient.post("/authentication/register", userData),

  login: (credentials) =>
    apiClient.post("/authentication/login", credentials),

  googleLogin: (firebaseToken) =>
    apiClient.post("/authentication/google-login", { firebaseToken }),

  logout: () => apiClient.post("/authentication/logout"),

  refreshToken: () =>
    apiClient.post("/authentication/refresh"),

  getProfile: () =>
    apiClient.get("/authentication/users/me"),

  updateProfile: (updates) =>
    apiClient.patch('/authentication/users/me', updates),

  uploadProfilePicture: (formData) =>
    apiClient.post('/authentication/users/profile-picture', formData),

  deleteProfile: () =>
    apiClient.delete('/authentication/users/me'),
};

// Post APIs
export const postAPI = {
  createPost: (formData) =>
    apiClient.post("/api/posts", formData),

  getAllPosts: (limit = 20, skip = 0, category = null) => {
    const params = new URLSearchParams({ limit, skip });
    if (category) params.append("category", category);
    return apiClient.get(`/api/posts?${params}`);
  },

  getPost: (id) =>
    apiClient.get(`/api/posts/${id}`),

  getUserPosts: (userId, limit = 20, skip = 0) =>
    apiClient.get(`/api/users/${userId}/posts?limit=${limit}&skip=${skip}`),

  getPostsByType: (postType, limit = 20, skip = 0) =>
    apiClient.get(`/api/posts/type/${postType}?limit=${limit}&skip=${skip}`),

  updatePost: (id, formData) =>
    apiClient.patch(`/api/posts/${id}`, formData),

  deletePost: (id) =>
    apiClient.delete(`/api/posts/${id}`),

  searchByCaption: (query, limit = 20, skip = 0) =>
    apiClient.get(`/api/posts/search/caption?query=${query}&limit=${limit}&skip=${skip}`),

  getPostStats: (id) =>
    apiClient.get(`/api/posts/${id}/stats`),

  addTag: (postId, tag) =>
    apiClient.post(`/api/posts/${postId}/tags`, { tag }),

  removeTag: (postId, tag) =>
    apiClient.delete(`/api/posts/${postId}/tags/${tag}`),
};

// Comment APIs
export const commentAPI = {
  addComment: (postId, text) =>
    apiClient.post(`/api/posts/${postId}/comments`, { text }),

  getComments: (postId, limit = 20, skip = 0) =>
    apiClient.get(`/api/posts/${postId}/comments?limit=${limit}&skip=${skip}`),

  updateComment: (postId, commentId, text) =>
    apiClient.patch(`/api/posts/${postId}/comments/${commentId}`, { text }),

  deleteComment: (postId, commentId) =>
    apiClient.delete(`/api/posts/${postId}/comments/${commentId}`),
};

// Bookmark APIs
export const bookmarkAPI = {
  addBookmark: (postId) =>
    apiClient.post(`/api/posts/${postId}/bookmarks`),

  removeBookmark: (postId) =>
    apiClient.delete(`/api/posts/${postId}/bookmarks`),

  getBookmarkedPosts: (limit = 20, skip = 0) =>
    apiClient.get(`/api/bookmarks?limit=${limit}&skip=${skip}`),

  getUserBookmarks: (userId, limit = 20, skip = 0) =>
    apiClient.get(`/api/users/${userId}/bookmarks?limit=${limit}&skip=${skip}`),

  isPostBookmarkedByUser: (postId) =>
    apiClient.get(`/api/posts/${postId}/bookmarks/check`),
};

// Like APIs
export const likeAPI = {
  addLike: (postId) =>
    apiClient.post(`/api/posts/${postId}/likes`),

  removeLike: (postId) =>
    apiClient.delete(`/api/posts/${postId}/likes`),

  getPostLikes: (postId, limit = 20, skip = 0) =>
    apiClient.get(`/api/posts/${postId}/likes?limit=${limit}&skip=${skip}`),

  getUserLikes: (userId, limit = 20, skip = 0) =>
    apiClient.get(`/api/users/${userId}/likes?limit=${limit}&skip=${skip}`),

  isPostLikedByUser: (postId) =>
    apiClient.get(`/api/posts/${postId}/likes/check`),
};

// Tag APIs
export const tagAPI = {
  getAllTags: (limit = 20, skip = 0) =>
    apiClient.get(`/api/tags?limit=${limit}&skip=${skip}`),

  searchTags: (query, limit = 20, skip = 0) =>
    apiClient.get(`/api/tags/search?query=${query}&limit=${limit}&skip=${skip}`),
};

export default apiClient;
