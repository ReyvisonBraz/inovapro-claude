import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, TrendingUp, TrendingDown, Wallet, Users, Wrench, 
  ChevronLeft, ChevronRight, ArrowRight, Clock, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from 'recharts';
import { StatCard } from '../ui/StatCard';
import { DraggableGrid } from '../ui/DraggableGrid';
import { NeonChart, NeonTooltip } from '../ui/NeonChart';
import { formatCurrency, formatMonthYear } from '../../lib/utils';
import { useFilterStore } from '../../store/useFilterStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

interface DashboardProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  chartData: { name?: string; [key: string]: unknown }[];
  handleChartClick: (data: { name?: string; value?: number; payload?: Record<string, unknown> }) => void;
  sortedIncomeRanking: [string, number][];
  sortedExpenseRanking: [string, number][];
  pendingPayments: number;
  activeOS: number;
  recentTransactions: any[];
}

export const Dashboard = ({
  totalIncome, totalExpenses, netBalance,
  chartData, handleChartClick,
  sortedIncomeRanking, sortedExpenseRanking,
  pendingPayments, activeOS, recentTransactions,
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
      case '7d': cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      default: cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
    }
    return chartData.filter((item: { name?: string }) => {
      if (!item.name) return true;
      return new Date(item.name) >= cutoffDate;
    });
  }, [chartData, selectedPeriod]);

  const initialCards = useMemo(() => [
    { id: 'initial-balance', content: <StatCard title="Saldo Inicial" value={settings.initialBalance} change="Configurado" trend="up" icon={Briefcase} /> },
    { id: 'total-income', content: <StatCard title="Renda Total" value={totalIncome} change="+12.4%" trend="up" icon={TrendingUp} /> },
    { id: 'total-expenses', content: <StatCard title="Despesas Totais" value={totalExpenses} change="-5.2%" trend="down" icon={TrendingDown} /> },
    { id: 'net-balance', content: <StatCard title="Saldo Líquido" value={netBalance} change="+18.1%" trend="up" icon={Wallet} /> },
  ], [settings.initialBalance, totalIncome, totalExpenses, netBalance]);

  const [cards, setCards] = useState(initialCards);

  useEffect(() => { setCards(initialCards); }, [initialCards]);

  const hasAlerts = pendingPayments > 0 || activeOS > 0;
  const pendingTotal = Array.isArray(recentTransactions)
    ? recentTransactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + Number(t.amount), 0)
    : 0;

  return (
    <>
      {/* Alert Banners */}
      {hasAlerts && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-4">
          {pendingPayments > 0 && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{pendingPayments} pagamento(s) pendente(s) — <span className="text-amber-300">ver cobranças</span></span>
            </div>
          )}
          {activeOS > 0 && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
              <Wrench size={18} className="shrink-0" />
              <span>{activeOS} ordem(ns) de serviço ativa(s) — <span className="text-cyan-300">ver oficina</span></span>
            </div>
          )}
        </motion.div>
      )}

      {/* Stats Grid */}
      <DraggableGrid items={cards} onReorder={setCards} storageKey="stat-cards" />

      {/* Quick status row */}
      <div className="responsive-grid-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pagamentos Pendentes</p>
            <p className="text-2xl font-bold font-display text-white">{pendingPayments}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Wrench size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">OS em Andamento</p>
            <p className="text-2xl font-bold font-display text-white">{activeOS}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Clientes em Dia</p>
            <p className="text-2xl font-bold font-display text-white">{recentTransactions?.length || 0}</p>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="responsive-grid-2">
        <NeonChart title="Tendência de Fluxo de Caixa" subtitle="Desempenho de flutuação mensal"
          period={selectedPeriod} periods={['7d', '30d', '90d', '12m']}
          onPeriodChange={setSelectedPeriod} onChartClick={handleChartClick}
        >
          <AreaChart data={filteredChartData}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1152d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1152d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis dataKey="name" axisLine={false} tickLine={false}
              tick={{ fill: '#64748b', fontSize: Math.max(10, fontSize * 0.625), fontWeight: 600 }} dy={10} />
            <YAxis hide />
            <Tooltip content={<NeonTooltip />} />
            <Area type="monotone" dataKey="income" stroke="#1152d4" strokeWidth={3}
              fillOpacity={1} fill="url(#colorIncome)" />
          </AreaChart>
        </NeonChart>

        <NeonChart title="Comparação Mensal" subtitle="Detalhamento de Renda vs Despesas"
          period={selectedPeriod} periods={['7d', '30d', '90d', '12m']}
          onPeriodChange={setSelectedPeriod} onChartClick={handleChartClick}
        >
          <BarChart data={filteredChartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis dataKey="name" axisLine={false} tickLine={false}
              tick={{ fill: '#64748b', fontSize: Math.max(10, fontSize * 0.625), fontWeight: 600 }} dy={10} />
            <YAxis hide />
            <Tooltip content={<NeonTooltip />} cursor={{ fill: '#ffffff05' }} />
            <Bar dataKey="income" fill="#1152d4" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
          </BarChart>
        </NeonChart>
      </div>

      {/* Bottom row: Rankings + Recent Transactions */}
      <div className="responsive-grid-2">
        {/* Income Ranking */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h4 className="text-base md:text-lg font-bold">Ranking de Entradas</h4>
              <p className="text-xs text-slate-500 font-medium">Categorias mais rentáveis</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
              <span className="text-xs font-bold uppercase tracking-widest min-w-[100px] text-center">{formatMonthYear(dashboardMonth)}</span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="space-y-6">
            {sortedIncomeRanking.map(([category, amount], index) => (
              <div key={category} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">{index + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">{category}</span>
                    <span className="text-sm font-black text-emerald-500">{formatCurrency(amount as number)}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${((amount as number) / Math.max(1, ...sortedIncomeRanking.map(([, a]) => a as number))) * 100}%` }}
                      className="h-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            ))}
            {sortedIncomeRanking.length === 0 && (
              <p className="text-center text-slate-500 text-sm italic py-10">Nenhuma entrada registrada para este mês.</p>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base md:text-lg font-bold">Últimas Movimentações</h4>
              <p className="text-xs text-slate-500 font-medium">Transações recentes</p>
            </div>
            <ArrowRight size={18} className="text-slate-500" />
          </div>
          <div className="space-y-1">
            {(!recentTransactions || recentTransactions.length === 0) ? (
              <p className="text-center text-slate-500 text-sm italic py-10">Nenhuma transação recente.</p>
            ) : (
              recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0",
                    tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  )}>
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{tx.description || 'Sem descrição'}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{tx.category} · {tx.date}</p>
                  </div>
                  <span className={cn(
                    "text-sm font-black shrink-0",
                    tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};
