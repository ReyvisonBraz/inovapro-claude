import React from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { AVAILABLE_ICONS } from './equipmentIcons';

interface AddTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, iconName: string) => void;
}

export function AddTypeModal({ isOpen, onClose, onAdd }: AddTypeModalProps) {
  const [newTypeName, setNewTypeName] = React.useState('');
  const [selectedIconName, setSelectedIconName] = React.useState('MonitorCheck');

  const handleAdd = () => {
    if (!newTypeName.trim()) return;
    onAdd(newTypeName.trim(), selectedIconName);
    setNewTypeName('');
    setSelectedIconName('MonitorCheck');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/95 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="w-full max-w-2xl glass-modal p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-500 to-emerald-500" />

            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">Novo Tipo</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Categoria de Equipamento</p>
              </div>
              <button onClick={onClose} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nome do Tipo</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.25rem] px-6 text-lg font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Ex: Console, Tablet, Drone..."
                  autoFocus
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Selecione um Ícone</label>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-3 max-h-[240px] overflow-y-auto p-2 custom-scrollbar bg-white/[0.02] rounded-[1.5rem] border border-white/5">
                  {AVAILABLE_ICONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedIconName === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setSelectedIconName(item.name)}
                        className={cn(
                          "flex flex-col items-center justify-center aspect-square rounded-2xl border-2 transition-all duration-300",
                          isSelected
                            ? "bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(17,82,212,0.2)]"
                            : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-slate-300"
                        )}
                        title={item.name}
                      >
                        <Icon size={24} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 h-16 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-[1.25rem] hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-[2] h-16 bg-primary text-white font-black uppercase tracking-widest rounded-[1.25rem] shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={20} /> Adicionar Tipo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}