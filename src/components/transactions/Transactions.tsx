import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Calendar, TrendingUp, TrendingDown, 
  MoreVertical, Edit2, Trash2, Download, FileText, 
  Plus, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { format, parseISO, startOfMonth } from 'date-fns';
import { cn, formatCurrency } from '../../lib/utils';
import { Transaction, Category } from '../../types';

interface TransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onAdd: (tx: Omit<Transaction, 'id'>) => Promise<boolean>;
  onUpdate: (id: number, tx: Partial<Transaction>) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  categories,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateFilterMode, setDateFilterMode] = React.useState<'day' | 'month' | 'range' | 'all'>('month');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = React.useState(format(new Date(), 'yyyy-MM'));
  const [startDate, setStartDate] = React.useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterType, setFilterType] = React.useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [filterMinAmount, setFilterMinAmount] = React.useState('');
  const [filterMaxAmount, setFilterMaxAmount] = React.useState('');
  const [isAddingTransaction, setIsAddingTransaction] = React.useState(false);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
    const matchesMinAmount = !filterMinAmount || tx.amount >= parseFloat(filterMinAmount);
    const matchesMaxAmount = !filterMaxAmount || tx.amount <= parseFloat(filterMaxAmount);

    let matchesDate = true;
    const txDate = parseISO(tx.date);

    if (dateFilterMode === 'day') {
      matchesDate = format(txDate, 'yyyy-MM-dd') === selectedDate;
    } else if (dateFilterMode === 'month') {
      matchesDate = format(txDate, 'yyyy-MM') === selectedMonth;
    } else if (dateFilterMode === 'range') {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      matchesDate = txDate >= start && txDate <= end;
    }

    return matchesSearch && matchesType && matchesCategory && matchesMinAmount && matchesMaxAmount && matchesDate;
  });

  const handleEditTransaction = (tx: Transaction) => {
    // Implement edit logic or modal
    console.log('Edit', tx);
  };

  const handleDeleteTransaction = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await onDelete(id);
    }
  };

  const exportToExcel = () => {
    console.log('Export to Excel');
  };

  const exportToPDF = () => {
    console.log('Export to PDF');
  };
  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
          <div className="relative w-full lg:max-w-md">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
            <input 
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
              placeholder="Pesquisar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex p-1.5 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
              {[
                { id: 'day', label: 'Dia' },
                { id: 'month', label: 'Mês' },
                { id: 'range', label: 'Período' },
                { id: 'all', label: 'Tudo' }
              ].map(mode => (
                <button 
                  key={mode.id}
                  onClick={() => setDateFilterMode(mode.id as any)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                    dateFilterMode === mode.id 
                      ? "bg-primary text-white shadow-[0_10px_20px_-5px_rgba(17,82,212,0.4)] scale-105" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="h-10 w-px bg-white/5 hidden lg:block" />

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-3 px-6 h-14 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
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

        {/* Calendar Controls */}
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
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0"
                      />
                    </div>
                    <button 
                      onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
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
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0"
                      />
                    </div>
                    <button 
                      onClick={() => setSelectedMonth(format(new Date(), 'yyyy-MM'))}
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
                          onChange={(e) => setStartDate(e.target.value)}
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
                        onChange={(e) => setEndDate(e.target.value)}
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
                  onChange={(e: any) => setFilterType(e.target.value)}
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
                  onChange={(e) => setFilterCategory(e.target.value)}
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
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Máximo</label>
                <input 
                  type="number"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
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
                          setStartDate(format(start, 'yyyy-MM-dd'));
                          setEndDate(format(end, 'yyyy-MM-dd'));
                        }}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">Lançamentos</h3>
              <p className="text-[10px] text-slate-500 font-bold">{filteredTransactions.length} registros encontrados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToExcel}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="Exportar Excel"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={exportToPDF}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="Exportar PDF"
            >
              <FileText size={18} />
            </button>
            <button 
              onClick={() => setIsAddingTransaction(true)}
              className="flex items-center gap-2 px-6 h-12 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <Plus size={16} />
              Novo Lançamento
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/[0.01]">
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5">Método</th>
                <th className="px-8 py-5 text-right">Valor</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{format(parseISO(tx.date), 'dd/MM/yyyy')}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{format(parseISO(tx.date), 'HH:mm')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        tx.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {tx.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      </div>
                      <span className="text-sm font-bold text-slate-200">{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-medium text-slate-500">{tx.paymentMethod}</span>
                  </td>
                  <td className={cn(
                    "px-8 py-5 text-right text-sm font-black",
                    tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditTransaction(tx)}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Search size={48} />
                      <p className="text-sm font-bold uppercase tracking-widest">Nenhuma transação encontrada</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
