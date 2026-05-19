import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Users,
  Package,
  CreditCard,
  LogOut,
  Search,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SidebarItem } from './SidebarItem';
import { Screen } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import { useIsMobile } from '../../hooks/useMediaQuery';

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' },
} as const

export const Sidebar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    activeScreen, setActiveScreen,
    isSidebarCollapsed, setIsSidebarCollapsed,
    isSidebarOpen, setIsSidebarOpen,
    setIsSearchingOS
  } = useAppStore();

  const { currentUser, logout, hasPermission } = useAuth();

  const handleNavigation = (screen: Screen, path: string) => {
    setActiveScreen(screen);
    setIsSidebarOpen(false);
    navigate(path);
  };

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-bg-elevated",
      isMobile ? 'w-72' : (isSidebarCollapsed ? 'w-20' : 'w-64')
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-white/[0.04] h-16 shrink-0",
        isMobile ? 'px-5 justify-between' : (isSidebarCollapsed ? 'px-0 justify-center' : 'px-5 justify-between')
      )}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center ring-1 ring-primary/25 shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(17,82,212,0.28) 0%, rgba(17,82,212,0.10) 100%)' }}
          >
            <Wrench size={16} className="text-primary" />
          </div>
          {(!isSidebarCollapsed || isMobile) && (
            <span className="font-display font-bold text-sm tracking-tight text-white">INOVA PRO</span>
          )}
        </div>
        {isMobile ? (
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all">
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all hidden lg:flex"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {hasPermission('view_dashboard') && (
          <SidebarItem icon={LayoutDashboard} label="Início" active={activeScreen === 'dashboard'} onClick={() => handleNavigation('dashboard', '/dashboard')} collapsed={!isMobile && isSidebarCollapsed} />
        )}
        {hasPermission('manage_transactions') && (
          <SidebarItem icon={ReceiptText} label="Transações" active={activeScreen === 'transactions'} onClick={() => handleNavigation('transactions', '/transactions')} collapsed={!isMobile && isSidebarCollapsed} />
        )}
        {hasPermission('manage_payments') && (
          <SidebarItem icon={CreditCard} label="Vendas" active={activeScreen === 'client-payments'} onClick={() => handleNavigation('client-payments', '/vendas')} collapsed={!isMobile && isSidebarCollapsed} />
        )}
        {hasPermission('manage_service_orders') && (
          <>
            <SidebarItem icon={Wrench} label="Ordens de Serviço" active={activeScreen === 'service-orders'} onClick={() => handleNavigation('service-orders', '/ordens')} collapsed={!isMobile && isSidebarCollapsed} />
            <SidebarItem icon={Search} label="Buscar OS" active={false} onClick={() => { setIsSearchingOS(true); setIsSidebarOpen(false); }} collapsed={!isMobile && isSidebarCollapsed} />
          </>
        )}
        {hasPermission('manage_customers') && (
          <SidebarItem icon={Users} label="Clientes" active={activeScreen === 'customers'} onClick={() => handleNavigation('customers', '/clientes')} collapsed={!isMobile && isSidebarCollapsed} />
        )}
        {hasPermission('manage_inventory') && (
          <SidebarItem icon={Package} label="Estoque" active={activeScreen === 'inventory'} onClick={() => handleNavigation('inventory', '/estoque')} collapsed={!isMobile && isSidebarCollapsed} />
        )}
        {hasPermission('view_reports') && (
          <SidebarItem icon={BarChart3} label="Relatórios" active={activeScreen === 'reports'} onClick={() => handleNavigation('reports', '/relatorios')} collapsed={!isMobile && isSidebarCollapsed} />
        )}
        {hasPermission('manage_settings') && (
          <SidebarItem icon={Settings} label="Configurações" active={activeScreen === 'settings'} onClick={() => handleNavigation('settings', '/configuracoes')} collapsed={!isMobile && isSidebarCollapsed} />
        )}
      </nav>

      {/* User footer */}
      <div className="p-2 lg:p-3 border-t border-white/[0.04] shrink-0">
        <div className={cn(
          "rounded-xl bg-white/[0.03] border border-white/[0.04]",
          isSidebarCollapsed && !isMobile ? "p-2 flex flex-col items-center gap-2" : "p-3"
        )}>
          <div className={cn(
            "flex items-center",
            isSidebarCollapsed && !isMobile ? "flex-col gap-1" : "gap-3 mb-2.5"
          )}>
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {currentUser?.name?.charAt(0)?.toUpperCase()}
            </div>
            {(!isSidebarCollapsed || isMobile) && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{currentUser?.name}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                  {currentUser?.role === 'owner' ? 'Proprietário' : currentUser?.role === 'manager' ? 'Gerente' : 'Funcionário'}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={cn(
              "flex items-center font-bold hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all group",
              isSidebarCollapsed && !isMobile
                ? "p-1.5 rounded-lg text-slate-500 justify-center"
                : "w-full gap-2 px-2.5 py-2 text-xs text-slate-500"
            )}
            title="Sair"
          >
            <LogOut size={13} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
            {(!isSidebarCollapsed || isMobile) && <span>Sair</span>}
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile: Animated drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 } as const}
            className="fixed left-0 top-0 bottom-0 z-50 shadow-2xl shadow-black/40"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Persistent sidebar
  return (
    <aside className="sticky top-0 h-screen z-30 border-r border-white/[0.04] hidden lg:flex flex-col shrink-0 overflow-hidden transition-all duration-300 bg-bg-elevated"
      style={{ width: isSidebarCollapsed ? 80 : 256 }}
    >
      {sidebarContent}
    </aside>
  );
};
