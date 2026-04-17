import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData } from '../../../schemas/transactionSchema';
import { cn } from '../../../lib/utils';
import { MiniCalendar } from '../../ui/MiniCalendar';

const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = parseInt(numbers, 10) / 100;
  return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatNumberForInput = (num: number): string => {
  if (!num && num !== 0) return '';
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseCurrencyInput = (value: string): string => {
  return value.replace(/\D/g, '');
};

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction: any;
  categories: any[];
  onSubmit: (data: TransactionFormData, keepModalOpen?: boolean) => void;
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
  const amountInputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

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
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      description: '',
      category: cat('income'),
      type: 'income',
      amount: '' as any,
      date: today()
    }
  } as any);

  const typeValue = watch('type');
  const dateValue = watch('date');
  const [keepOpen, setKeepOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'Enter') {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'button' || activeTag === 'form') return;

      e.preventDefault();

      if (activeTag === 'input' && document.activeElement === amountInputRef.current) {
        categoryRef.current?.focus();
      } else if (activeTag === 'select' && document.activeElement === categoryRef.current) {
        descriptionRef.current?.focus();
      } else if (activeTag === 'input' && document.activeElement === descriptionRef.current) {
        handleSubmit((data: TransactionFormData) => onSubmit(data, !editingTransaction))();
      } else if (activeTag === 'input') {
        categoryRef.current?.focus();
      }
    }
  }, [isOpen, onClose, handleSubmit, onSubmit]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => amountInputRef.current?.select(), 100);

      if (editingTransaction) {
        reset({
          description: editingTransaction.description || '',
          category: editingTransaction.category,
          type: editingTransaction.type,
          amount: formatNumberForInput(editingTransaction.amount) as any,
          date: editingTransaction.date
        });
      } else {
        reset({
          description: '',
          category: cat('income'),
          type: 'income',
          amount: '' as any,
          date: today()
        });
      }
    }
  }, [isOpen, editingTransaction, reset]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseCurrencyInput(e.target.value);
    const formatted = formatCurrencyInput(raw);
    setValue('amount', formatted as any);
  };

  const isIncome = typeValue === 'income';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
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
            className="relative flex flex-col lg:flex-row items-stretch gap-4 w-full max-w-5xl"
          >
            <div className="hidden lg:flex flex-col w-64 shrink-0 glass-modal overflow-hidden max-h-[85vh]">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <Calendar size={12} className="text-slate-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Calendário
                </p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <MiniCalendar
                  selectedDate={dateValue}
                  onSelect={(d) => setValue('date', d)}
                />
              </div>
            </div>

            <div className="flex-1 glass-modal p-6 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center border-2",
                    isIncome
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  )}>
                    {editingTransaction ? <Edit size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight">
                      {editingTransaction ? 'Editar Transação' : 'Novo Lançamento'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter ↵ para avançar • Esc para fechar
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit((data) => {
                if (editingTransaction) {
                  onSubmit(data);
                } else {
                  onSubmit(data, keepOpen);
                  if (keepOpen) {
                    setTimeout(() => {
                      reset({
                        description: '',
                        category: data.category,
                        type: data.type,
                        amount: '' as any,
                        date: data.date
                      });
                      setTimeout(() => amountInputRef.current?.focus(), 100);
                    }, 50);
                  }
                }
              })} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setValue('type', 'income'); setValue('category', cat('income')); }}
                    className={cn(
                      'flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm uppercase tracking-wider transition-all',
                      isIncome
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-emerald-500/40 hover:text-emerald-400/70'
                    )}
                  >
                    <TrendingUp size={20} />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => { setValue('type', 'expense'); setValue('category', cat('expense')); }}
                    className={cn(
                      'flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm uppercase tracking-wider transition-all',
                      !isIncome
                        ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                        : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-rose-500/40 hover:text-rose-400/70'
                    )}
                  >
                    <TrendingDown size={20} />
                    Saída
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex justify-between items-center">
                      <span>Valor</span>
                      <span className="text-xs text-slate-600 font-normal normal-case tracking-normal">↵</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        ref={amountInputRef}
                        {...register('amount')}
                        onChange={handleAmountChange}
                        className={cn(
                          'w-full h-12 bg-white/[0.03] border rounded-xl pl-9 pr-3 text-base font-bold focus:ring-2 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-700',
                          errors.amount ? 'border-red-500/50' : 'border-white/10'
                        )}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex justify-between items-center">
                      <span>Categoria</span>
                      <span className="text-xs text-slate-600 font-normal normal-case tracking-normal">↵</span>
                    </label>
                    <select
                      ref={categoryRef}
                      {...register('category')}
                      className={cn(
                        'w-full h-12 bg-white/[0.03] border rounded-xl px-3 text-sm font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer [&>option]:bg-slate-900',
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
                  <div className="space-y-1.5 lg:hidden">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1.5">
                      <Calendar size={11} />
                      Data
                      {errors.date && <span className="text-xs text-red-500 italic ml-auto">{errors.date.message}</span>}
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setValue('date', today())}
                        className={cn(
                          'px-2.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border',
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
                          'px-2.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border',
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
                          'flex-1 h-9 bg-white/[0.03] border rounded-lg px-2 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all [color-scheme:dark]',
                          errors.date ? 'border-red-500/50' : 'border-white/10'
                        )}
                      />
                    </div>
                  </div>
                  <div className="hidden lg:col-span-1 lg:block">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1.5 mb-1.5">
                      <Calendar size={11} />
                      Data selecionada
                    </label>
                    <div className="h-[48px] bg-white/[0.03] border border-white/10 rounded-xl px-3 flex items-center text-sm font-semibold text-slate-200">
                      {dateValue
                        ? new Date(dateValue + 'T00:00:00').toLocaleDateString('pt-BR', {
                            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                          })
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex justify-between items-center">
                    <span>Descrição <span className="normal-case font-normal text-slate-600">(opcional)</span></span>
                    <span className="text-xs text-slate-600 font-normal normal-case tracking-normal">↵</span>
                  </label>
                  <input
                    type="text"
                    ref={descriptionRef}
                    {...register('description')}
                    className="w-full h-11 bg-white/[0.03] border border-white/10 rounded-xl px-3 text-sm font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-700"
                    placeholder="Ex: Compra de suprimentos, venda de produto..."
                  />
                </div>

                {!editingTransaction && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keepOpen}
                      onChange={(e) => setKeepOpen(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                    />
                    <span className="text-xs text-slate-400">Manter modal aberto</span>
                  </label>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-lg font-semibold text-slate-500 hover:bg-white/5 transition-all text-xs uppercase tracking-wider flex items-center gap-1.5 border border-transparent hover:border-white/10"
                  >
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-xs font-mono">Esc</span>
                    <span>Cancelar</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'flex-1 py-3.5 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] text-sm uppercase tracking-wider disabled:opacity-50 disabled:hover:scale-100',
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