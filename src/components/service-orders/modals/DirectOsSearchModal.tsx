import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search } from 'lucide-react';
import { useToast } from '../../ui/Toast';

interface DirectOsSearchModalProps {
  show: boolean;
  onClose: () => void;
  orders: any[];
  handleEdit: (order: any) => void;
}

export const DirectOsSearchModal: React.FC<DirectOsSearchModalProps> = ({
  show,
  onClose,
  orders,
  handleEdit
}) => {
  const [directOsSearch, setDirectOsSearch] = React.useState('');
  const { showToast } = useToast();

    const handleDirectOsSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!directOsSearch.trim()) return;
      
      const searchNumber = parseInt(directOsSearch.toUpperCase().replace('OS-', '').replace(/[^0-9]/g, ''), 10);
      if (isNaN(searchNumber)) {
        showToast('Número de OS inválido', 'error');
        return;
      }
      
      const order = orders.find(o => o.id === searchNumber);
      if (order) {
        onClose();
        setDirectOsSearch('');
        handleEdit(order);
      } else {
        showToast(`OS-${searchNumber.toString().padStart(4, '0')} não encontrada`, 'error');
      }
    };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
            className="relative w-full max-w-sm glass-modal rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Buscar OS</h3>
                  <p className="text-xs text-slate-400 font-medium">Acesso rápido pelo número</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDirectOsSearch} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Número da OS</label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">OS-</span>
                  <input 
                    type="text"
                    autoFocus
                    placeholder="0001"
                    value={directOsSearch}
                    onChange={(e) => setDirectOsSearch(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <Search size={18} />
                Abrir Ordem de Serviço
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
