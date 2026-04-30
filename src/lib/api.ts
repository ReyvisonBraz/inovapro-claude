import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress 401 errors when no token exists - these are expected during initial load
    if (error.response?.status === 401 && !localStorage.getItem('token')) {
      return Promise.reject(new Error('Not authenticated'));
    }

    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login';

      if (!isLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');

        const now = Date.now();
        const lastReload = parseInt(sessionStorage.getItem('last_auth_reload') || '0');

        if (now - lastReload > 5000) {
          sessionStorage.setItem('last_auth_reload', now.toString());
          window.location.href = '/login';
        }
      }
    }

    // Only log real errors, not expected auth failures
    if (!error.message?.includes('Not authenticated')) {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
