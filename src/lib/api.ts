import axios, { InternalAxiosRequestConfig } from 'axios';
import { createErrorId, reportClientError } from './error-reporting';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.method === 'post') {
    config.headers['X-Idempotency-Key'] = crypto.randomUUID();
  }
  return config;
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
      const requestId = error.response?.data?.requestId || error.response?.headers?.['x-request-id'];
      const apiCode = error.response?.data?.error;
      const shouldReport = !error.response || error.response.status >= 500 || (error.response.status === 409 && apiCode !== 'duplicate_phone');
      if (shouldReport) {
        const supportId = createErrorId();
        error.supportCode = supportId;
        if (!error.response) error.message = `${error.message || 'Falha de rede'} (Código: ${supportId})`;
        if (error.response?.data && typeof error.response.data === 'object') {
          error.response.data.supportCode = supportId;
          const apiMessage = error.response.data.error;
          if (typeof apiMessage === 'string' && !/^[a-z0-9_]+$/.test(apiMessage)) {
            error.response.data.error = `${apiMessage} (Código: ${supportId})`;
          }
        }
        void reportClientError({
          severity: error.response?.status >= 500 || !error.response ? 'critical' : 'warning',
          operation: `${String(original?.method || 'request').toUpperCase()} ${original?.url || 'unknown'}`,
          message: error.response?.data?.error || error.message || 'Falha de comunicação com a API',
          route: original?.url,
          method: original?.method?.toUpperCase(),
          statusCode: error.response?.status,
          requestId,
          details: { networkError: !error.response },
        }, supportId);
      }
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
