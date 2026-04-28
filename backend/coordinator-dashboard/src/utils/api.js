// src/utils/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({ baseURL: API_BASE });

// Attach auth token from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vm_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const needsAPI = {
  create: data => api.post('/api/needs', data),
  list: params => api.get('/api/needs', { params }),
  get: id => api.get(`/api/needs/${id}`),
  update: (id, data) => api.put(`/api/needs/${id}`, data),
};

export const matchAPI = {
  trigger: needId => api.post(`/api/match/${needId}/trigger`),
  assign: matchId => api.post(`/api/match/${matchId}/assign`),
  respond: (matchId, accepted) => api.post(`/api/match/${matchId}/respond`, { accepted }),
  complete: (matchId, proofPhotoUrl) => api.post(`/api/match/${matchId}/complete`, { proofPhotoUrl }),
  feedback: (matchId, data) => api.post(`/api/match/${matchId}/feedback`, data),
};

export const volunteersAPI = {
  list: () => api.get('/api/volunteers'),
  get: id => api.get(`/api/volunteers/${id}`),
  update: (id, data) => api.put(`/api/volunteers/${id}`, data),
  getMatches: id => api.get(`/api/volunteers/${id}/matches`),
};

export const analyticsAPI = {
  get: () => api.get('/api/analytics'),
  exportCsv: () => api.get('/api/analytics/export', { responseType: 'blob' }),
};

export const leaderboardAPI = {
  get: () => api.get('/api/leaderboard'),
};

export default api;
