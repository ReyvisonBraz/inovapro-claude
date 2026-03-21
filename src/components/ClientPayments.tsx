import React from 'react';
import { Search, ChevronDown, ChevronUp, Trash2, MessageCircle, Zap, Printer, CheckCircle2, Clock, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { ClientPayment, Customer } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { AddClientPaymentModal } from './modals/AddClientPaymentModal';
import { RecordPaymentModal } from './modals/RecordPaymentModal';

import { Pagination } from './ui/Pagination';

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
  handleDeleteClientPaymentGroup: (saleId: string) => void;
  handleRecordPayment: () => void;
  paymentAmount: string;
  setPaymentAmount: (amount: string) => void;
  paymentDate: string;
  setPaymentDate: (date: string) => void;
  customers: Customer[];
  newClientPayment: any;
  setNewClientPayment: (payment: any) => void;
  handleAddClientPayment: () => void;
  isSaving?: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
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
  handleDeleteClientPaymentGroup,
  handleRecordPayment,
  paymentAmount,
  setPaymentAmount,
  paymentDate,
  setPaymentDate,
  customers,
  newClientPayment,
  setNewClientPayment,
  handleAddClientPayment,
  isSaving,
  pagination,
  onPageChange
}: ClientPaymentsProps) => {
  const groupedPayments = React.useMemo(() => {
    const groups: { [key: string]: ClientPayment[] } = {};
    const result: (ClientPayment | { isGroup: true, payments: ClientPayment[], saleId: string })[] = [];
    const processedSaleIds = new Set<string>();

    // First pass: identify groups
    filteredClientPayments.forEach(payment => {
      if (payment.saleId) {
        if (!groups[payment.saleId]) {
          groups[payment.saleId] = [];
        }
        groups[payment.saleId].push(payment);
      }
    });

    // Second pass: build the result list maintaining original order (sort of)
    filteredClientPayments.forEach(payment => {
      if (!payment.saleId) {
        result.push(payment);
      } else if (!processedSaleIds.has(payment.saleId)) {
        const groupPayments = groups[payment.saleId];
        if (groupPayments.length > 1) {
          result.push({ isGroup: true, payments: groupPayments, saleId: payment.saleId });
        } else {
          result.push(payment);
        }
        processedSaleIds.add(payment.saleId);
      }
    });

    return result;
  }, [filteredClientPayments]);

  return (
    <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">Pagamentos e Parcelamentos</h3>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Registre vendas, parcelamentos e envie lembretes de cobrança</p>
        </div>
        <button 
          onClick={() => setIsAddingClientPayment(true)}
          className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          Novo Registro
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text"
              placeholder="Buscar por cliente ou descrição..."
              value={paymentSearchTerm}
              onChange={(e) => setPaymentSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select
              value={paymentFilterStatus}
              onChange={(e) => setPaymentFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
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
              className="flex-1 sm:flex-none h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
            >
              <option value="date">Mais Recentes</option>
              <option value="amount">Maior Valor</option>
              <option value="alphabetical">Ordem Alfabética</option>
            </select>
          </div>
        </div>
        {/* Mobile View */}
        <div className="md:hidden divide-y divide-white/5">
          {groupedPayments.map((item, index) => {
            if ('isGroup' in item) {
              const totalGroupAmount = item.payments.reduce((acc, p) => acc + p.totalAmount, 0);
              const totalGroupPaid = item.payments.reduce((acc, p) => acc + p.paidAmount, 0);
              const allPaid = item.payments.every(p => p.status === 'paid');
              const someOverdue = item.payments.some(p => new Date(p.dueDate) < new Date() && p.status !== 'paid');

              return (
                <div key={item.saleId} className="p-4 space-y-4 bg-white/[0.02] border-l-4 border-primary">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-primary" />
                      <p className="text-sm font-bold text-primary">Venda Agrupada</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                      allPaid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                      someOverdue ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                      "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    )}>
                      {allPaid ? 'Concluído' : someOverdue ? 'Vencido' : 'Em Aberto'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {item.payments.map(payment => (
                      <div key={payment.id} className="pl-4 border-l border-white/10 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{payment.customerName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{payment.description}</p>
                          </div>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border shrink-0",
                            payment.status === 'paid' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                            payment.status === 'partial' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                            "bg-rose-500/10 border-rose-500/20 text-rose-500"
                          )}>
                            {payment.status === 'paid' ? 'Pago' : payment.status === 'partial' ? 'Parcial' : 'Pendente'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] text-slate-500">{format(parseISO(payment.dueDate), 'dd/MM/yyyy')}</p>
                          <p className="text-xs font-bold">{formatCurrency(payment.totalAmount)}</p>
                        </div>
                        <div className="flex gap-1">
                          {payment.status !== 'paid' && (
                            <button onClick={() => setIsRecordingPayment(payment)} className="p-1.5 rounded bg-primary/10 text-primary border border-primary/20"><CheckCircle2 size={12} /></button>
                          )}
                          <button onClick={() => generateReceipt(payment, 'simple')} className="p-1.5 rounded bg-white/5 text-slate-400 border border-white/10"><Zap size={12} /></button>
                          <button onClick={() => sendWhatsAppReminder(payment)} className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><MessageCircle size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total da Venda</p>
                      <button 
                        onClick={() => handleDeleteClientPaymentGroup(item.saleId)}
                        className="p-1.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{formatCurrency(totalGroupAmount)}</p>
                      <p className="text-[10px] text-emerald-500 font-bold">Pago: {formatCurrency(totalGroupPaid)}</p>
                    </div>
                  </div>
                </div>
              );
            }

            const payment = item;
            return (
              <div key={payment.id} className="p-4 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button 
                      onClick={() => togglePaymentExpansion(payment.id)}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors shrink-0"
                    >
                      {expandedPayments.includes(payment.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{payment.customerName}</p>
                      <p className="text-xs text-slate-400 truncate">{payment.description}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border shrink-0",
                    payment.status === 'paid' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    payment.status === 'partial' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                    "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  )}>
                    {payment.status === 'paid' ? 'Pago' : payment.status === 'partial' ? 'Parcial' : 'Pendente'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Vencimento</p>
                    <p className={cn(
                      "text-sm font-bold",
                      new Date(payment.dueDate) < new Date() && payment.status !== 'paid' ? "text-rose-500" : "text-slate-300"
                    )}>
                      {format(parseISO(payment.dueDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total / Pago</p>
                    <p className="text-sm font-black">{formatCurrency(payment.totalAmount)}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{formatCurrency(payment.paidAmount)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {payment.status !== 'paid' && (
                    <button 
                      onClick={() => setIsRecordingPayment(payment)}
                      className="flex-1 flex justify-center items-center py-3 px-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                      title="Registrar Pagamento"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => generateReceipt(payment, 'simple')}
                    className="flex-1 flex justify-center items-center py-3 px-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                    title="Recibo Térmico"
                  >
                    <Zap size={16} />
                  </button>
                  <button 
                    onClick={() => generateReceipt(payment, 'a4')}
                    className="flex-1 flex justify-center items-center py-3 px-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                    title="Recibo A4"
                  >
                    <Printer size={16} />
                  </button>
                  <button 
                    onClick={() => sendWhatsAppReminder(payment)}
                    className="flex-1 flex justify-center items-center py-3 px-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                    title="WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClientPayment(payment)}
                    className="flex-1 flex justify-center items-center py-3 px-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <AnimatePresence>
                  {expandedPayments.includes(payment.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-white/5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Histórico de Pagamentos</h4>
                        {payment.paymentHistory && JSON.parse(payment.paymentHistory).length > 0 ? (
                          <div className="space-y-2">
                            {JSON.parse(payment.paymentHistory).map((h: any, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {filteredClientPayments.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-2">
                <Search size={24} />
              </div>
              <p className="text-slate-400 font-medium">Nenhum pagamento encontrado com os filtros atuais.</p>
              <button 
                onClick={() => {
                  setPaymentSearchTerm('');
                  setPaymentFilterStatus('all');
                }}
                className="text-primary text-sm font-bold hover:underline mt-2"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
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
              {groupedPayments.map((item, index) => {
                if ('isGroup' in item) {
                  const totalGroupAmount = item.payments.reduce((acc, p) => acc + p.totalAmount, 0);
                  const totalGroupPaid = item.payments.reduce((acc, p) => acc + p.paidAmount, 0);
                  const allPaid = item.payments.every(p => p.status === 'paid');
                  const someOverdue = item.payments.some(p => new Date(p.dueDate) < new Date() && p.status !== 'paid');

                  return (
                    <React.Fragment key={item.saleId}>
                      {/* Group Header Row */}
                      <tr className="bg-white/[0.03] border-l-4 border-primary">
                        <td colSpan={3} className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Zap size={16} className="text-primary" />
                            <div>
                              <p className="text-sm font-bold text-primary">Venda Agrupada: {item.payments[0].customerName}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.payments[0].description.split(' (')[0]}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-sm font-black text-primary">{formatCurrency(totalGroupAmount)}</p>
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Pago: {formatCurrency(totalGroupPaid)}</p>
                        </td>
                        <td className="px-6 py-3">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                            allPaid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                            someOverdue ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                            "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          )}>
                            {allPaid ? 'Concluído' : someOverdue ? 'Vencido' : 'Em Aberto'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.payments.length} Lançamentos</span>
                            <button 
                              onClick={() => handleDeleteClientPaymentGroup(item.saleId)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                              title="Excluir Venda Completa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Individual Payments in Group */}
                      {item.payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors border-l-4 border-primary/30">
                          <td className="px-6 py-4 pl-12">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => togglePaymentExpansion(payment.id)}
                                className="p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors"
                              >
                                {expandedPayments.includes(payment.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                              <p className="text-sm font-medium text-slate-400">└ {payment.customerName}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-300">{payment.description}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{payment.paymentMethod}</p>
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
                      ))}
                    </React.Fragment>
                  );
                }

                const payment = item;
                return (
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
                );
              })}
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

        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={onPageChange}
        />
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
        date={paymentDate}
        setDate={setPaymentDate}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};
