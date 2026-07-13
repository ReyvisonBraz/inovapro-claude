import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, Wrench, CreditCard, Users, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Screen } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  screen: Screen;
  permission?: string;
}

export function MobileNav() {
  const { setActiveScreen } = useAppStore();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = [
    { icon: LayoutDashboard, label: 'Início', path: '/dashboard', screen: 'dashboard', permission: 'view_dashboard' },
    { icon: Wrench, label: 'Ordens', path: '/ordens', screen: 'service-orders', permission: 'manage_service_orders' },
    { icon: CreditCard, label: 'Vendas', path: '/vendas', screen: 'client-payments', permission: 'manage_payments' },
    { icon: Users, label: 'Clientes', path: '/clientes', screen: 'customers', permission: 'manage_customers' },
    { icon: Package, label: 'Estoque', path: '/estoque', screen: 'inventory', permission: 'manage_inventory' },
  ];

  const visibleItems = items.filter(item => !item.permission || hasPermission(item.permission));

  const handleNavigation = (path: string, screen: Screen) => {
    setActiveScreen(screen);
    navigate(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-elevated/95 border-t border-white/[0.06] [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-1 sm:px-2">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path, item.screen)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 min-w-0 w-full h-full transition-all",
                "active:scale-90"
              )}
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute rounded-full bg-primary/15"
                    style={{ width: 52, height: 28 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon size={19} className={cn(
                  "relative z-10 transition-colors duration-300",
                  isActive ? "text-primary" : "text-slate-500"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-wider transition-colors duration-300",
                isActive ? "text-primary" : "text-slate-500"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
