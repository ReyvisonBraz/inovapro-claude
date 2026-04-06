import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData } from '../../../schemas/transactionSchema';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction: any;
  categories: any[];
  onSubmit: (data: TransactionFormData) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
  categories,
  onSubmit
}) => {
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
      category: '',
      type: 'expense',
      amount: 0 as any,
      date: new Date().toISOString().split('T')[0]
    }
  });

  const typeValue = watch('type');

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
          category: '',
          type: 'expense',
          amount: '' as any,
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, editingTransaction, reset]);

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
            className="relative w-full max-w-2xl glass-modal p-4 sm:p-6 md:p-8 lg:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-start justify-between mb-8 md:mb-12">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl md:rounded-3xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                  {editingTransaction ? <Edit size={24} className="md:w-7 md:h-7" /> : <Plus size={24} className="md:w-7 md:h-7" />}
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-bold tracking-tight">
                    {editingTransaction ? 'Editar Transação' : 'Nova Entrada'}
                  </h3>
                  <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">Preencha os detalhes da sua movimentação</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-2 md:p-3 hover:bg-white/5 rounded-xl md:rounded-2xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10 shrink-0"
              >
                <X size={24} className="md:w-7 md:h-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 md:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Tipo de Fluxo</label>
                  <select 
                    {...register('type')}
                    onChange={(e) => {
                      setValue('type', e.target.value as any);
                      setValue('category', '');
                    }}
                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer [&>option]:bg-slate-900"
                  >
                    <option value="expense" className="bg-slate-900">Despesa (Saída)</option>
                    <option value="income" className="bg-slate-900">Renda (Entrada)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex justify-between">
                    <span>Categoria</span>
                    {errors.category && <span className="text-[8px] text-red-500 italic">{errors.category.message}</span>}
                  </label>
                  <select 
                    {...register('category')}
                    className={`w-full h-16 bg-white/[0.03] border ${errors.category ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer [&>option]:bg-slate-900`}
                  >
                    <option value="" disabled className="bg-slate-900">Selecionar categoria</option>
                    {typeValue === 'income' ? (
                      categories.filter(c => c.type === 'income').map(cat => (
                        <option key={cat.id} value={cat.name} className="bg-slate-900">{cat.name}</option>
                      ))
                    ) : (
                      categories.filter(c => c.type === 'expense').map(cat => (
                        <option key={cat.id} value={cat.name} className="bg-slate-900">{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex justify-between">
                    <span>Valor</span>
                    {errors.amount && <span className="text-[8px] text-red-500 italic">{errors.amount.message}</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                    <input 
                      type="text"
                      {...register('amount')}
                      className={`w-full h-16 bg-white/[0.03] border ${errors.amount ? 'border-red-500/50' : 'border-white/10'} rounded-2xl pl-14 pr-6 text-lg font-black focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-800`}
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex justify-between">
                    <span>Data da Operação</span>
                    {errors.date && <span className="text-[8px] text-red-500 italic">{errors.date.message}</span>}
                  </label>
                  <input 
                    type="date"
                    {...register('date')}
                    className={`w-full h-16 bg-white/[0.03] border ${errors.date ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all [color-scheme:dark]`}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex justify-between">
                  <span>Descrição Detalhada</span>
                  {errors.description && <span className="text-[8px] text-red-500 italic">{errors.description.message}</span>}
                </label>
                <textarea 
                  {...register('description')}
                  className={`w-full h-32 bg-white/[0.03] border ${errors.description ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all resize-none placeholder:text-slate-800`}
                  placeholder="Ex: Compra de suprimentos mensais... (Opcional)"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-4 sm:gap-6 pt-8 md:pt-10 border-t border-white/5">
                <button 
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all text-xs sm:text-sm uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 bg-primary text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm uppercase tracking-[0.2em] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Salvando...' : (editingTransaction ? 'Atualizar Lançamento' : 'Confirmar Lançamento')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
