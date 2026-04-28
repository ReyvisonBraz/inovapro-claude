import React from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface ChartClickData {
  name?: string;
  value?: number;
  payload?: Record<string, unknown>;
}

interface NeonChartProps {
  children: React.ReactNode;
  period?: string;
  onPeriodChange?: (period: string) => void;
  onChartClick?: (data: ChartClickData) => void;
  title: string;
  subtitle: string;
  periods?: string[];
}

const PERIOD_OPTIONS = ['7d', '30d', '90d', '12m'];

const PERIOD_LABELS: Record<string, string> = {
  '7d': '7 Dias',
  '30d': '30 Dias',
  '90d': '90 Dias',
  '12m': '12 Meses',
};

export const NeonChart: React.FC<NeonChartProps> = ({
  children,
  period = '12m',
  onPeriodChange,
  onChartClick,
  title,
  subtitle,
  periods = PERIOD_OPTIONS,
}) => {
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPeriodChange?.(e.target.value);
  };

  const handleChartClick = (data: ChartClickData) => {
    onChartClick?.(data);
  };

  const handleChildClick = (props: { activePayload?: Array<{ payload: ChartClickData }> }) => {
    if (props && props.activePayload && onChartClick) {
      onChartClick(props.activePayload[0]?.payload);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4 md:p-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h4 className="text-base md:text-lg font-bold">{title}</h4>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
        <select
          value={period}
          onChange={handlePeriodChange}
          className="bg-slate-800 border border-primary/30 rounded-xl text-xs font-bold uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900 w-full sm:w-auto cursor-pointer hover:border-primary/50 transition-colors"
        >
          {periods.map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABELS[p] || p}
            </option>
          ))}
        </select>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(child as React.ReactElement<{ onClick?: (props: { activePayload?: Array<{ payload: ChartClickData }> }) => void }>, {
              onClick: handleChildClick,
            });
          })}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

interface NeonTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload?: any;
  }>;
  label?: string;
}

export const NeonTooltip: React.FC<NeonTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-primary/30 rounded-xl p-4 shadow-[0_0_20px_rgba(17,82,212,0.15)]">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
          />
          <span className="text-sm text-slate-300 font-medium">{entry.name}:</span>
          <span className="text-sm font-black text-white" style={{ textShadow: `0 0 10px ${entry.color}50` }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
      {payload[0]?.payload?.date && (
        <p className="text-xs text-slate-500 mt-2">{payload[0].payload.date}</p>
      )}
    </div>
  );
};