import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction: any;
  newTx: {
    description: string;
    category: string;
    type: 'income' | 'expense';
    amount: string;
    date: string;
  };
  setNewTx: (tx: any) => void;
  categories: any[];
  onSubmit: (e: React.FormEvent) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
  newTx,
  setNewTx,
  categories,
  onSubmit
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl glass-modal p-8 lg:p-12"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  {editingTransaction ? <Edit size={28} /> : <Plus size={28} />}
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight">
                    {editingTransaction ? 'Editar Transação' : 'Nova Entrada'}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Preencha os detalhes da sua movimentação</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Tipo de Fluxo</label>
                  <select 
                    value={newTx.type}
                    onChange={(e) => setNewTx({...newTx, type: e.target.value as any, category: ''})}
                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer [&>option]:bg-slate-900"
                  >
                    <option value="expense" className="bg-slate-900">Despesa (Saída)</option>
                    <option value="income" className="bg-slate-900">Renda (Entrada)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Categoria</label>
                  <select 
                    value={newTx.category}
                    onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer [&>option]:bg-slate-900"
                    required
                  >
                    <option value="" disabled className="bg-slate-900">Selecionar categoria</option>
                    {newTx.type === 'income' ? (
                      categories.filter(c => c.type === 'income').map(cat => (
                        <option key={cat.id} value={cat.name} className="bg-slate-900">{cat.name}</option>
                      ))
                    ) : (
                      categories.filter(c => c.type === 'expense').map(cat => (
                        <option key={cat.id} value={cat.name} className="bg-slate-900">{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                    <input 
                      type="number"
                      step="0.01"
                      value={newTx.amount}
                      onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                      className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 text-lg font-black focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-800"
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Data da Operação</label>
                  <input 
                    type="date"
                    value={newTx.date}
                    onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Descrição Detalhada</label>
                <textarea 
                  value={newTx.description}
                  onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                  className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all resize-none placeholder:text-slate-800"
                  placeholder="Ex: Compra de suprimentos mensais... (Opcional)"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-6 pt-10 border-t border-white/5">
                <button 
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="w-full sm:flex-1 bg-primary text-white py-5 rounded-2xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm uppercase tracking-[0.2em]"
                >
                  {editingTransaction ? 'Atualizar Lançamento' : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
