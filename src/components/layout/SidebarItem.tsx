import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export const SidebarItem = React.memo(({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
      active 
        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(17,82,212,0.1)]" 
        : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent hover:border-white/5"
    )}
  >
    {active && (
      <motion.div 
        layoutId="sidebar-active"
        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
      />
    )}
    <Icon size={20} className={cn("transition-all duration-300 group-hover:scale-110", active ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
));

export default SidebarItem;
