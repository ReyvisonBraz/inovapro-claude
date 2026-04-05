import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Calendar, X, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { cn } from '../../lib/utils';
import { Category, AppSettings } from '../../types';

interface TransactionFiltersProps {
  categories: Category[];
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  dateFilterMode: 'day' | 'month' | 'range' | 'all';
  onDateFilterModeChange: (mode: 'day' | 'month' | 'range' | 'all') => void;
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  selectedMonth: string;
  onSelectedMonthChange: (month: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  filterType: 'all' | 'income' | 'expense';
  onFilterTypeChange: (type: 'all' | 'income' | 'expense') => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  filterMinAmount: string;
  onFilterMinAmountChange: (amount: string) => void;
  filterMaxAmount: string;
  onFilterMaxAmountChange: (amount: string) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  onResetFilters: () => void;
}

export const TransactionFilters = ({
  categories,
  settings,
  onUpdateSettings,
  searchTerm,
  onSearchChange,
  dateFilterMode,
  onDateFilterModeChange,
  selectedDate,
  onSelectedDateChange,
  selectedMonth,
  onSelectedMonthChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  filterMinAmount,
  onFilterMinAmountChange,
  filterMaxAmount,
  onFilterMaxAmountChange,
  showFilters,
  onShowFiltersChange,
  onResetFilters
}: TransactionFiltersProps) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = parseInt(selectedMonth.split('-')[0]);
  const currentMonthIdx = parseInt(selectedMonth.split('-')[1]) - 1;

