import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

function flushQueue(token: string) {
  pendingQueue.forEach(cb => cb(token));
  pendingQueue = [];
}

function rejectQueue() {
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Se o próprio /refresh falhou, desiste e redireciona para login.
    if (original?.url === '/refresh' || original?._retry) {
      rejectQueue();
      handleUnauthenticated();
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        original._retry = true;
        try {
          const { data } = await api.post('/refresh');
          isRefreshing = false;
          flushQueue(data.token || '');
          return api(original);
        } catch {
          isRefreshing = false;
          rejectQueue();
          handleUnauthenticated();
          return Promise.reject(error);
        }
      }

      // Já existe um refresh em andamento — enfileira a requisição original.
      return new Promise((resolve) => {
        pendingQueue.push(() => resolve(api(original)));
      });
    }

    if (error.response?.status !== 401) {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

function handleUnauthenticated() {
  const path = window.location.pathname;
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

export default api;
