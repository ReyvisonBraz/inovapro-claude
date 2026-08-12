import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';
import { PwaUpdatePrompt } from './components/ui/PwaUpdatePrompt.tsx';
import './lib/logger.ts'; // Initialize logger

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Não retenta erros de autenticação (401/403) — evita queima de rate-limit
        // em chamadas disparadas antes do login confirmar.
        if (error?.response?.status === 401 || error?.response?.status === 403) return false;
        return failureCount < 1;
      },
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <PwaUpdatePrompt />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
