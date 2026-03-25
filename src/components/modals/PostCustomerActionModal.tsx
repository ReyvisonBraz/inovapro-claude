import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, CreditCard, Briefcase } from 'lucide-react';

interface PostCustomerActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'os' | 'payment' | 'none', dontShowAgain: boolean) => void;
  customerName: string;
}

export const PostCustomerActionModal: React.FC<PostCustomerActionModalProps> = ({
  isOpen,
  onClose,
  onAction,
  customerName
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setDontShowAgain(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Cliente Cadastrado!</h3>
                </div>
                <button 
                  onClick={() => onAction('none', dontShowAgain)}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                O cliente <strong className="text-white">{customerName}</strong> foi salvo com sucesso. O que você deseja fazer agora?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => onAction('os', dontShowAgain)}
                  className="w-full relative group overflow-hidden pl-4 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all flex items-center justify-between"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3 relative">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-white text-sm">Criar Nova OS</h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Abrir Ordem de Serviço</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onAction('payment', dontShowAgain)}
                  className="w-full relative group overflow-hidden pl-4 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all flex items-center justify-between"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3 relative">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-white text-sm">Lançar Pagamento</h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Adicionar venda/financiamento</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <label className="flex items-center gap-2 cursor-pointer group w-fit">
                  <input 
                    type="checkbox" 
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-4 h-4 rounded-md bg-white/5 border border-white/10 text-primary focus:ring-primary outline-none transition-all"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Não exibir esta mensagem novamente</span>
                </label>
                
                <button
                  onClick={() => onAction('none', dontShowAgain)}
                  className="w-full py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-slate-300 transition-all text-sm"
                >
                  Agora não
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
