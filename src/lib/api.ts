import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratar erros globais (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aqui você pode tratar erros globais, como 401 (não autorizado)
    if (error.response?.status === 401) {
      // Redirecionar para login ou limpar estado de auth
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
