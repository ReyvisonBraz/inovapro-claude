import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to?: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

export const SidebarItem = React.memo(({ 
  icon: Icon, 
  label, 
  to,
  active, 
  collapsed,
  onClick 
}: SidebarItemProps) => {
  const content = (
    <>
      <Icon size={20} className={cn("shrink-0 transition-all duration-300 group-hover:scale-110")} />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
          {label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
        </div>
      )}
    </>
  );

  const baseClasses = cn(
    "flex items-center gap-3 w-full transition-all duration-300 group relative",
    collapsed ? "justify-center px-0 py-2.5" : "px-4 py-3.5 rounded-2xl border"
  );

  const activeClasses = "bg-primary/10 text-primary border-primary/20 shadow-[0_0_20px_rgba(17,82,212,0.1)]";
  const inactiveClasses = "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200 border-transparent hover:border-white/5";

  if (to) {
    return (
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
      >
        {({ isActive }) => (
          <>
            {isActive && !collapsed && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
              />
            )}
            <Icon size={20} className={cn("shrink-0 transition-all duration-300 group-hover:scale-110", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            {collapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
                {label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
              </div>
            )}
          </>
        )}
      </NavLink>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(baseClasses, active ? activeClasses : inactiveClasses)}
    >
      {active && !collapsed && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
        />
      )}
      <Icon size={20} className={cn("shrink-0 transition-all duration-300 group-hover:scale-110", active ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
          {label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
        </div>
      )}
    </button>
  );
});

export default SidebarItem;
