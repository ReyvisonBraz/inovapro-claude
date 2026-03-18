import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ReceiptText, Wrench, Calendar, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Customer, ClientPayment, ServiceOrder } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  clientPayments: ClientPayment[];
  serviceOrders: ServiceOrder[];
}

export const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({
  isOpen,
  onClose,
  customer,
  clientPayments,
  serviceOrders
}) => {
  if (!customer) return null;

  const customerPayments = clientPayments.filter(p => p.customerId === customer.id);
  const customerOrders = serviceOrders.filter(o => o.customerId === customer.id);

  const historyItems = [
    ...customerPayments.map(p => ({
      id: `payment-${p.id}`,
      date: p.purchaseDate,
      type: 'payment' as const,
      title: p.description,
      amount: p.totalAmount,
      status: p.status,
      details: `${p.installmentsCount}x no ${p.paymentMethod}`
    })),
    ...customerOrders.map(o => ({
      id: `order-${o.id}`,
      date: o.createdAt.split('T')[0],
      type: 'order' as const,
      title: `${o.equipmentBrand} ${o.equipmentModel}`,
      amount: o.totalAmount,
      status: o.status,
      details: o.reportedProblem
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
            className="relative w-full max-w-3xl glass-modal p-8 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Histórico do Cliente</h3>
                <p className="text-sm text-slate-500 font-medium">
                  {customer.firstName} {customer.lastName} {customer.nickname ? `(${customer.nickname})` : ''}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {historyItems.length > 0 ? (
                historyItems.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-4 hover:bg-white/[0.07] transition-all"
                  >
                    <div className={cn(
                      "p-3 rounded-xl",
                      item.type === 'payment' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                    )}>
                      {item.type === 'payment' ? <ReceiptText size={20} /> : <Wrench size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white truncate">{item.title}</h4>
                        <span className="text-sm font-black text-white">{formatCurrency(item.amount)}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(parseISO(item.date), 'dd/MM/yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {item.type === 'payment' ? 'Venda/Parcelamento' : 'Ordem de Serviço'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-400 line-clamp-2 mb-3">{item.details}</p>
                      
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                          item.status === 'paid' || item.status === 'Concluído' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                          item.status === 'pending' || item.status === 'partial' || item.status === 'Aguardando Análise' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                          "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        )}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Clock size={48} className="mb-4 opacity-20" />
                  <p className="font-medium italic text-center">Nenhum histórico encontrado para este cliente.</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={onClose}
                className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-white/5 transition-all"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
