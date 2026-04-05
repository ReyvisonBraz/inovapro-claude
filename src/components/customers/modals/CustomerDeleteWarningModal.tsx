import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface CustomerDeleteWarningModalProps {
  customer: any;
  paymentsWarning: any[];
  onClose: () => void;
  onConfirm: () => void;
  onGoToPayments: () => void;
  formatCurrency: (value: number) => string;
}

export const CustomerDeleteWarningModal: React.FC<CustomerDeleteWarningModalProps> = ({
  customer,
  paymentsWarning,
  onClose,
  onConfirm,
  onGoToPayments,
  formatCurrency
}) => {
  return (
    <AnimatePresence>
      {customer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-modal p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Atenção!</h3>
            
            {paymentsWarning.length > 0 ? (
              <>
                <p className="text-slate-400 text-sm mb-6">
                  O cliente <strong className="text-slate-200">{customer.firstName} {customer.lastName}</strong> possui <strong>{paymentsWarning.length}</strong> lançamento(s) vinculado(s).
                </p>
                <div className="bg-white/5 rounded-xl p-4 mb-8 max-h-40 overflow-y-auto text-left space-y-2">
                  {paymentsWarning.map((p, i) => (
                    <div key={i} className="text-xs text-slate-300 flex justify-between">
                      <span className="truncate pr-4">{p.description}</span>
                      <span className="font-bold text-slate-400">{formatCurrency(p.totalAmount - p.paidAmount)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={onGoToPayments}
                    className="w-full py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                  >
                    Ir para Pagamentos
                  </button>
                  <button 
                    onClick={onConfirm}
                    className="w-full py-4 rounded-2xl font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                  >
                    Excluir Cliente e Pagamentos
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-400 text-sm mb-8">
                  Tem certeza que deseja excluir o cliente <strong className="text-slate-200">{customer.firstName} {customer.lastName}</strong>? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={onClose}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={onConfirm}
                    className="flex-1 py-4 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02]"
                  >
                    Excluir Cliente
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
