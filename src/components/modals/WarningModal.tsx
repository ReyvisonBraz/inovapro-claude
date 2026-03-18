import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'category' | 'description' | 'both';
  onConfirm: () => void;
  showWarnings: boolean;
  setShowWarnings: (value: boolean) => void;
}

export const WarningModal = ({ isOpen, onClose, type, onConfirm, showWarnings, setShowWarnings }: WarningModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-modal w-full max-w-md p-8 relative z-10"
        >
          <div className="flex flex-col items-center text-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Campos Incompletos</h3>
              <p className="text-sm text-slate-500 mt-2">
                {type === 'both' ? 'Você não selecionou uma categoria nem preencheu a descrição.' : 
                 type === 'category' ? 'Você não selecionou uma categoria para este lançamento.' : 
                 'Você não preencheu a descrição deste lançamento.'}
                <br />Deseja continuar assim mesmo?
              </p>
            </div>
            
            <div className="w-full space-y-6">
              <label className="flex items-center gap-3 cursor-pointer group justify-center">
                <input 
                  type="checkbox" 
                  checked={!showWarnings}
                  onChange={(e) => setShowWarnings(!e.target.checked)}
                  className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 text-primary focus:ring-primary outline-none transition-all"
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-widest">Não mostrar este aviso novamente</span>
              </label>

              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  Voltar e Corrigir
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
