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
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login';
      
      // Only remove and redirect if not already on login page to avoid loops
      if (!isLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        
        // Prevent infinite reload loops by checking sessionStorage
        const now = Date.now();
        const lastReload = parseInt(sessionStorage.getItem('last_auth_reload') || '0');
        
        if (now - lastReload > 5000) { // Only reload if it's been more than 5 seconds
          sessionStorage.setItem('last_auth_reload', now.toString());
          window.location.href = '/login';
        }
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
