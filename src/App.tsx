import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { User, Screen } from './types';
import { Login } from './components/auth/Login';
import { useAuth } from './hooks/useAuth';
import { useToast } from './components/ui/Toast';
import { useAppStore } from './store/useAppStore';
import { useFilterStore } from './store/useFilterStore';
import { useModalStore } from './store/useModalStore';
import { useFormStore } from './store/useFormStore';
import { useSettings } from './hooks/useSettings';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalModals } from './components/layout/GlobalModals';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';

// Lazy loaded pages
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const CustomersPage = lazy(() => import('./pages/CustomersPage').then(m => ({ default: m.CustomersPage })));
const ClientPaymentsPage = lazy(() => import('./pages/ClientPaymentsPage').then(m => ({ default: m.ClientPaymentsPage })));
const ServiceOrdersPage = lazy(() => import('./pages/ServiceOrdersPage').then(m => ({ default: m.ServiceOrdersPage })));
const InventoryPage = lazy(() => import('./pages/InventoryPage').then(m => ({ default: m.InventoryPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// --- Aplicativo Principal ---

export default function App() {
  const {
    activeScreen, setActiveScreen,
    isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, setIsSidebarCollapsed,
    fontSize, setFontSize,
    showNotifications, setShowNotifications,
    notificationTab, setNotificationTab,
    isAdding, setIsAdding,
    isAddingServiceOrder, setIsAddingServiceOrder,
    isAddingInventoryItem, setIsAddingInventoryItem,
    isAddingCustomer, setIsAddingCustomer,
    setCustomerRegistrationSource,
    isAddingClientPayment, setIsAddingClientPayment,
    setIsSearchingOS,
    setDirectOsId,
    setDirectMode
  } = useAppStore();

  const {
    searchTerm, setSearchTerm,
  } = useFilterStore();

  const {
    passwordInput, setPasswordInput,
    editingTransaction, setEditingTransaction,
    editingCustomer, setEditingCustomer,
  } = useModalStore();

  const location = useLocation();
  const navigate = useNavigate();

  // Sincronizar URL com activeScreen
  useEffect(() => {
    const path = location.pathname;
    const screenMap: Record<string, Screen> = {
      '/dashboard': 'dashboard',
      '/transactions': 'transactions',
      '/vendas': 'client-payments',
      '/ordens': 'service-orders',
      '/clientes': 'customers',
      '/estoque': 'inventory',
      '/relatorios': 'reports',
      '/configuracoes': 'settings'
    };

    const targetScreen = screenMap[path];
    if (targetScreen && activeScreen !== targetScreen) {
      setActiveScreen(targetScreen);
    } else if (path === '/' && activeScreen !== 'dashboard') {
      setActiveScreen('dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, activeScreen, setActiveScreen, navigate]);

  const {
    setNewCustomer,
    setNewTx,
  } = useFormStore();

  const { showToast } = useToast();

  const {
    settings,
    fetchSettings,
    fetchCategories,
  } = useSettings(showToast);

  const {
    isAuthenticated,
    currentUser,
    login,
    logout,
    hasPermission,
  } = useAuth(showToast);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('app_font_size', fontSize.toString());
  }, [fontSize]);

  const handlePrintBlankForm = () => {
    printBlankForm(settings);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const osId = params.get('osId');
    const mode = params.get('mode');
    if (osId) {
      setDirectOsId(parseInt(osId));
      setDirectMode(mode);
      navigate('/ordens');
    }
  }, []);

  useEffect(() => {
    if (editingTransaction) {
      setNewTx({
        description: editingTransaction.description,
        category: editingTransaction.category,
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        date: editingTransaction.date
      });
    }
  }, [editingTransaction]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
      fetchCategories();
    }
  }, [isAuthenticated]);







  const handleLogin = (user: User) => {
    login(user);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-bg-dark text-slate-100 selection:bg-primary/30">
      <div className="flex flex-1 app-main-wrapper">

        <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <Header />

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/vendas" element={<ClientPaymentsPage />} />
                <Route path="/ordens" element={<ServiceOrdersPage />} />
                <Route path="/clientes" element={<CustomersPage />} />
                <Route path="/estoque" element={<InventoryPage />} />
                <Route path="/relatorios" element={<ReportsPage />} />
                <Route path="/configuracoes" element={<SettingsPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        <footer className="py-10 px-10 text-center border-t border-white/5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">© 2024 FinanceFlow Inc. Todos os direitos reservados.</p>
        </footer>
      </main>

      <GlobalModals />
      </div>

      {/* Print styles and Dynamic Theme */}
      <style>{`
        :root {
          --color-primary: ${settings?.primaryColor || '#1152d4'};
        }
      `}</style>
    </div>
  );
}
