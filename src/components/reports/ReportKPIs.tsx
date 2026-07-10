import React from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown, Minus as MinusIcon, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, FileText, DollarSign } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import type { KPICard } from '../../hooks/useReportData';

export const ReportKPIs: React.FC<{ kpis: KPICard[] }> = ({ kpis }) => {
  const formatValue = (value: number, fmt: string) => {
    switch (fmt) {
      case 'currency': return formatCurrency(value);
      case 'percent': return `${value.toFixed(1)}%`;
      default: return value.toLocaleString('pt-BR');
    }
  };

  const iconFor = (id: string, color: string) => {
    if (id === 'income') return <ArrowUpRight className="text-emerald-500" />;
    if (id === 'expense') return <ArrowDownRight className="text-rose-500" />;
    if (id === 'balance') return color === 'emerald' ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-rose-500" />;
    if (id === 'count') return <FileText className="text-blue-500" />;
    return <DollarSign className="text-purple-500" />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map(kpi => {
        const trendColor = kpi.trend === 'up' ? 'text-emerald-500' : kpi.trend === 'down' ? 'text-rose-500' : 'text-slate-400';
        const trendIcon = kpi.trend === 'up' ? <ChevronUp size={16} /> : kpi.trend === 'down' ? <ChevronDown size={16} /> : <MinusIcon size={16} />;
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'glass-card p-6 relative overflow-hidden border-l-4',
              kpi.color === 'emerald' && 'border-l-emerald-500',
              kpi.color === 'rose' && 'border-l-rose-500',
              kpi.color === 'blue' && 'border-l-blue-500',
              kpi.color === 'purple' && 'border-l-purple-500',
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className={cn(
                  'text-2xl font-black',
                  kpi.color === 'emerald' && 'text-emerald-500',
                  kpi.color === 'rose' && 'text-rose-500',
                  kpi.color === 'blue' && 'text-blue-500',
                  kpi.color === 'purple' && 'text-purple-500',
                )}>
                  {formatValue(kpi.value, kpi.format)}
                </p>
                {kpi.previousValue !== undefined && (
                  <div className={cn('flex items-center gap-1 mt-1', trendColor)}>
                    {trendIcon}
                    <span className="text-xs font-bold">
                      {Math.abs(kpi.trend === 'up'
                        ? ((kpi.value - kpi.previousValue) / kpi.previousValue * 100)
                        : kpi.previousValue > 0
                          ? ((kpi.value - kpi.previousValue) / kpi.previousValue * 100)
                          : 0
                      ).toFixed(1)}%
                    </span>
                    <span className="text-slate-500 text-xs">vs período anterior</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white/5 rounded-xl">{iconFor(kpi.id, kpi.color)}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};