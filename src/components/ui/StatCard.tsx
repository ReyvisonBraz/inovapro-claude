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
  progress?: number;
}

export const StatCard = ({ title, value, change, trend, icon: Icon, progress }: StatCardProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const isUp = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "glass-card p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 group cursor-default transition-all duration-300",
        isHovered && "border-white/[0.12]"
      )}
      style={{
        boxShadow: isHovered
          ? `0 0 30px rgba(${isUp ? '16,185,129' : '244,63,94'}, 0.12), 0 8px 32px rgba(0,0,0,0.3)`
          : '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className={cn(
          "p-2.5 sm:p-3 rounded-xl border transition-all duration-300 group-hover:scale-105",
          isUp ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        )}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          "border transition-all duration-300",
          isUp
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        )}>
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {change}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
          {formatCurrency(value)}
        </h3>
        {progress !== undefined && (
          <div className="flex items-center gap-2 pt-1">
            <div className="h-1 w-16 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", isUp ? "bg-emerald-500" : "bg-rose-500")}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">vs mês anterior</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
