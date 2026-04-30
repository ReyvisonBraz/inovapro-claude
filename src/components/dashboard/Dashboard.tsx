import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, TrendingUp, TrendingDown, Wallet, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from 'recharts';
import { StatCard } from '../ui/StatCard';
import { DraggableGrid } from '../ui/DraggableGrid';
import { NeonChart, NeonTooltip } from '../ui/NeonChart';
import { formatCurrency, formatMonthYear } from '../../lib/utils';

import { useFilterStore } from '../../store/useFilterStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppStore } from '../../store/useAppStore';

interface DashboardProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  chartData: { name?: string; [key: string]: unknown }[];
  handleChartClick: (data: { name?: string; value?: number; payload?: Record<string, unknown> }) => void;
  sortedIncomeRanking: [string, number][];
  sortedExpenseRanking: [string, number][];
}

export const Dashboard = ({
  totalIncome,
  totalExpenses,
  netBalance,
  chartData,
  handleChartClick,
  sortedIncomeRanking,
  sortedExpenseRanking
}: DashboardProps) => {
  const { settings } = useSettingsStore();
  const { fontSize } = useAppStore();
  const { dashboardMonth, handlePrevMonth, handleNextMonth } = useFilterStore();

  const [selectedPeriod, setSelectedPeriod] = useState('12m');

  const filteredChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    
    const now = new Date();
    let cutoffDate: Date;

    switch (selectedPeriod) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '12m':
      default:
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return chartData.filter((item: { name?: string }) => {
      if (!item.name) return true;
      const itemDate = new Date(item.name);
      return itemDate >= cutoffDate;
    });
  }, [chartData, selectedPeriod]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const initialCards = useMemo(() => [
    { id: 'initial-balance', content: <StatCard title="Saldo Inicial" value={settings.initialBalance} change="Configurado" trend="up" icon={Briefcase} /> },
    { id: 'total-income', content: <StatCard title="Renda Total" value={totalIncome} change="+12.4%" trend="up" icon={TrendingUp} /> },
    { id: 'total-expenses', content: <StatCard title="Despesas Totais" value={totalExpenses} change="-5.2%" trend="down" icon={TrendingDown} /> },
    { id: 'net-balance', content: <StatCard title="Saldo Líquido" value={netBalance} change="+18.1%" trend="up" icon={Wallet} /> },
  ], [settings.initialBalance, totalIncome, totalExpenses, netBalance]);

  const [cards, setCards] = useState(initialCards);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  return (
    <>
      {/* Stats Grid */}
      <DraggableGrid
        items={cards}
        onReorder={setCards}
        storageKey="stat-cards"
      />

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <NeonChart
          title="Tendência de Fluxo de Caixa"
          subtitle="Desempenho de flutuação mensal"
          period={selectedPeriod}
          periods={['7d', '30d', '90d', '12m']}
          onPeriodChange={handlePeriodChange}
          onChartClick={handleChartClick}
        >
          <AreaChart data={filteredChartData}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1152d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1152d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: Math.max(10, fontSize * 0.625), fontWeight: 600 }} 
              dy={10}
            />
            <YAxis hide />
            <Tooltip content={<NeonTooltip />} />
            <Area 
              type="monotone"
              dataKey="income"
              stroke="#1152d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorIncome)"
            />
          </AreaChart>
        </NeonChart>

        <NeonChart
          title="Comparação Mensal"
          subtitle="Detalhamento de Renda vs Despesas"
          period={selectedPeriod}
          periods={['7d', '30d', '90d', '12m']}
          onPeriodChange={handlePeriodChange}
          onChartClick={handleChartClick}
        >
          <BarChart data={filteredChartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: Math.max(10, fontSize * 0.625), fontWeight: 600 }} 
              dy={10}
            />
            <YAxis hide />
            <Tooltip content={<NeonTooltip />} cursor={{ fill: '#ffffff05' }} />
            <Bar dataKey="income" fill="#1152d4" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
          </BarChart>
        </NeonChart>
      </div>

      {/* Rankings Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 md:p-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h4 className="text-base md:text-lg font-bold">Ranking de Entradas</h4>
              <p className="text-xs text-slate-500 font-medium">Categorias mais rentáveis</p>
            </div>
            <div className="flex items-center justify-between sm:justify-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1 w-full sm:w-auto">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest min-w-[100px] text-center">
                {formatMonthYear(dashboardMonth)}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {sortedIncomeRanking.map(([category, amount], index) => (
              <div key={category} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">{category}</span>
                    <span className="text-sm font-black text-emerald-500">{formatCurrency(amount as number)}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((amount as number) / Math.max(1, ...sortedIncomeRanking.map(([, a]) => a as number))) * 100}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            {sortedIncomeRanking.length === 0 && (
              <p className="text-center text-slate-500 text-sm italic py-10">Nenhuma entrada registrada para este mês.</p>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 md:p-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h4 className="text-base md:text-lg font-bold">Ranking de Saídas</h4>
              <p className="text-xs text-slate-500 font-medium">Maiores despesas por categoria</p>
            </div>
            <div className="flex items-center justify-between sm:justify-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1 w-full sm:w-auto">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest min-w-[100px] text-center">
                {formatMonthYear(dashboardMonth)}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {sortedExpenseRanking.map(([category, amount], index) => (
              <div key={category} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">{category}</span>
                    <span className="text-sm font-black text-rose-500">{formatCurrency(amount as number)}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((amount as number) / Math.max(1, ...sortedExpenseRanking.map(([, a]) => a as number))) * 100}%` }}
                      className="h-full bg-rose-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            {sortedExpenseRanking.length === 0 && (
              <p className="text-center text-slate-500 text-sm italic py-10">Nenhuma saída registrada para este mês.</p>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};
