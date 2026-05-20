import React from 'react';
import { motion } from 'motion/react';
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
        ? "bg-primary/15 text-primary shadow-sm"
        : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
      collapsed ? "justify-center h-12" : "px-3.5 gap-3 h-12"
    )}
  >
    <Icon
      size={20}
      className={cn(
        "transition-all duration-200 shrink-0",
        active ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
      )}
    />

    {!collapsed && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="font-semibold text-sm tracking-tight whitespace-nowrap overflow-hidden flex-1 min-w-0"
      >
        {label}
      </motion.span>
    )}

    {active && !collapsed && (
      <motion.div
        layoutId="sidebar-active"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
      />
    )}

    {collapsed && (
      <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
        {label}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
      </div>
    )}
  </button>
);
