import React from 'react';
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
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SidebarItem } from './SidebarItem';
import { Screen, User } from '../types';

interface SidebarProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentUser: User | null;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const Sidebar = ({
  activeScreen,
  setActiveScreen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isSidebarOpen,
  setIsSidebarOpen,
  currentUser,
  logout,
  hasPermission
}: SidebarProps) => {
  return (
    <aside 
      className={cn(
        "border-r border-white/5 flex flex-col bg-slate-900/50 backdrop-blur-xl fixed lg:sticky top-0 h-screen z-50 transition-all duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        isSidebarCollapsed ? "w-20 overflow-visible" : "w-72"
      )}
    >
      <div className={cn(
        "p-6 flex items-center justify-between border-b border-white/5",
        isSidebarCollapsed ? "px-4 justify-center" : "px-6"
      )}>
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="font-black text-xl text-white tracking-tighter italic">FF</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter leading-none italic">Finance<span className="text-primary">Flow</span></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Gestão Pro</span>
            </div>
          </div>
        )}
        {isSidebarCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-black text-xl text-white tracking-tighter italic">FF</span>
          </div>
        )}
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
            onClick={() => { setActiveScreen('dashboard'); setIsSidebarOpen(false); }}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_transactions') && (
          <SidebarItem 
            icon={ReceiptText} 
            label="Transações" 
            active={activeScreen === 'transactions'} 
            onClick={() => { setActiveScreen('transactions'); setIsSidebarOpen(false); }}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_payments') && (
          <SidebarItem 
            icon={CreditCard} 
            label="Vendas e Pagamentos" 
            active={activeScreen === 'client-payments'} 
            onClick={() => { setActiveScreen('client-payments'); setIsSidebarOpen(false); }}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_service_orders') && (
          <SidebarItem 
            icon={Wrench} 
            label="Ordens de Serviço" 
            active={activeScreen === 'service-orders'} 
            onClick={() => { setActiveScreen('service-orders'); setIsSidebarOpen(false); }}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_customers') && (
          <SidebarItem 
            icon={Users} 
            label="Clientes" 
            active={activeScreen === 'customers'} 
            onClick={() => { setActiveScreen('customers'); setIsSidebarOpen(false); }}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_inventory') && (
          <SidebarItem 
            icon={Package} 
            label="Estoque" 
            active={activeScreen === 'inventory'} 
            onClick={() => { setActiveScreen('inventory'); setIsSidebarOpen(false); }}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('view_reports') && (
          <SidebarItem 
            icon={BarChart3} 
            label="Relatórios" 
            active={activeScreen === 'reports'} 
            onClick={() => { setActiveScreen('reports'); setIsSidebarOpen(false); }}
            collapsed={isSidebarCollapsed}
          />
        )}
        {hasPermission('manage_settings') && (
          <SidebarItem 
            icon={Settings} 
            label="Configurações" 
            active={activeScreen === 'settings'} 
            onClick={() => { setActiveScreen('settings'); setIsSidebarOpen(false); }}
            collapsed={isSidebarCollapsed}
          />
        )}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        {!isSidebarCollapsed && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate">{currentUser?.name}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                  {currentUser?.role === 'owner' ? 'Proprietário' : currentUser?.role === 'manager' ? 'Gerente' : 'Funcionário'}
                </span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-2 p-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group"
            >
              <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
              Sair da Conta
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
