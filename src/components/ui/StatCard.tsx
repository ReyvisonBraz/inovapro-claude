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

const TRANSITION = 'all 200ms ease';
const VS_MONTH_LABEL = 'vs mês anterior';

const neonColors = {
  up: {
    glow: 'rgba(16, 185, 129, 0.5)',
    glowIntense: 'rgba(16, 185, 129, 0.8)',
    textShadow: '0 0 10px rgba(16, 185, 129, 0.7), 0 0 20px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.3)',
    border: 'rgba(16, 185, 129, 0.3)',
    progressGlow: '0 0 10px rgba(16, 185, 129, 0.8)',
  },
  down: {
    glow: 'rgba(244, 63, 94, 0.5)',
    glowIntense: 'rgba(244, 63, 94, 0.8)',
    textShadow: '0 0 10px rgba(244, 63, 94, 0.7), 0 0 20px rgba(244, 63, 94, 0.5), 0 0 30px rgba(244, 63, 94, 0.3)',
    border: 'rgba(244, 63, 94, 0.3)',
    progressGlow: '0 0 10px rgba(244, 63, 94, 0.8)',
  },
};

export const StatCard = ({ title, value, change, trend, icon: Icon, progress = 60 }: StatCardProps) => {
  const colors = neonColors[trend];
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="glass-card p-8 flex flex-col gap-6 group cursor-default"
      style={{
        boxShadow: isHovered
          ? `0 0 25px ${colors.glowIntense}, 0 0 50px ${colors.glowIntense}, inset 0 0 20px rgba(0,0,0,0.3)`
          : `0 0 15px ${colors.glow}, 0 0 30px ${colors.glow}, inset 0 0 20px rgba(0,0,0,0.3)`,
        transition: TRANSITION,
      }}
    >
      <div className="flex justify-between items-start">
        <div
          className="p-4 rounded-2xl border transition-all duration-200 group-hover:scale-110"
          style={{
            borderColor: colors.border,
            boxShadow: `0 0 10px ${colors.glow}`,
            transition: TRANSITION,
          }}
        >
          <Icon size={24} />
        </div>
        <div
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-black tracking-widest flex items-center gap-1.5"
          )}
          style={{
            color: trend === 'up' ? '#10b981' : '#f43f5e',
            textShadow: colors.textShadow,
            border: `1px solid ${colors.border}`,
            backgroundColor: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            boxShadow: `0 0 10px ${colors.glow}`,
            transition: TRANSITION,
          }}
        >
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </div>
      </div>
      <div>
        <p
          className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1"
          style={{
            textShadow: '0 0 10px rgba(148, 163, 184, 0.5)',
            transition: TRANSITION,
          }}
        >
          {title}
        </p>
        <h3
          className="text-3xl font-black tracking-tighter text-white"
          style={{
            textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)',
            transition: TRANSITION,
          }}
        >
          {formatCurrency(value)}
        </h3>
        <div className="flex items-center gap-2 mt-3">
          <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", trend === 'up' ? "bg-emerald-500" : "bg-rose-500")}
              style={{
                width: `${progress}%`,
                boxShadow: colors.progressGlow,
                transition: TRANSITION,
              }}
            ></div>
          </div>
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">{VS_MONTH_LABEL}</p>
        </div>
      </div>
    </motion.div>
  );
};
