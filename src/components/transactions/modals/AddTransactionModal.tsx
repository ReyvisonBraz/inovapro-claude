import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData } from '../../../schemas/transactionSchema';
import { cn } from '../../../lib/utils';
import { MiniCalendar } from '../../ui/MiniCalendar';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction: any;
  categories: any[];
  onSubmit: (data: TransactionFormData) => void;
}

const today = () => new Date().toISOString().split('T')[0];
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
  categories,
  onSubmit
}) => {
  const cat = (type: 'income' | 'expense') => {
    const preferred = type === 'income' ? 'Entrada' : 'Saída';
    const list = categories.filter(c => c.type === type);
    return list.find(c => c.name === preferred)?.name ?? list[0]?.name ?? '';
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      category: cat('expense'),
      type: 'expense',
      amount: 0 as any,
      date: today()
    }
  });

  const typeValue = watch('type');
  const dateValue = watch('date');

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        reset({
          description: editingTransaction.description,
          category: editingTransaction.category,
          type: editingTransaction.type,
          amount: editingTransaction.amount.toString(),
          date: editingTransaction.date
        });
      } else {
        reset({
          description: '',
          category: cat('expense'),
          type: 'expense',
          amount: '' as any,
          date: today()
        });
      }
    }
  }, [isOpen, editingTransaction, reset]);

  const isIncome = typeValue === 'income';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative flex flex-col lg:flex-row items-stretch gap-3 w-full max-w-lg lg:max-w-[800px]"
          >
            <div className="hidden lg:flex flex-col w-60 shrink-0 glass-modal overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <Calendar size={12} className="text-slate-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Data do Lançamento
                </p>
              </div>
              <MiniCalendar
                selectedDate={dateValue}
                onSelect={(d) => setValue('date', d)}
              />
            </div>

            <div className="flex-1 glass-modal p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                    {editingTransaction ? <Edit size={20} /> : <Plus size={20} />}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {editingTransaction ? 'Editar Transação' : 'Novo Lançamento'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setValue('type', 'expense'); setValue('category', cat('expense')); }}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all',
                      !isIncome
                        ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20 scale-[1.02]'
                        : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-rose-500/40 hover:text-rose-400/70'
                    )}
                  >
                    <TrendingDown size={28} />
                    Saída
                  </button>
                  <button
                    type="button"
                    onClick={() => { setValue('type', 'income'); setValue('category', cat('income')); }}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all',
                      isIncome
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-emerald-500/40 hover:text-emerald-400/70'
                    )}
                  >
                    <TrendingUp size={28} />
                    Entrada
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex justify-between">
                      <span>Valor</span>
                      {errors.amount && <span className="text-[8px] text-red-500 italic">{errors.amount.message}</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                      <input
                        type="text"
                        {...register('amount')}
                        autoFocus
                        className={cn(
                          'w-full h-14 bg-white/[0.03] border rounded-2xl pl-10 pr-4 text-lg font-black focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-800',
                          errors.amount ? 'border-red-500/50' : 'border-white/10'
                        )}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex justify-between">
                      <span>Categoria</span>
                      {errors.category && <span className="text-[8px] text-red-500 italic">{errors.category.message}</span>}
                    </label>
                    <select
                      {...register('category')}
                      className={cn(
                        'w-full h-14 bg-white/[0.03] border rounded-2xl px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer [&>option]:bg-slate-900',
                        errors.category ? 'border-red-500/50' : 'border-white/10'
                      )}
                    >
                      <option value="" disabled className="bg-slate-900">Categoria...</option>
                      {(isIncome
                        ? categories.filter(c => c.type === 'income')
                        : categories.filter(c => c.type === 'expense')
                      ).map(cat => (
                        <option key={cat.id} value={cat.name} className="bg-slate-900">{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 lg:hidden">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                    <Calendar size={12} />
                    Data
                    {errors.date && <span className="text-[8px] text-red-500 italic ml-auto">{errors.date.message}</span>}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setValue('date', today())}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border',
                        dateValue === today()
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                      )}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('date', yesterday())}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border',
                        dateValue === yesterday()
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                      )}
                    >
                      Ontem
                    </button>
                    <input
                      type="date"
                      {...register('date')}
                      className={cn(
                        'flex-1 h-9 bg-white/[0.03] border rounded-xl px-3 text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all [color-scheme:dark]',
                        errors.date ? 'border-red-500/50' : 'border-white/10'
                      )}
                    />
                  </div>
                </div>

                <div className="hidden lg:block space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                    <Calendar size={12} />
                    Data selecionada
                    {errors.date && <span className="text-[8px] text-red-500 italic ml-auto">{errors.date.message}</span>}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setValue('date', today())}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border',
                        dateValue === today()
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                      )}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('date', yesterday())}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border',
                        dateValue === yesterday()
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                      )}
                    >
                      Ontem
                    </button>
                    <div className="flex-1 h-9 bg-white/[0.03] border border-white/10 rounded-xl px-3 text-xs font-bold flex items-center text-slate-300">
                      {dateValue
                        ? new Date(dateValue + 'T00:00:00').toLocaleDateString('pt-BR', {
                            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                          })
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                    Descrição <span className="normal-case font-normal text-slate-600">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    {...register('description')}
                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-800"
                    placeholder="Ex: Compra de suprimentos..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'flex-1 py-4 rounded-2xl font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm uppercase tracking-[0.2em] disabled:opacity-50 disabled:hover:scale-100',
                      isIncome
                        ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                        : 'bg-rose-500 text-white shadow-rose-500/30'
                    )}
                  >
                    {isSubmitting ? 'Salvando...' : (editingTransaction ? 'Atualizar' : (isIncome ? '+ Confirmar Entrada' : '− Confirmar Saída'))}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
