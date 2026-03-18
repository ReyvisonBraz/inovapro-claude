import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCustomer: any;
  newCustomer: {
    firstName: string;
    lastName: string;
    nickname: string;
    cpf: string;
    companyName: string;
    phone: string;
    observation: string;
    creditLimit: string;
  };
  setNewCustomer: (customer: any) => void;
  onSave: (force?: boolean) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  editingCustomer,
  newCustomer,
  setNewCustomer,
  onSave
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl glass-modal p-8 overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex justify-between">
                    <span>Nome *</span>
                    <span className="text-[8px] text-primary/60 italic">Obrigatório</span>
                  </label>
                  <input 
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                    className="w-full h-12 bg-white/5 border-2 border-primary/30 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="João"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sobrenome</label>
                  <input 
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Silva"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Apelido</label>
                  <input 
                    value={newCustomer.nickname}
                    onChange={(e) => setNewCustomer({...newCustomer, nickname: e.target.value})}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Jão"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">CPF</label>
                  <input 
                    value={newCustomer.cpf}
                    onChange={(e) => setNewCustomer({...newCustomer, cpf: e.target.value})}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome da Empresa</label>
                  <input 
                    value={newCustomer.companyName}
                    onChange={(e) => setNewCustomer({...newCustomer, companyName: e.target.value})}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Empresa LTDA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex justify-between">
                    <span>Telefone (WhatsApp) *</span>
                    <span className="text-[8px] text-primary/60 italic">Obrigatório</span>
                  </label>
                  <input 
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full h-12 bg-white/5 border-2 border-primary/30 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="5511999999999"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Limite de Crédito</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                    <input 
                      type="number"
                      value={newCustomer.creditLimit}
                      onChange={(e) => setNewCustomer({...newCustomer, creditLimit: e.target.value})}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Observações</label>
                <textarea 
                  value={newCustomer.observation}
                  onChange={(e) => setNewCustomer({...newCustomer, observation: e.target.value})}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Notas sobre o cliente..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => onSave(false)}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  {editingCustomer ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
