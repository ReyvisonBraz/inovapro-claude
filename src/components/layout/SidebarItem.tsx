import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
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
      "flex items-center w-full rounded-xl transition-all duration-200 group relative",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
      collapsed ? "justify-center px-0 h-10" : "px-4 gap-3 h-11"
    )}
  >
    <Icon 
      size={collapsed ? 18 : 18} 
      className={cn(
        "transition-all duration-200 shrink-0", 
        active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
      )} 
    />
    
    <AnimatePresence mode="wait">
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          className="font-semibold text-sm tracking-tight whitespace-nowrap overflow-hidden"
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
