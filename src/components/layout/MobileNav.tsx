import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, CreditCard, Users, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Screen } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../hooks/useAuth';

export function MobileNav() {
  const { activeScreen, setActiveScreen } = useAppStore();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (screen: Screen, path: string) => {
    setActiveScreen(screen);
    navigate(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-dark/80 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around pb-safe">
      <button 
        onClick={() => handleNavigation('dashboard', '/dashboard')}
        className={cn(
          "flex flex-col items-center gap-1 p-2 transition-all",
          activeScreen === 'dashboard' ? "text-primary" : "text-slate-500"
        )}
      >
        <LayoutDashboard size={20} />
        <span className="text-xs font-black uppercase tracking-widest">Início</span>
      </button>
      
      {hasPermission('manage_service_orders') && (
        <button 
          onClick={() => handleNavigation('service-orders', '/ordens')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-all",
            activeScreen === 'service-orders' ? "text-primary" : "text-slate-500"
          )}
        >
          <Briefcase size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Ordens</span>
        </button>
      )}

      {hasPermission('manage_payments') && (
        <button 
          onClick={() => handleNavigation('client-payments', '/vendas')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-all",
            activeScreen === 'client-payments' ? "text-primary" : "text-slate-500"
          )}
        >
          <CreditCard size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Vendas</span>
        </button>
      )}

      {hasPermission('manage_customers') && (
        <button 
          onClick={() => handleNavigation('customers', '/clientes')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-all",
            activeScreen === 'customers' ? "text-primary" : "text-slate-500"
          )}
        >
          <Users size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Clientes</span>
        </button>
      )}

      {hasPermission('manage_inventory') && (
        <button 
          onClick={() => handleNavigation('inventory', '/estoque')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-all",
            activeScreen === 'inventory' ? "text-primary" : "text-slate-500"
          )}
        >
          <Package size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Estoque</span>
        </button>
      )}
    </div>
  );
}
