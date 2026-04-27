import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ReceiptText, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Briefcase,
  Users,
  Wrench,
  Package,
  CreditCard,
  LogOut,
  Search
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SidebarItem } from './SidebarItem';
import { Screen } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLElement>(null);
  const {
    activeScreen, setActiveScreen,
    isSidebarCollapsed, setIsSidebarCollapsed,
    isSidebarOpen, setIsSidebarOpen,
    setIsSearchingOS
  } = useAppStore();

  const { currentUser, logout, hasPermission } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, setIsSidebarOpen]);

  const handleNavigation = (screen: Screen, path: string) => {
    setActiveScreen(screen);
    setIsSidebarOpen(false);
    navigate(path);
  };

  return (
    <aside 
      ref={sidebarRef}
      className={cn(
        "border-r border-slate-200/10 flex flex-col bg-[#0f172a] fixed lg:sticky top-0 h-screen z-50 transition-all duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "p-4 flex items-center justify-between border-b border-slate-200/5",
        isSidebarCollapsed ? "px-3 justify-center" : "px-4"
      )}>
        <img src="/logo.png" alt="INOVA PRO" className={cn("object-contain transition-all", isSidebarCollapsed ? "h-8 w-auto" : "h-7 w-auto")} />
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {hasPermission('view_dashboard') && (
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Início" 
            active={activeScreen === 'dashboard'} 
            onClick={() => handleNavigation('dashboard', '/dashboard')}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_transactions') && (
          <SidebarItem 
            icon={ReceiptText} 
            label="Transações" 
            active={activeScreen === 'transactions'} 
            onClick={() => handleNavigation('transactions', '/transactions')}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_payments') && (
          <SidebarItem 
            icon={CreditCard} 
            label="Vendas e Pagamentos" 
            active={activeScreen === 'client-payments'} 
            onClick={() => handleNavigation('client-payments', '/vendas')}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_service_orders') && (
          <>
            <SidebarItem 
              icon={Wrench} 
              label="Ordens de Serviço" 
              active={activeScreen === 'service-orders'} 
              onClick={() => handleNavigation('service-orders', '/ordens')}
              collapsed={isSidebarCollapsed}
            />
            <SidebarItem 
              icon={Search} 
              label="Buscar OS" 
              active={false} 
              onClick={() => {
                setIsSearchingOS(true);
                setIsSidebarOpen(false);
              }}
              collapsed={isSidebarCollapsed}
            />
          </>
        )}
        {hasPermission('manage_customers') && (
          <SidebarItem 
            icon={Users} 
            label="Clientes" 
            active={activeScreen === 'customers'} 
            onClick={() => handleNavigation('customers', '/clientes')}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_inventory') && (
          <SidebarItem 
            icon={Package} 
            label="Estoque" 
            active={activeScreen === 'inventory'} 
            onClick={() => handleNavigation('inventory', '/estoque')}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('view_reports') && (
          <SidebarItem 
            icon={BarChart3} 
            label="Relatórios" 
            active={activeScreen === 'reports'} 
            onClick={() => handleNavigation('reports', '/relatorios')}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_settings') && (
          <SidebarItem 
            icon={Settings} 
            label="Configurações" 
            active={activeScreen === 'settings'} 
            onClick={() => handleNavigation('settings', '/configuracoes')}
            collapsed={isSidebarCollapsed}
          />
        )}
      </nav>

      <div className="p-4 border-t border-slate-200/5">
        {!isSidebarCollapsed && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{currentUser?.name}</span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest truncate">
                  {currentUser?.role === 'owner' ? 'Proprietário' : currentUser?.role === 'manager' ? 'Gerente' : 'Funcionário'}
                </span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-2 p-2 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all group"
            >
              <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
              Sair
            </button>
          </div>
        )}
        {isSidebarCollapsed && (
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center p-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  );
};
