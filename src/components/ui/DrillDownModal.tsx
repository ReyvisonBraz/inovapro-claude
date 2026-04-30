import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Transaction } from '../../types';
import { useFilterStore } from '../../store/useFilterStore';

export interface DrillDownLevel {
  title: string;
  subtitle?: string;
  data: Transaction[];
  getCategoryValue: (tx: Transaction) => string;
  getCategoryLabel: (tx: Transaction) => string;
}

export interface DrillDownData {
  levels: DrillDownLevel[];
  currentLevel?: number;
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  drillDownData: DrillDownData;
  filters?: {
    reportTypeFilter: string;
    reportCategoryFilter: string;
    reportCustomerFilter: string;
    reportPaymentStatus: string;
    reportTagsFilter: string[];
    reportStartDate: string;
    reportEndDate: string;
  };
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  drillDownData,
  filters,
}) => {
  const [history, setHistory] = useState<{ level: number; category?: string }[]>([{ level: drillDownData?.currentLevel || 0 }]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  useEffect(() => {
    setHistory([{ level: drillDownData?.currentLevel || 0 }]);
  }, [drillDownData?.currentLevel]);

  if (!isOpen || !drillDownData || !drillDownData.levels || drillDownData.levels.length === 0) return null;

  const currentEntry = history[history.length - 1];
  if (!currentEntry || currentEntry.level < 0 || currentEntry.level >= drillDownData.levels.length) return null;

  const currentLevel = drillDownData.levels[currentEntry.level];
  if (!currentLevel) return null;

  const drillDownDataFiltered = useMemo(() => {
    if (!currentLevel) return [];

    let filtered = currentLevel.data;

    if (filters) {
      if (filters.reportTypeFilter !== 'all') {
        filtered = filtered.filter(tx => tx.type === filters.reportTypeFilter);
      }
      if (filters.reportCategoryFilter !== 'all') {
        filtered = filtered.filter(tx => tx.category === filters.reportCategoryFilter);
      }
      if (filters.reportCustomerFilter) {
        filtered = filtered.filter(tx => tx.customerName === filters.reportCustomerFilter);
      }
      if (filters.reportPaymentStatus !== 'all') {
        filtered = filtered.filter(tx => tx.status === filters.reportPaymentStatus);
      }
      if (filters.reportTagsFilter.length > 0) {
        filtered = filtered.filter(tx =>
          tx.tags ? filters.reportTagsFilter.some(tag => tx.tags.includes(tag)) : false
        );
      }
      if (filters.reportStartDate && filters.reportEndDate) {
        const start = new Date(filters.reportStartDate);
        const end = new Date(filters.reportEndDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          filtered = filtered.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= start && txDate <= end;
          });
        }
      }
    }

    return filtered;
  }, [currentLevel, filters]);

  const categoryAggregates = useMemo(() => {
    if (!currentLevel) return new Map<string, { count: number; total: number; transactions: Transaction[] }>();

    const aggregates = new Map<string, { count: number; total: number; transactions: Transaction[] }>();

    drillDownDataFiltered.forEach(tx => {
      const category = currentLevel.getCategoryValue(tx);
      const existing = aggregates.get(category) || { count: 0, total: 0, transactions: [] };
      aggregates.set(category, {
        count: existing.count + 1,
        total: existing.total + tx.amount,
        transactions: [...existing.transactions, tx],
      });
    });

    return aggregates;
  }, [currentLevel, drillDownDataFiltered]);

  const sortedCategories = useMemo(() => {
    const entries = Array.from(categoryAggregates.entries());
    return entries.sort((a, b) => b[1].total - a[1].total);
  }, [categoryAggregates]);

  const handleDrillDown = (category: string) => {
    const nextLevel = currentEntry.level + 1;
    if (nextLevel < drillDownData.levels.length) {
      setHistory(prev => [...prev, { level: nextLevel, category }]);
    }
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortedTransactions = useMemo(() => {
    const txList = [...drillDownDataFiltered];
    txList.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortConfig.key) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'description':
          aVal = a.description.toLowerCase();
          bVal = b.description.toLowerCase();
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'category':
          aVal = a.category.toLowerCase();
          bVal = b.category.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return txList;
  }, [drillDownDataFiltered, sortConfig]);

  if (!isOpen || !currentLevel) return null;

  const currentTitle = currentEntry.category || title;
  const currentSubtitle = currentEntry.category ? `Categoria: ${currentEntry.category}` : subtitle;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
      >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                {history.length > 1 && (
                  <button
                    onClick={handleGoBack}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-bold">{currentTitle}</h2>
                  {currentSubtitle && (
                    <p className="text-sm text-slate-500">{currentSubtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {currentEntry.level === 0 && sortedCategories.length > 0 ? (
                <div className="space-y-4">
                  {sortedCategories.map(([category, data]) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors group"
                      onClick={() => handleDrillDown(category)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">{category}</span>
                          <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                            {data.count} transações
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-emerald-500">
                            {formatCurrency(data.total)}
                          </span>
                          <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sortedCategories.length > 0 && data.total / sortedCategories[0][1].total * 100}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : currentEntry.level === 1 && sortedTransactions.length > 0 ? (
                <div className="glass-card overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th
                          className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:text-white"
                          onClick={() => handleSort('date')}
                        >
                          <div className="flex items-center gap-1">
                            Data
                            {sortConfig.key === 'date' && (
                              sortConfig.direction === 'desc' ? <ChevronRight size={12} /> : <ChevronRight size={12} className="rotate-180" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:text-white"
                          onClick={() => handleSort('description')}
                        >
                          <div className="flex items-center gap-1">
                            Descrição
                            {sortConfig.key === 'description' && (
                              sortConfig.direction === 'desc' ? <ChevronRight size={12} /> : <ChevronRight size={12} className="rotate-180" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:text-white"
                          onClick={() => handleSort('category')}
                        >
                          <div className="flex items-center gap-1">
                            Categoria
                            {sortConfig.key === 'category' && (
                              sortConfig.direction === 'desc' ? <ChevronRight size={12} /> : <ChevronRight size={12} className="rotate-180" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:text-white text-right"
                          onClick={() => handleSort('amount')}
                        >
                          <div className="flex items-center gap-1 justify-end">
                            Valor
                            {sortConfig.key === 'amount' && (
                              sortConfig.direction === 'desc' ? <ChevronRight size={12} /> : <ChevronRight size={12} className="rotate-180" />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-xs font-medium text-slate-400">
                            {new Date(tx.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold">
                            {tx.description}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-500">
                              {tx.category}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-black text-right ${
                            tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-slate-500 text-sm italic">Nenhum dado disponível para esta visualização.</p>
                </div>
              )}

              {currentEntry.level > 1 && sortedTransactions.length > 0 && (
                <div className="glass-card overflow-hidden mt-6">
                  <div className="p-4 border-b border-white/5">
                    <h4 className="text-sm font-bold">Transações Detalhadas</h4>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Data</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Categoria</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-xs font-medium text-slate-400">
                            {new Date(tx.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold">
                            {tx.description}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-500">
                              {tx.category}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-black text-right ${
                            tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {history.length > 1 && (
                  <span>Navegação: {history.map(h => h.category || 'Raiz').join(' → ')}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {drillDownDataFiltered.length} itens
                </span>
              </div>
            </div>
          </motion.div>
    </AnimatePresence>
  );
};

export default DrillDownModal;