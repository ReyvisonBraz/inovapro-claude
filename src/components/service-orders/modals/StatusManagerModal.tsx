import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ServiceOrderStatus } from '../../../types';

interface StatusManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  statuses: ServiceOrderStatus[];
  onAddStatus: (status: any) => Promise<void>;
  onDeleteStatus: (id: number) => Promise<void>;
}

export const StatusManagerModal: React.FC<StatusManagerModalProps> = ({
  isOpen,
  onClose,
  statuses,
  onAddStatus,
  onDeleteStatus
}) => {
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState({ name: '', color: '#3b82f6', priority: 0 });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md glass-modal p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Gerenciar Status</h3>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Personalize os fluxos de trabalho</p>
              </div>
              <button 
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <button 
                onClick={() => setIsAddingStatus(!isAddingStatus)}
                className="w-full h-12 flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-xl font-bold border border-primary/20 hover:bg-primary/20 transition-all"
              >
                {isAddingStatus ? <X size={18} /> : <Plus size={18} />}
                {isAddingStatus ? 'Cancelar' : 'Novo Status'}
              </button>

              {isAddingStatus && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nome</label>
                      <input 
                        value={newStatus.name}
                        onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Ex: Em Teste"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cor</label>
                      <input 
                        type="color"
                        value={newStatus.color}
                        onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-1 py-1 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsAddingStatus(false)}
                      className="flex-1 h-10 rounded-lg font-bold text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        if (!newStatus.name) return;
                        onAddStatus(newStatus);
                        setIsAddingStatus(false);
                        setNewStatus({ name: '', color: '#3b82f6', priority: 0 });
                      }}
                      className="flex-1 h-10 rounded-lg bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      Adicionar
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {statuses.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: s.color }} />
                      <span className="text-sm font-bold">{s.name}</span>
                      {s.isDefault && <span className="text-xs font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/10 text-slate-500 rounded">Padrão</span>}
                    </div>
                    {!s.isDefault && (
                      <button 
                        onClick={() => onDeleteStatus(s.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full h-14 mt-8 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
            >
              Fechar
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
