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
import { printBlankForm } from './lib/printUtils';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';

// Componente para proteger rotas por permissão
const ProtectedRoute = ({ children, permission }: { children: React.ReactNode, permission: string }) => {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center p-20 glass-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 className="text-2xl font-black text-rose-500">Acesso Negado</h2>
        <p className="text-slate-400 font-medium">Você não tem permissão para acessar esta área.</p>
      </div>
    );
  }
  return <>{children}</>;
};

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
  } = useAuth();

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







  const handleLogin = (token: string, user: User) => {
    login(token, user);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                <Route path="/dashboard" element={<ProtectedRoute permission="view_dashboard"><DashboardPage /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute permission="manage_transactions"><TransactionsPage /></ProtectedRoute>} />
                <Route path="/vendas" element={<ProtectedRoute permission="manage_payments"><ClientPaymentsPage /></ProtectedRoute>} />
                <Route path="/ordens" element={<ProtectedRoute permission="manage_service_orders"><ServiceOrdersPage /></ProtectedRoute>} />
                <Route path="/clientes" element={<ProtectedRoute permission="manage_customers"><CustomersPage /></ProtectedRoute>} />
                <Route path="/estoque" element={<ProtectedRoute permission="manage_inventory"><InventoryPage /></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute permission="view_reports"><ReportsPage /></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute permission="manage_settings"><SettingsPage /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        <footer className="py-10 px-10 text-center border-t border-white/5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">© {new Date().getFullYear()} INOVA PRO. Todos os direitos reservados.</p>
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
