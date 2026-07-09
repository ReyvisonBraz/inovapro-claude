import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // envia/recebe o cookie httpOnly de sessão
});

// Sem injeção de Authorization: o token vive no cookie httpOnly (inacessível a JS).

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      // Não redireciona nas páginas que não exigem sessão.
      const isPublic = path === '/login' || path === '/rastreio';

      if (!isPublic) {
        localStorage.removeItem('currentUser');

        const now = Date.now();
        const lastReload = parseInt(sessionStorage.getItem('last_auth_reload') || '0');
        if (now - lastReload > 5000) {
          sessionStorage.setItem('last_auth_reload', now.toString());
          window.location.href = '/login';
        }
      }
    }

    // 401 é fluxo de auth esperado (ex.: bootstrap /me sem sessão) — não polui o console.
    if (error.response?.status !== 401) {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
