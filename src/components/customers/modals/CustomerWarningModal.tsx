import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface CustomerWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'both' | 'cpf' | 'phone' | null;
  onConfirm: () => void;
}

export const CustomerWarningModal: React.FC<CustomerWarningModalProps> = ({
  isOpen,
  onClose,
  type,
  onConfirm
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Informações Incompletas</h3>
            <p className="text-slate-400 text-sm mb-8">
              {type === 'both' && "Você não preencheu o CPF e o Telefone do cliente."}
              {type === 'cpf' && "Você não preencheu o CPF do cliente."}
              {type === 'phone' && "Você não preencheu o Telefone do cliente."}
              <br/><br/>
              Deseja salvar assim mesmo?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
              >
                Voltar e Preencher
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 py-4 rounded-2xl font-bold bg-amber-500 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                Salvar Assim Mesmo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
