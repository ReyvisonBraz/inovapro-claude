import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Calendar, X, 
  Coffee, Briefcase, Zap, Car, ShoppingBag,
  Edit, Copy, Trash2
} from 'lucide-react';
import { format, parseISO, isSameDay, startOfMonth } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';
import { Transaction, Category, AppSettings } from '../types';

import { Pagination } from './ui/Pagination';

interface TransactionsProps {
  categories: Category[];
  filteredTransactions: Transaction[];
  handleDuplicateTransaction: (tx: Transaction) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
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
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
  onAddNewTransaction: () => void;
}

export const Transactions = ({
  categories,
  filteredTransactions,
  handleDuplicateTransaction,
  pagination,
  onPageChange,
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
  onEditTransaction,
  onDeleteTransaction,
  onAddNewTransaction
}: TransactionsProps) => {
  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-10">
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center justify-between bg-white/[0.02] border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] backdrop-blur-xl">
          <div className="relative w-full lg:max-w-md">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
            <input 
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
              placeholder="Pesquisar transações..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
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
                    "flex-1 md:flex-none px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
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
                "flex-1 md:flex-none flex items-center justify-center gap-3 px-6 h-12 md:h-14 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Data Selecionada</span>
                      <input 
                        type="date"
                        value={selectedDate}
                        onChange={(e) => onSelectedDateChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0"
                      />
                    </div>
                    <button 
                      onClick={() => onSelectedDateChange(format(new Date(), 'yyyy-MM-dd'))}
                      className="ml-4 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest text-primary transition-all border border-primary/10"
                    >
                      Hoje
                    </button>
                  </div>
                )}

                {dateFilterMode === 'month' && (
                  <div className="flex items-center gap-4 px-6 py-3">
                    <div className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                      <Calendar size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Mês de Referência</span>
                      <input 
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => onSelectedMonthChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0"
                      />
                    </div>
                    <button 
                      onClick={() => onSelectedMonthChange(format(new Date(), 'yyyy-MM'))}
                      className="ml-4 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest text-primary transition-all border border-primary/10"
                    >
                      Este Mês
                    </button>
                  </div>
                )}

                {dateFilterMode === 'range' && (
                  <div className="flex items-center gap-8 px-6 py-3">
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
                          className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0 w-40"
                        />
                      </div>
                    </div>
                    
                    <div className="h-8 w-px bg-primary/20" />

                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Fim</span>
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0 w-40"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo</label>
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
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</label>
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
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Mínimo</label>
                <input 
                  type="number"
                  value={filterMinAmount}
                  onChange={(e) => onFilterMinAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Máximo</label>
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Atalhos de Período</label>
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
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Column Visibility Toggles in Filters */}
              <div className="col-span-full pt-4 border-t border-white/5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Exibir Colunas</label>
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
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
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
                  onClick={() => {
                    onSearchChange('');
                    onFilterTypeChange('all');
                    onFilterCategoryChange('all');
                    onFilterMinAmountChange('');
                    onFilterMaxAmountChange('');
                    onDateFilterModeChange('all');
                  }}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-all border border-white/10 flex items-center gap-2"
                >
                  <X size={14} />
                  Limpar Todos os Filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card overflow-hidden">
        {/* Mobile View */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-500">
                    {tx.category === 'Alimentação' ? <Coffee size={16} /> :
                     tx.category === 'Trabalho' ? <Briefcase size={16} /> :
                     tx.category === 'Utilidades' ? <Zap size={16} /> :
                     tx.category === 'Viagem' ? <Car size={16} /> :
                     tx.category === 'Lazer' ? <ShoppingBag size={16} /> :
                     <ShoppingBag size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{tx.description}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                      {format(new Date(tx.date), 'dd/MM/yyyy')} • {tx.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-sm font-black tracking-tight block",
                    tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {tx.type === 'income' ? 'Entrada' : 'Saída'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{tx.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEditTransaction(tx)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDuplicateTransaction(tx)}
                    className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                    title="Duplicar"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                  <Search size={32} />
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Nenhuma transação encontrada</p>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">Ajuste seus filtros</p>
                </div>
                <button 
                  onClick={() => onAddNewTransaction()}
                  className="mt-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-primary/20"
                >
                  Nova Transação
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                {!settings.hiddenColumns.includes('Descrição') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>}
                {!settings.hiddenColumns.includes('Categoria') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</th>}
                {!settings.hiddenColumns.includes('Tipo') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo</th>}
                {!settings.hiddenColumns.includes('Valor') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor</th>}
                {!settings.hiddenColumns.includes('Status') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>}
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-all duration-300 group border-b border-white/[0.02] last:border-0">
                  {!settings.hiddenColumns.includes('Descrição') && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-500">
                          {tx.category === 'Alimentação' && <Coffee size={16} />}
                          {tx.category === 'Trabalho' && <Briefcase size={16} />}
                          {tx.category === 'Utilidades' && <Zap size={16} />}
                          {tx.category === 'Viagem' && <Car size={16} />}
                          {tx.category === 'Lazer' && <ShoppingBag size={16} />}
                          {!['Alimentação', 'Trabalho', 'Utilidades', 'Viagem', 'Lazer'].includes(tx.category) && <ShoppingBag size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{tx.description}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                            {format(new Date(tx.date), 'hh:mm a')} • {tx.category}
                          </p>
                        </div>
                      </div>
                    </td>
                  )}
                  {!settings.hiddenColumns.includes('Categoria') && (
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {tx.category}
                      </span>
                    </td>
                  )}
                  {!settings.hiddenColumns.includes('Tipo') && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          tx.type === 'income' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                        )} />
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {tx.type === 'income' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </td>
                  )}
                  {!settings.hiddenColumns.includes('Valor') && (
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-sm font-black tracking-tight",
                        tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </td>
                  )}
                  {!settings.hiddenColumns.includes('Status') && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{tx.status}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => onEditTransaction(tx)}
                        className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDuplicateTransaction(tx)}
                        className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                        <Search size={40} />
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold">Nenhuma transação encontrada</p>
                        <p className="text-xs text-slate-600 uppercase tracking-widest mt-1">Tente ajustar seus filtros de busca</p>
                      </div>
                      <button 
                        onClick={() => onAddNewTransaction()}
                        className="mt-4 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-primary/20"
                      >
                        Nova Transação
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};
