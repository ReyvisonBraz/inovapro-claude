import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFilterStore } from '../../store/useFilterStore';

interface FilterBarProps {
  categories: { name: string; type: 'income' | 'expense' }[];
}

export const FilterBar = ({ categories }: FilterBarProps) => {
  const {
    reportPeriodFilter,
    setReportPeriodFilter,
    reportTypeFilter,
    setReportTypeFilter,
    reportCategoryFilter,
    setReportCategoryFilter,
    showReportFilters,
    setShowReportFilters,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
  } = useFilterStore();

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Período</span>
        <div className="relative">
          <select
            value={reportPeriodFilter}
            onChange={(e) => {
              const period = e.target.value as typeof reportPeriodFilter;
              setReportPeriodFilter(period);
              if (period !== 'custom') {
                const end = new Date();
                let start = new Date();
                if (period === '7d') start.setDate(end.getDate() - 7);
                else if (period === '30d') start.setDate(end.getDate() - 30);
                else if (period === '90d') start.setDate(end.getDate() - 90);
                else if (period === '12m') start.setFullYear(end.getFullYear() - 1);
                setReportStartDate(start.toISOString().split('T')[0]);
                setReportEndDate(end.toISOString().split('T')[0]);
              }
            }}
            className="appearance-none bg-slate-800/50 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm font-bold outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="12m">Últimos 12 meses</option>
            <option value="custom">Personalizado</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {reportPeriodFilter === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={reportStartDate}
            onChange={(e) => setReportStartDate(e.target.value)}
            className="bg-slate-800/50 border border-white/10 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
          />
          <span className="text-slate-500 text-xs">até</span>
          <input
            type="date"
            value={reportEndDate}
            onChange={(e) => setReportEndDate(e.target.value)}
            className="bg-slate-800/50 border border-white/10 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
          />
        </div>
      )}

      <div className="h-8 w-px bg-white/10" />

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Tipo</span>
        <div className="relative">
          <select
            value={reportTypeFilter}
            onChange={(e) => setReportTypeFilter(e.target.value as typeof reportTypeFilter)}
            className="appearance-none bg-slate-800/50 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm font-bold outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Categoria</span>
        <div className="relative">
          <select
            value={reportCategoryFilter}
            onChange={(e) => setReportCategoryFilter(e.target.value)}
            className="appearance-none bg-slate-800/50 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm font-bold outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Todas</option>
            <optgroup label="Entradas">
              {categories.filter(c => c.type === 'income').map(cat => (
                <option key={`inc-${cat.name}`} value={cat.name}>{cat.name}</option>
              ))}
            </optgroup>
            <optgroup label="Saídas">
              {categories.filter(c => c.type === 'expense').map(cat => (
                <option key={`exp-${cat.name}`} value={cat.name}>{cat.name}</option>
              ))}
            </optgroup>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      <button
        onClick={() => setShowReportFilters(!showReportFilters)}
        className={cn(
          "ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all",
          showReportFilters
            ? "bg-primary/20 border-primary text-primary"
            : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-300"
        )}
      >
        Filtros Avançados
      </button>
    </div>
  );
};