  const handleYearChange = (delta: number) => {
    onSelectedMonthChange(`${currentYear + delta}-${(currentMonthIdx + 1).toString().padStart(2, '0')}`);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center justify-between bg-white/[0.02] border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] backdrop-blur-xl">
        <div className="relative w-full lg:max-w-md">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
          <input 
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-12 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
            placeholder="Pesquisar transações..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl text-slate-500 transition-all"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full lg:w-auto">
          <div className="flex flex-wrap md:flex-nowrap p-1.5 bg-black/20 rounded-2xl border border-white/5 shadow-inner w-full md:w-auto">
            {[
              { id: 'day', label: 'Dia' },
              { id: 'month', label: 'Mês' },
              { id: 'range', label: 'Período' },
              { id: 'all', label: 'Tudo' }
            ].map(mode => (
              <button 
                key={mode.id}
                onClick={() => onDateFilterModeChange(mode.id as any)}
                className={cn(
                  "flex-1 md:flex-none px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-300",
                  dateFilterMode === mode.id 
                    ? "bg-primary text-white shadow-[0_10px_20px_-5px_rgba(17,82,212,0.4)] md:scale-105" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="h-10 w-px bg-white/5 hidden lg:block" />

          <button 
            onClick={() => onShowFiltersChange(!showFilters)}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-3 px-6 h-12 md:h-14 rounded-2xl border text-xs font-black uppercase tracking-[0.2em] transition-all duration-300",
              showFilters 
                ? "bg-primary/20 border-primary text-primary shadow-[0_0_30px_rgba(17,82,212,0.1)]" 
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20"
            )}
          >
            <Filter size={18} className={cn("transition-transform duration-500", showFilters && "rotate-180")} />
            Filtros
          </button>
        </div>
      </div>

      {/* Calendar Controls - Highlighted */}
      <AnimatePresence mode="wait">
        {dateFilterMode !== 'all' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-4 p-2 bg-primary/5 border border-primary/10 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
              {dateFilterMode === 'day' && (
                <div className="flex items-center gap-4 px-6 py-3">
                  <div className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                    <Calendar size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-primary/60">Data Selecionada</span>
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => onSelectedDateChange(e.target.value)}
                      className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0"
                    />
                  </div>
                  <button 
                    onClick={() => onSelectedDateChange(format(new Date(), 'yyyy-MM-dd'))}
                    className="ml-4 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-xs font-black uppercase tracking-widest text-primary transition-all border border-primary/10"
                  >
                    Hoje
                  </button>
                </div>
              )}

              {dateFilterMode === 'month' && (
                <div className="flex flex-col gap-4 p-6 min-w-[320px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                        <Calendar size={18} />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest text-primary">Mês de Referência</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                      <button 
                        onClick={() => handleYearChange(-1)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="px-2 text-sm font-black text-slate-200">{currentYear}</span>
                      <button 
                        onClick={() => handleYearChange(1)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {months.map((month, idx) => {
                      const isSelected = idx === currentMonthIdx;
                      return (
                        <button
                          key={month}
                          onClick={() => onSelectedMonthChange(`${currentYear}-${(idx + 1).toString().padStart(2, '0')}`)}
                          className={cn(
                            "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                            isSelected 
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                              : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10 hover:text-slate-300"
                          )}
                        >
                          {month.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => onSelectedMonthChange(format(new Date(), 'yyyy-MM'))}
                    className="w-full mt-2 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest text-primary transition-all border border-primary/10"
                  >
                    Mês Atual
                  </button>
                </div>
              )}

              {dateFilterMode === 'range' && (
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                      <Calendar size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Início</span>
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-base font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0 w-36"
                      />
                    </div>
                  </div>
                  
                  <div className="hidden md:block h-10 w-px bg-primary/20" />
                  <div className="md:hidden w-full h-px bg-primary/20" />

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 text-right">Fim</span>
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-base font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0 w-36 text-right"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/10">
                      <Calendar size={20} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tipo</label>
                <select 
                  value={filterType}
                  onChange={(e: any) => onFilterTypeChange(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900"
                >
                  <option value="all">Todos</option>
                  <option value="income">Entradas</option>
                  <option value="expense">Saídas</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Categoria</label>
                <select 
                  value={filterCategory}
                  onChange={(e) => onFilterCategoryChange(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900"
                >
                  <option value="all">Todas</option>
                  <optgroup label="Entradas">
                    {categories.filter(c => c.type === 'income').map(cat => (
                      <option key={`inc-${cat.id}`} value={cat.name}>{cat.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Saídas">
                    {categories.filter(c => c.type === 'expense').map(cat => (
                      <option key={`exp-${cat.id}`} value={cat.name}>{cat.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Valor Mínimo</label>
                <input 
                  type="number"
                  value={filterMinAmount}
                  onChange={(e) => onFilterMinAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Valor Máximo</label>
                <input 
                  type="number"
                  value={filterMaxAmount}
                  onChange={(e) => onFilterMaxAmountChange(e.target.value)}
                  placeholder="R$ 10.000,00"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Quick Date Ranges */}
              {dateFilterMode === 'range' && (
                <div className="col-span-full pt-4 border-t border-white/5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Atalhos de Período</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Últimos 7 dias', days: 7 },
                      { label: 'Últimos 30 dias', days: 30 },
                      { label: 'Este Mês', currentMonth: true },
                      { label: 'Este Ano', currentYear: true },
                    ].map(range => (
                      <button
                        key={range.label}
                        onClick={() => {
                          const end = new Date();
                          let start = new Date();
                          if (range.days) {
                            start.setDate(end.getDate() - range.days);
                          } else if (range.currentMonth) {
                            start = startOfMonth(end);
                          } else if (range.currentYear) {
                            start = new Date(end.getFullYear(), 0, 1);
                          }
                          onStartDateChange(format(start, 'yyyy-MM-dd'));
                          onEndDateChange(format(end, 'yyyy-MM-dd'));
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Column Visibility Toggles in Filters */}
              <div className="col-span-full pt-4 border-t border-white/5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Exibir Colunas</label>
                <div className="flex flex-wrap gap-2">
                  {['Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'].map(col => (
                    <button
                      key={col}
                      onClick={() => {
                        const newHidden = settings.hiddenColumns.includes(col)
                          ? settings.hiddenColumns.filter(c => c !== col)
                          : [...settings.hiddenColumns, col];
                        onUpdateSettings({ ...settings, hiddenColumns: newHidden });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all",
                        !settings.hiddenColumns.includes(col) 
                          ? "bg-primary/10 border-primary/20 text-primary" 
                          : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-full pt-6 border-t border-white/5 flex justify-end">
                <button 
                  onClick={onResetFilters}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-rose-500/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all border border-white/10 hover:border-rose-500/20 flex items-center gap-2"
                >
                  <X size={14} />
                  Limpar Todos os Filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
