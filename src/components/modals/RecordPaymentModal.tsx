import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RecordPaymentModalProps {
  payment: any;
  onClose: () => void;
  onConfirm: () => void;
  amount: string;
  setAmount: (amount: string) => void;
  formatCurrency: (value: number) => string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  payment,
  onClose,
  onConfirm,
  amount,
  setAmount,
  formatCurrency
}) => {
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
            className="relative w-full max-w-md glass-modal p-8"
          >
            <h3 className="text-xl font-bold mb-2">Registrar Pagamento</h3>
            <p className="text-sm text-slate-500 mb-6">
              Cliente: <span className="text-slate-200 font-bold">{payment.customerName}</span><br/>
              Saldo Devedor: <span className="text-primary font-bold">{formatCurrency(payment.totalAmount - payment.paidAmount)}</span>
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor do Pagamento</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                  <input 
                    type="number"
                    autoFocus
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
