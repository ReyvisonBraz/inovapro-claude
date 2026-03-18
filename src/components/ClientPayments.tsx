import React from 'react';
import { Search, ChevronDown, ChevronUp, Trash2, MessageCircle, Zap, Printer, CheckCircle2, Clock, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientPayment, Customer } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { AddClientPaymentModal } from './modals/AddClientPaymentModal';
import { RecordPaymentModal } from './modals/RecordPaymentModal';

interface ClientPaymentsProps {
  filteredClientPayments: ClientPayment[];
  setIsAddingClientPayment: (isAdding: boolean) => void;
  isAddingClientPayment: boolean;
  paymentSearchTerm: string;
  setPaymentSearchTerm: (term: string) => void;
  paymentFilterStatus: string;
  setPaymentFilterStatus: (status: string) => void;
  paymentSortMode: 'date' | 'amount' | 'alphabetical';
  setPaymentSortMode: (mode: 'date' | 'amount' | 'alphabetical') => void;
  togglePaymentExpansion: (id: number) => void;
  expandedPayments: number[];
  isRecordingPayment: ClientPayment | null;
  setIsRecordingPayment: (payment: ClientPayment | null) => void;
  generateReceipt: (payment: ClientPayment, type: 'simple' | 'a4') => void;
  sendWhatsAppReminder: (payment: ClientPayment) => void;
  handleDeleteClientPayment: (payment: ClientPayment) => void;
  handleRecordPayment: () => void;
  paymentAmount: string;
  setPaymentAmount: (amount: string) => void;
  customers: Customer[];
  newClientPayment: any;
  setNewClientPayment: (payment: any) => void;
  handleAddClientPayment: () => void;
  isSaving?: boolean;
}

export const ClientPayments = ({
  filteredClientPayments,
  setIsAddingClientPayment,
  isAddingClientPayment,
  paymentSearchTerm,
  setPaymentSearchTerm,
  paymentFilterStatus,
  setPaymentFilterStatus,
  paymentSortMode,
  setPaymentSortMode,
  togglePaymentExpansion,
  expandedPayments,
  isRecordingPayment,
  setIsRecordingPayment,
  generateReceipt,
  sendWhatsAppReminder,
  handleDeleteClientPayment,
  handleRecordPayment,
  paymentAmount,
  setPaymentAmount,
  customers,
  newClientPayment,
  setNewClientPayment,
  handleAddClientPayment,
  isSaving
}: ClientPaymentsProps) => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Pagamentos e Parcelamentos</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Registre vendas, parcelamentos e envie lembretes de cobrança</p>
        </div>
        <button 
          onClick={() => setIsAddingClientPayment(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          Novo Registro
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text"
              placeholder="Buscar por cliente ou descrição..."
              value={paymentSearchTerm}
              onChange={(e) => setPaymentSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <select
            value={paymentFilterStatus}
            onChange={(e) => setPaymentFilterStatus(e.target.value)}
            className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
          >
            <option value="all">Todos os Status</option>
            <option value="paid">Pagos</option>
            <option value="partial">Parciais</option>
            <option value="pending">Pendentes</option>
            <option value="overdue">Vencidos</option>
          </select>
          <select
            value={paymentSortMode}
            onChange={(e) => setPaymentSortMode(e.target.value as any)}
            className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
          >
            <option value="date">Mais Recentes</option>
            <option value="amount">Maior Valor</option>
            <option value="alphabetical">Ordem Alfabética</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Vencimento</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Total</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClientPayments.map(payment => (
                <React.Fragment key={payment.id}>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => togglePaymentExpansion(payment.id)}
                          className="p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors"
                        >
                          {expandedPayments.includes(payment.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <p className="text-sm font-bold">{payment.customerName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-300">{payment.description}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{payment.paymentMethod} • {payment.installmentsCount}x</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={cn(
                        "text-sm font-bold",
                        new Date(payment.dueDate) < new Date() && payment.status !== 'paid' ? "text-rose-500" : "text-slate-300"
                      )}>
                        {format(parseISO(payment.dueDate), 'dd/MM/yyyy')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black">{formatCurrency(payment.totalAmount)}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Pago: {formatCurrency(payment.paidAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                        payment.status === 'paid' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                        payment.status === 'partial' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                        "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      )}>
                        {payment.status === 'paid' ? 'Pago' : payment.status === 'partial' ? 'Parcial' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payment.status !== 'paid' && (
                          <button 
                            onClick={() => setIsRecordingPayment(payment)}
                            className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                            title="Registrar Pagamento"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        <div className="flex gap-1">
                          <button 
                            onClick={() => generateReceipt(payment, 'simple')}
                            className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                            title="Recibo Térmico (80mm)"
                          >
                            <Zap size={14} />
                          </button>
                          <button 
                            onClick={() => generateReceipt(payment, 'a4')}
                            className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                            title="Recibo A4 Completo"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => sendWhatsAppReminder(payment)}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClientPayment(payment)}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedPayments.includes(payment.id) && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/[0.01] border-b border-white/5"
                      >
                        <td colSpan={6} className="px-6 py-4">
                          <div className="pl-10">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Histórico de Pagamentos</h4>
                            {payment.paymentHistory && JSON.parse(payment.paymentHistory).length > 0 ? (
                              <div className="space-y-2">
                                {JSON.parse(payment.paymentHistory).map((h: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 max-w-md">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                        <CheckCircle2 size={14} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold">{formatCurrency(h.amount)}</p>
                                        <p className="text-[10px] text-slate-500">{format(parseISO(h.date), 'dd/MM/yyyy HH:mm')}</p>
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                      Parcela {i + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 italic">Nenhum pagamento registrado ainda.</p>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
              {filteredClientPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic">
                    Nenhum pagamento encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Payment Modal */}
      <AddClientPaymentModal 
        isOpen={isAddingClientPayment}
        onClose={() => setIsAddingClientPayment(false)}
        customers={customers}
        newClientPayment={newClientPayment}
        setNewClientPayment={setNewClientPayment}
        onAdd={handleAddClientPayment}
        isSaving={isSaving}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal 
        payment={isRecordingPayment}
        onClose={() => setIsRecordingPayment(null)}
        onConfirm={handleRecordPayment}
        amount={paymentAmount}
        setAmount={setPaymentAmount}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};
