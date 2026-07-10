import React from 'react';
import { motion } from 'motion/react';
import { format as formatDate, parseISO } from 'date-fns';
import { cn, formatCurrency } from '../../lib/utils';
import { Transaction } from '../../types';
import type { KPICard } from '../../hooks/useReportData';

interface ReportSidebarProps {
  topCategories: Array<{ name: string; value: number; color: string }>;
  categoryPieData: Array<{ name: string; value: number; color: string }>;
  kpis: KPICard[];
  dateRange: { start: Date; end: Date };
  filteredTransactions: Transaction[];
}

export const ReportSidebar: React.FC<ReportSidebarProps> = ({
  topCategories, categoryPieData, kpis, dateRange, filteredTransactions,
}) => {
  const periodDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  const totalCategoryValue = categoryPieData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Top Categorias */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h4 className="text-lg font-bold mb-4">Top Categorias</h4>
        <div className="space-y-3">
          {topCategories.map((cat, idx) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: cat.color }}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{cat.name}</p>
                <p className="text-xs text-slate-500">{formatCurrency(cat.value)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-500">
                  {((cat.value / totalCategoryValue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Resumo do Período */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
        <h4 className="text-lg font-bold mb-4">Resumo do Período</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-sm text-slate-400">Total de Dias</span>
            <span className="font-bold">{periodDays}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-sm text-slate-400">Média Diária (Receitas)</span>
            <span className="font-bold text-emerald-500">{formatCurrency(kpis.find(k => k.id === 'income')!.value / Math.max(1, periodDays))}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-sm text-slate-400">Média Diária (Despesas)</span>
            <span className="font-bold text-rose-500">{formatCurrency(kpis.find(k => k.id === 'expense')!.value / Math.max(1, periodDays))}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-sm text-slate-400">Saldo Médio</span>
            <span className={cn('font-bold', kpis.find(k => k.id === 'balance')!.value >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
              {formatCurrency(kpis.find(k => k.id === 'avg')!.value)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Transações Recentes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
        <h4 className="text-lg font-bold mb-4">Últimas Transações</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {filteredTransactions.slice(0, 10).map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
              <div className={cn('w-2 h-2 rounded-full', tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500')} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{tx.description}</p>
                <p className="text-xs text-slate-500">{tx.category} • {formatDate(parseISO(tx.date), 'dd/MM')}</p>
              </div>
              <span className={cn('text-sm font-bold', tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500')}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};