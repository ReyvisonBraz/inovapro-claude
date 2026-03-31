import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, CreditCard, Users, Package } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Início' },
    { to: '/service-orders', icon: Briefcase, label: 'Ordens' },
    { to: '/client-payments', icon: CreditCard, label: 'Vendas' },
    { to: '/customers', icon: Users, label: 'Clientes' },
    { to: '/inventory', icon: Package, label: 'Estoque' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-dark/80 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around pb-safe">
      {navItems.map((item) => (
        <NavLink 
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 p-2 transition-all",
            isActive ? "text-primary" : "text-slate-500"
          )}
        >
          <item.icon size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};
