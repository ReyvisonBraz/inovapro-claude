import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, Wallet, Wrench, Package,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus, Minus,
} from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, BarChart, Bar } from 'recharts';
import { StatCard } from '../ui/StatCard';
import { DraggableGrid } from '../ui/DraggableGrid';
import { NeonChart, NeonTooltip } from '../ui/NeonChart';
import { formatCurrency, formatMonthYear } from '../../lib/utils';
import { useFilterStore } from '../../store/useFilterStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

interface DashboardProps {
  totalIncome: number; totalExpenses: number; netBalance: number;
  chartData: { name?: string; [key: string]: unknown }[];
  handleChartClick: (d: any) => void;
  sortedIncomeRanking: [string, number][];
  sortedExpenseRanking: [string, number][];
  pendingPayments: number; activeOS: number; recentTransactions: any[];
  monthIncome: number; monthExpenses: number; monthNet: number;
  monthOSCount: number; osStatusCount: Record<string, number>;
  topProducts: { name: string; qty: number; revenue: number }[];
}

export const Dashboard = ({
  totalIncome, totalExpenses, netBalance,
  chartData, handleChartClick,
  sortedIncomeRanking, sortedExpenseRanking,
  pendingPayments, activeOS, recentTransactions,
  monthIncome, monthExpenses, monthNet,
  monthOSCount, osStatusCount,
  topProducts,
}: DashboardProps) => {
  const { settings } = useSettingsStore();
  const { fontSize } = useAppStore();
  const { dashboardMonth, handlePrevMonth, handleNextMonth } = useFilterStore();
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [showMore, setShowMore] = useState(false);

  const filteredChartData = React.useMemo(() => {
    if (!chartData?.length) return [];
    const now = new Date();
    let cutoff: Date;
    switch (selectedPeriod) {
      case '7d': cutoff = new Date(now.getTime() - 7 * 864e5); break;
      case '30d': cutoff = new Date(now.getTime() - 30 * 864e5); break;
      case '90d': cutoff = new Date(now.getTime() - 90 * 864e5); break;
      default: cutoff = new Date(now.getTime() - 365 * 864e5);
    }
    return chartData.filter((i: any) => !i.name || new Date(i.name) >= cutoff);
  }, [chartData, selectedPeriod]);

  const netColor = monthNet >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const netBg = monthNet >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';
  const netIcon = monthNet >= 0 ? TrendingUp : TrendingDown;

  const initialCards = React.useMemo(() => [
    { id: 'income', content: <StatCard title="Renda Total" value={totalIncome} change="Acumulado" trend="up" icon={TrendingUp} /> },
    { id: 'expenses', content: <StatCard title="Despesas Totais" value={totalExpenses} change="Acumulado" trend="down" icon={TrendingDown} /> },
    { id: 'balance', content: <StatCard title="Saldo Líquido" value={netBalance} change="Geral" trend={netBalance >= 0 ? 'up' : 'down'} icon={Wallet} /> },
    { id: 'pending', content: <StatCard title="Pagtes. Pendentes" value={pendingPayments} change="Aguardando" trend="down" icon={Wallet} /> },
  ], [totalIncome, totalExpenses, netBalance, pendingPayments]);

  const [cards, setCards] = useState(initialCards);
  React.useEffect(() => {
    setCards(prev =>
      prev.map(card => initialCards.find(c => c.id === card.id) ?? card)
    );
  }, [initialCards]);

  return (
    <div className="space-y-5">

      {/* ═══ HERO: Income vs Expense — MÊS SELECIONADO ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0c1322] via-[#0f1a2e] to-[#0c1322] p-4 sm:p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Resumo do Mês</span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-display text-white truncate">{formatMonthYear(dashboardMonth)}</h2>
          </div>
          <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-xl border border-white/[0.06] p-1 shrink-0">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
            <span className="text-xs font-bold uppercase tracking-widest min-w-[80px] sm:min-w-[100px] text-center text-slate-300 hidden sm:block">{formatMonthYear(dashboardMonth)}</span>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Big numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Income */}
          <div className="glass-card p-4 sm:p-5 md:p-6 bg-emerald-500/[0.03] border-emerald-500/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0"><TrendingUp size={16} className="text-emerald-400" /></div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Entradas</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white tracking-tight break-all">{formatCurrency(monthIncome)}</p>
            <div className="h-1.5 w-full bg-white/[0.04] rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, monthIncome / Math.max(1, monthIncome + monthExpenses) * 100)}%` }} />
            </div>
          </div>

          {/* Expenses */}
          <div className="glass-card p-4 sm:p-5 md:p-6 bg-rose-500/[0.03] border-rose-500/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 shrink-0"><TrendingDown size={16} className="text-rose-400" /></div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">Saídas</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white tracking-tight break-all">{formatCurrency(monthExpenses)}</p>
            <div className="h-1.5 w-full bg-white/[0.04] rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, monthExpenses / Math.max(1, monthIncome + monthExpenses) * 100)}%` }} />
            </div>
          </div>

          {/* Net */}
          <div className={cn("glass-card p-4 sm:p-5 md:p-6", netBg)}>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("p-2 rounded-lg shrink-0", monthNet >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
                <Plus size={16} className={netColor} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Saldo do Mês</span>
            </div>
            <p className={cn("text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight break-all", netColor)}>
              {monthNet >= 0 ? '+' : ''}{formatCurrency(monthNet)}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-xs font-medium text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">Receita: {formatCurrency(monthIncome)}</span>
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="truncate">Despesa: {formatCurrency(monthExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Quick metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-5">
          {[
            { icon: Wrench, color: 'text-cyan-400', label: 'OS no Mês', value: monthOSCount },
            { icon: Package, color: 'text-amber-400', label: 'Serv./Peças', value: topProducts?.length || 0 },
            { icon: TrendingUp, color: 'text-emerald-400', label: 'Média Entrada', value: monthOSCount > 0 ? (monthIncome / Math.max(1, monthOSCount)).toFixed(0) : 0 },
            { icon: TrendingDown, color: 'text-rose-400', label: 'Média Saída', value: monthOSCount > 0 ? (monthExpenses / Math.max(1, monthOSCount)).toFixed(0) : 0 },
          ].map(({ icon: Icon, color, label, value }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] min-w-0">
              <Icon size={15} className={cn(color, 'shrink-0')} />
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">{label}</p>
                <p className="text-sm sm:text-base font-bold text-white truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ TOP PRODUTOS + OS STATUS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 md:p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Serviços & Produtos</h3>
              <p className="text-[11px] text-slate-500 font-medium">Os que mais saíram</p>
            </div>
          </div>
          <div className="space-y-1">
            {(!topProducts || topProducts.length === 0) ? (
              <p className="text-center text-slate-500 text-sm italic py-8">Nenhum serviço ou produto registrado.</p>
            ) : (
              topProducts.map((p, i) => {
                const maxQty = topProducts[0]?.qty || 1;
                return (
                  <div key={p.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <span className="w-6 h-6 rounded-lg bg-white/[0.05] text-slate-500 flex items-center justify-center text-[11px] font-black shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold truncate">{p.name}</span>
                        <span className="text-sm font-black text-amber-400 shrink-0 ml-3">{p.qty}x</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(p.qty / maxQty) * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium mt-0.5">{formatCurrency(p.revenue)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* OS Status Breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 md:p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Wrench size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ordens de Serviço</h3>
              <p className="text-[11px] text-slate-500 font-medium">{monthOSCount} nova(s) no período</p>
            </div>
          </div>
          <div className="space-y-2">
            {Object.keys(osStatusCount).length === 0 ? (
              <p className="text-center text-slate-500 text-sm italic py-8">Nenhuma OS no período.</p>
            ) : (
              Object.entries(osStatusCount)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const colors: Record<string, string> = {
                    'Aguardando Análise': 'bg-amber-500 text-amber-400',
                    'Em Andamento': 'bg-cyan-500 text-cyan-400',
                    'Concluído': 'bg-emerald-500 text-emerald-400',
                    'Cancelado': 'bg-rose-500 text-rose-400',
                    'Entregue': 'bg-violet-500 text-violet-400',
                  };
                  const barColor = Object.values(colors).find(c => c.includes(status?.toLowerCase()?.slice(0, 5))) || 'bg-slate-500 text-slate-400';
                  const c = colors[status] || 'bg-slate-500/10 text-slate-400';
                  return (
                    <div key={status} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02]">
                      <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", c.split(' ')[0])} />
                      <span className="text-sm font-medium text-slate-300 flex-1">{status}</span>
                      <span className="text-sm font-black text-white">{count}</span>
                    </div>
                  );
                })
            )}
            {monthOSCount > 0 && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] mt-2 border-t border-white/[0.04] pt-3">
                <span className="text-sm font-bold text-white flex-1">Total</span>
                <span className="text-sm font-black text-white">{monthOSCount}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ MOSTRAR MAIS (tudo abaixo fica oculto) ═══ */}
      <motion.button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-all"
        whileTap={{ scale: 0.98 }}
      >
        {showMore ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        {showMore ? 'Ocultar detalhes' : 'Mostrar mais detalhes'}
      </motion.button>

      {showMore && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-5 overflow-hidden"
        >
          <DraggableGrid items={cards} onReorder={setCards} storageKey="stat-cards" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <NeonChart title="Tendência de Fluxo de Caixa" subtitle="Últimos 12 meses"
              period={selectedPeriod} periods={['7d', '30d', '90d', '12m']}
              onPeriodChange={setSelectedPeriod} onChartClick={handleChartClick}
            >
              <AreaChart data={filteredChartData}>
                <defs>
                  <linearGradient id="ci" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1152d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1152d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: '#64748b', fontSize: Math.max(10, fontSize * 0.625), fontWeight: 600 }} dy={10} />
                <Tooltip content={<NeonTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#1152d4" strokeWidth={3}
                  fillOpacity={1} fill="url(#ci)" />
              </AreaChart>
            </NeonChart>

            <NeonChart title="Comparação Mensal" subtitle="Renda vs Despesas"
              period={selectedPeriod} periods={['7d', '30d', '90d', '12m']}
              onPeriodChange={setSelectedPeriod} onChartClick={handleChartClick}
            >
              <BarChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: '#64748b', fontSize: Math.max(10, fontSize * 0.625), fontWeight: 600 }} dy={10} />
                <Tooltip content={<NeonTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="income" fill="#1152d4" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </NeonChart>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Income Ranking */}
            <div className="glass-card p-4 md:p-6">
              <h4 className="text-sm font-bold mb-4">Ranking de Entradas</h4>
              <div className="space-y-4">
                {sortedIncomeRanking.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm italic py-8">Nenhuma entrada.</p>
                ) : (
                  sortedIncomeRanking.map(([cat, amt], i) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[11px] font-black shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm"><span className="font-bold">{cat}</span><span className="font-black text-emerald-500">{formatCurrency(amt as number)}</span></div>
                        <div className="h-1.5 bg-white/[0.04] rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(amt as number) / Math.max(1, ...sortedIncomeRanking.map(([, a]) => a as number)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expense Ranking */}
            <div className="glass-card p-4 md:p-6">
              <h4 className="text-sm font-bold mb-4">Ranking de Saídas</h4>
              <div className="space-y-4">
                {sortedExpenseRanking.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm italic py-8">Nenhuma saída.</p>
                ) : (
                  sortedExpenseRanking.map(([cat, amt], i) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center text-[11px] font-black shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm"><span className="font-bold">{cat}</span><span className="font-black text-rose-500">{formatCurrency(amt as number)}</span></div>
                        <div className="h-1.5 bg-white/[0.04] rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(amt as number) / Math.max(1, ...sortedExpenseRanking.map(([, a]) => a as number)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass-card p-4 md:p-6">
            <h4 className="text-sm font-bold mb-4">Últimas Movimentações</h4>
            <div className="space-y-1">
              {(!recentTransactions || recentTransactions.length === 0) ? (
                <p className="text-center text-slate-500 text-sm italic py-8">Nenhuma transação recente.</p>
              ) : (
                recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0",
                      tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    )}>{tx.type === 'income' ? '+' : '-'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{tx.description || 'Sem descrição'}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{tx.category} · {tx.date}</p>
                    </div>
                    <span className={cn("text-sm font-black shrink-0",
                      tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    )}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
