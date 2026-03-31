import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Receipt, BarChart3, Users, CreditCard, 
  Briefcase, Package, Settings, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { SidebarItem } from './SidebarItem';
import { useAppStore } from '../../store/useAppStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const { currentUser, hasPermission } = useAuthStore();
  const { 
    isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, setIsSidebarCollapsed
  } = useAppStore();
  
  const { 
    isSettingsUnlocked, 
    setShowPasswordModal 
  } = useModalStore();

  const handleSettingsClick = () => {
    if (isSettingsUnlocked) {
      navigate('/settings');
    } else {
      setShowPasswordModal(true);
    }
    setIsSidebarOpen(false);
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col bg-bg-dark border-r border-white/5 transition-all duration-300 lg:static",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      isSidebarCollapsed ? "w-20" : "w-72"
    )}>
      {/* Sidebar Header */}
      <div className={cn(
        "h-20 flex items-center border-b border-white/5 transition-all duration-300",
        isSidebarCollapsed ? "justify-center px-0" : "px-6"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_-5px_rgba(17,82,212,0.5)] shrink-0">
            <span className="text-white font-black text-xl italic">F</span>
          </div>
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col"
              >
                <h1 className="text-lg font-black tracking-tighter leading-none italic">
                  {settings.appName.split(' ')[0]}
                  <span className="text-primary not-italic">{settings.appName.split(' ')[1] || ''}</span>
                </h1>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mt-0.5">Business Intelligence</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110 z-50"
        >
          {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-1 custom-scrollbar">
        <div className={cn(
          "px-4 overflow-hidden transition-all duration-300",
          isSidebarCollapsed ? "pt-2 pb-2" : "pt-4 pb-4"
        )}>
          {isSidebarCollapsed ? (
            <div className="h-px bg-white/5 w-full" />
          ) : (
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Principal</p>
          )}
        </div>

        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          to="/" 
          collapsed={isSidebarCollapsed}
          onClick={() => setIsSidebarOpen(false)} 
        />
        
        {hasPermission('view_transactions') && (
          <SidebarItem 
            icon={Receipt} 
            label="Transações" 
            to="/transactions" 
            collapsed={isSidebarCollapsed}
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
        
        {hasPermission('view_reports') && (
          <SidebarItem 
            icon={BarChart3} 
            label="Relatórios" 
            to="/reports" 
            collapsed={isSidebarCollapsed}
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        <div className={cn(
          "px-4 overflow-hidden transition-all duration-300",
          isSidebarCollapsed ? "pt-4 pb-2" : "pt-8 pb-4"
        )}>
          {isSidebarCollapsed ? (
            <div className="h-px bg-white/5 w-full" />
          ) : (
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Gestão</p>
          )}
        </div>

        {hasPermission('view_customers') && (
          <SidebarItem 
            icon={Users} 
            label="Clientes" 
            to="/customers" 
            collapsed={isSidebarCollapsed}
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
        
        {hasPermission('view_service_orders') && (
          <SidebarItem 
            icon={Briefcase} 
            label="Ordens de Serviço" 
            to="/service-orders" 
            collapsed={isSidebarCollapsed}
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
        
        {hasPermission('view_inventory') && (
          <SidebarItem 
            icon={Package} 
            label="Estoque" 
            to="/inventory" 
            collapsed={isSidebarCollapsed}
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
        
        {hasPermission('view_client_payments') && (
          <SidebarItem 
            icon={CreditCard} 
            label="Vendas e Pagamentos" 
            to="/client-payments" 
            collapsed={isSidebarCollapsed}
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
        
        <div className={cn(
          "px-4 overflow-hidden transition-all duration-300",
          isSidebarCollapsed ? "pt-4 pb-2" : "pt-8 pb-4"
        )}>
          {isSidebarCollapsed ? (
            <div className="h-px bg-white/5 w-full" />
          ) : (
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Sistema</p>
          )}
        </div>
        
        {hasPermission('manage_settings') && (
          <SidebarItem 
            icon={Settings} 
            label="Configurações" 
            to="/settings" 
            collapsed={isSidebarCollapsed}
            onClick={handleSettingsClick} 
          />
        )}

        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all duration-300 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 group relative",
            isSidebarCollapsed && "justify-center px-0 py-2.5"
          )}
        >
          <LogOut size={20} className="shrink-0" />
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
          {isSidebarCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
              Sair
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
            </div>
          )}
        </button>
      </nav>

      {/* Sidebar Footer (User Profile) */}
      <div className={cn(
        "border-t border-white/5 transition-all duration-300",
        isSidebarCollapsed ? "p-2" : "p-6"
      )}>
        <div className={cn(
          "flex items-center gap-4 rounded-2xl bg-white/5 border border-white/5 relative group hover:bg-white/10 transition-all",
          isSidebarCollapsed ? "justify-center p-1.5" : "p-3"
        )}>
          <div className={cn(
            "shrink-0 rounded-full bg-slate-700 overflow-hidden border-2 border-primary/20 transition-all",
            isSidebarCollapsed ? "h-9 w-9" : "h-10 w-10"
          )}>
            <img 
              src={settings.profileAvatar} 
              alt="Perfil" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-bold truncate">{currentUser?.name || settings.profileName}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {currentUser?.role === 'owner' ? 'Admin' : currentUser?.role === 'manager' ? 'Gerente' : 'Funcionário'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {isSidebarCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
              {currentUser?.name || settings.profileName}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
