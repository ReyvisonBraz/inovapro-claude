import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

export const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick,
  collapsed = false
}: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full rounded-2xl transition-all duration-300 group relative",
      active 
        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(17,82,212,0.1)]" 
        : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent hover:border-white/5",
      collapsed ? "justify-center px-0 h-10" : "px-4 gap-3 h-12"
    )}
  >
    {active && (
      <motion.div 
        layoutId="sidebar-active"
        className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full z-10"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    
    <Icon 
      size={collapsed ? 18 : 20} 
      className={cn(
        "transition-all duration-300 shrink-0", 
        active ? "text-primary scale-110" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110"
      )} 
    />
    
    <AnimatePresence mode="wait">
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10, width: 0 }}
          animate={{ opacity: 1, x: 0, width: "auto" }}
          exit={{ opacity: 0, x: -10, width: 0 }}
          transition={{ duration: 0.2 }}
          className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>

    {collapsed && (
      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
        {label}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
      </div>
    )}
  </button>
);
