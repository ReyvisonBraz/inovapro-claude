import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  passwordInput: string;
  setPasswordInput: (value: string) => void;
}

export const PasswordModal = ({ isOpen, onClose, onUnlock, passwordInput, setPasswordInput }: PasswordModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-modal w-full max-w-md p-8 relative z-10"
        >
          <div className="flex flex-col items-center text-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Settings size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Área Restrita</h3>
              <p className="text-sm text-slate-500 mt-2">Insira a senha de acesso para gerenciar as configurações do sistema.</p>
            </div>
            
            <div className="w-full space-y-4">
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full text-center text-2xl tracking-[0.5em]"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && onUnlock()}
              />
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={onUnlock}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
                >
                  Desbloquear
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
