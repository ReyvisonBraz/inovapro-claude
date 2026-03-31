import React from 'react';
import { LayoutDashboard, Briefcase, CreditCard, Users, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';
import { useAuthStore } from '../store/useAuthStore';

interface MobileNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

export function MobileNav({ activeScreen, setActiveScreen }: MobileNavProps) {
  const { hasPermission } = useAuthStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-dark/80 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around pb-safe">
      <button 
        onClick={() => setActiveScreen('dashboard')}
        className={cn(
          "flex flex-col items-center gap-1 p-2 transition-all",
          activeScreen === 'dashboard' ? "text-primary" : "text-slate-500"
        )}
      >
        <LayoutDashboard size={20} />
        <span className="text-[8px] font-black uppercase tracking-widest">Início</span>
      </button>
      
      {hasPermission('service-orders') && (
        <button 
          onClick={() => setActiveScreen('service-orders')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-all",
            activeScreen === 'service-orders' ? "text-primary" : "text-slate-500"
          )}
        >
          <Briefcase size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Ordens</span>
        </button>
      )}

      {hasPermission('client-payments') && (
        <button 
          onClick={() => setActiveScreen('client-payments')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-all",
            activeScreen === 'client-payments' ? "text-primary" : "text-slate-500"
          )}
        >
          <CreditCard size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Vendas</span>
        </button>
      )}

      {hasPermission('customers') && (
        <button 
          onClick={() => setActiveScreen('customers')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-all",
            activeScreen === 'customers' ? "text-primary" : "text-slate-500"
          )}
        >
          <Users size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Clientes</span>
        </button>
      )}

      {hasPermission('inventory') && (
        <button 
          onClick={() => setActiveScreen('inventory')}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-all",
            activeScreen === 'inventory' ? "text-primary" : "text-slate-500"
          )}
        >
          <Package size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Estoque</span>
        </button>
      )}
    </div>
  );
}
