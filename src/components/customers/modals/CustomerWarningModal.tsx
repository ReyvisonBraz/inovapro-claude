import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, UserX } from 'lucide-react';

interface CustomerWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'both' | 'cpf' | 'phone' | null;
  onConfirm: () => void;
  existingName?: string; // Name of the conflicting customer (from server 409)
}

export const CustomerWarningModal: React.FC<CustomerWarningModalProps> = ({
  isOpen,
  onClose,
  type,
  onConfirm,
  existingName,
}) => {
  const isDuplicate = !!existingName;

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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDuplicate ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {isDuplicate ? <UserX size={32} /> : <AlertTriangle size={32} />}
            </div>

            {isDuplicate ? (
              <>
                <h3 className="text-xl font-bold mb-2">Telefone já cadastrado</h3>
                <p className="text-slate-400 text-sm mb-8">
                  Este número de telefone já está cadastrado para{' '}
                  <span className="text-white font-bold">{existingName}</span>.
                  <br /><br />
                  Deseja cadastrar um novo cliente com o mesmo número?
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">Cadastro Duplicado</h3>
                <p className="text-slate-400 text-sm mb-8">
                  {type === 'both' && 'Já existe um cliente com o mesmo CPF e Telefone no sistema.'}
                  {type === 'cpf' && 'Já existe um cliente com o mesmo CPF no sistema.'}
                  {type === 'phone' && 'Já existe um cliente com o mesmo telefone no sistema.'}
                  <br /><br />
                  Deseja cadastrar mesmo assim?
                </p>
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-4 rounded-2xl font-bold shadow-lg transition-all hover:scale-[1.02] ${isDuplicate ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}
              >
                Cadastrar Mesmo Assim
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
