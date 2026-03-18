import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerSearchSelect } from '../CustomerSearchSelect';

interface AddClientPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
  newClientPayment: {
    customerId: string;
    description: string;
    totalAmount: string;
    paidAmount: string;
    purchaseDate: string;
    dueDate: string;
    paymentMethod: string;
    installmentsCount: number;
  };
  setNewClientPayment: (payment: any) => void;
  onAdd: () => void;
  isSaving?: boolean;
}

export const AddClientPaymentModal: React.FC<AddClientPaymentModalProps> = ({
  isOpen,
  onClose,
  customers,
  newClientPayment,
  setNewClientPayment,
  onAdd,
  isSaving
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl glass-modal p-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-6">Novo Registro de Venda/Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cliente</label>
                <CustomerSearchSelect 
                  customers={customers}
                  selectedId={newClientPayment.customerId}
                  onSelect={(id) => setNewClientPayment({...newClientPayment, customerId: id})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição da Compra</label>
                <input 
                  value={newClientPayment.description}
                  onChange={(e) => setNewClientPayment({...newClientPayment, description: e.target.value})}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Ex: Venda de Notebook"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Total</label>
                <input 
                  type="number"
                  value={newClientPayment.totalAmount}
                  onChange={(e) => setNewClientPayment({...newClientPayment, totalAmount: e.target.value})}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Já Pago (Entrada)</label>
                <input 
                  type="number"
                  value={newClientPayment.paidAmount}
                  onChange={(e) => setNewClientPayment({...newClientPayment, paidAmount: e.target.value})}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data da Compra</label>
                <input 
                  type="date"
                  value={newClientPayment.purchaseDate}
                  onChange={(e) => setNewClientPayment({...newClientPayment, purchaseDate: e.target.value})}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none [color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data de Vencimento</label>
                <input 
                  type="date"
                  value={newClientPayment.dueDate}
                  onChange={(e) => setNewClientPayment({...newClientPayment, dueDate: e.target.value})}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none [color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Forma de Pagamento</label>
                <select 
                  value={newClientPayment.paymentMethod}
                  onChange={(e) => setNewClientPayment({...newClientPayment, paymentMethod: e.target.value})}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nº de Parcelas</label>
                <input 
                  type="number"
                  value={newClientPayment.installmentsCount}
                  onChange={(e) => setNewClientPayment({...newClientPayment, installmentsCount: parseInt(e.target.value)})}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-8">
              <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={onAdd}
                disabled={isSaving}
                className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Registrando...' : 'Registrar Venda'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
