import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
}

export const StatCard = ({ title, value, change, trend, icon: Icon, color }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="glass-card p-8 flex flex-col gap-6 group cursor-default"
  >
    <div className="flex justify-between items-start">
      <div className={cn("p-4 rounded-2xl border border-white/5 transition-all duration-500 group-hover:border-white/10 group-hover:scale-110", color)}>
        <Icon size={24} />
      </div>
      <div className={cn(
        "px-3 py-1.5 rounded-full text-xs font-black tracking-widest flex items-center gap-1.5 shadow-sm",
        trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
      )}>
        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black tracking-tighter text-white">{formatCurrency(value)}</h3>
      <div className="flex items-center gap-2 mt-3">
        <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full", trend === 'up' ? "bg-emerald-500" : "bg-rose-500")} style={{ width: '60%' }}></div>
        </div>
        <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">vs mês anterior</p>
      </div>
    </div>
  </motion.div>
);
