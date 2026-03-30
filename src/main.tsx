import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { DataProvider } from './contexts/DataContext.tsx';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { UIProvider } from './contexts/UIContext.tsx';
import { FilterProvider } from './contexts/FilterContext.tsx';
import './lib/logger.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <UIProvider>
              <FilterProvider>
                <DataProvider>
                  <ToastProvider>
                    <App />
                  </ToastProvider>
                </DataProvider>
              </FilterProvider>
            </UIProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
