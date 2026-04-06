import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recordPaymentSchema, RecordPaymentFormData } from '../../../schemas/paymentSchema';

interface RecordPaymentModalProps {
  payment: any;
  onClose: () => void;
  onConfirm: (data: RecordPaymentFormData) => void;
  formatCurrency: (value: number) => string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  payment,
  onClose,
  onConfirm,
  formatCurrency
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    if (payment) {
      reset({
        amount: payment.totalAmount - payment.paidAmount,
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [payment, reset]);

  const onFormSubmit = (data: RecordPaymentFormData) => {
    onConfirm(data);
  };

  return (
    <AnimatePresence>
      {payment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-modal p-4 sm:p-6 md:p-8"
          >
            <h3 className="text-lg md:text-xl font-bold mb-2">Registrar Pagamento</h3>
            <div className="text-xs md:text-sm text-slate-500 mb-6">
              Cliente: <span className="text-slate-200 font-bold">{payment.customerName}</span><br/>
              Saldo Devedor: <span className="text-primary font-bold">{formatCurrency(payment.totalAmount - payment.paidAmount)}</span>
            </div>
            
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data do Pagamento</label>
                  <input 
                    type="date"
                    {...register('date')}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                  {errors.date && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.date.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor do Pagamento</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                    <input 
                      type="number"
                      step="0.01"
                      autoFocus
                      {...register('amount')}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.amount.message}</p>}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] order-1 sm:order-2"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
