import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('buyc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('buyc_token');
      localStorage.removeItem('buyc_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
