import React, { Fragment } from 'react';
import { ChevronDown, ChevronUp, Trash2, MessageCircle, Zap, Printer, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import type { ClientPayment, PaymentListItem } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { PaymentHistory } from './PaymentHistory';
import { EmptyState } from '../ui/EmptyState';

interface PaymentTableDesktopProps {
  groupedPayments: PaymentListItem[];
  expandedPayments: (number | string)[];
  togglePaymentExpansion: (id: number | string) => void;
  onRecordPayment: (payment: ClientPayment) => void;
  onGenerateReceipt: (payment: ClientPayment, type: 'simple' | 'a4') => void;
  onSendWhatsApp: (payment: ClientPayment) => void;
  onDeletePayment: (payment: ClientPayment) => void;
  onDeleteGroup: (saleId: string) => void;
  hasPayments: boolean;
}

function statusBadgeClass(status: string) {
  return cn(
    'px-2 py-1 rounded-md text-xs font-bold uppercase tracking-widest border',
    status === 'paid'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
      : status === 'partial'
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
        : 'bg-rose-500/10 border-rose-500/20 text-rose-500',
  );
}

function statusLabel(status: string) {
  if (status === 'paid') return 'Pago';
  if (status === 'partial') return 'Parcial';
  return 'Pendente';
}

function isOverdue(payment: ClientPayment) {
  return new Date(payment.dueDate) < new Date() && payment.status !== 'paid';
}

export function PaymentTableDesktop({
  groupedPayments,
  expandedPayments,
  togglePaymentExpansion,
  onRecordPayment,
  onGenerateReceipt,
  onSendWhatsApp,
  onDeletePayment,
  onDeleteGroup,
  hasPayments,
}: PaymentTableDesktopProps) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/5">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Cliente</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Descrição</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Vencimento</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Valor Total</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {groupedPayments.map((item) => {
            if ('isGroup' in item) {
              const totalGroupAmount = item.payments.reduce((acc, p) => acc + p.totalAmount, 0);
              const totalGroupPaid = item.payments.reduce((acc, p) => acc + p.paidAmount, 0);
              const allPaid = item.payments.every((p) => p.status === 'paid');
              const someOverdue = item.payments.some((p) => isOverdue(p));

              return (
                <Fragment key={item.saleId}>
                  <tr className="bg-white/[0.03] border-l-4 border-primary">
                    <td colSpan={3} className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => togglePaymentExpansion(item.saleId)} className="p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors">
                          {expandedPayments.includes(item.saleId) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <div className="flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded-md">
                          <Zap size={16} />
                          <span className="font-bold text-xs uppercase tracking-wider">Agrupada</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{item.payments[0]?.customerName ?? ''}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-widest">{(item.payments[0]?.description ?? '').split(' (')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-sm font-black text-primary">{formatCurrency(totalGroupAmount)}</p>
                      <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Pago: {formatCurrency(totalGroupPaid)}</p>
                    </td>
                    <td className="px-4 py-2">
                      <span className={cn(
                        'px-2 py-1 rounded-md text-xs font-bold uppercase tracking-widest border',
                        allPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                          : someOverdue ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-500',
                      )}>
                        {allPaid ? 'Concluído' : someOverdue ? 'Vencido' : 'Em Aberto'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.payments.length} Lançamentos</span>
                        <button onClick={() => onDeleteGroup(item.saleId)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all" title="Excluir Venda Completa">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedPayments.includes(item.saleId) && (
                      <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <td colSpan={6}>
                          {item.payments.map((payment) => (
                            <div key={payment.id} className="hover:bg-white/[0.02] transition-colors border-l-4 border-primary/30 w-full flex">
                              <td className="px-4 py-2 pl-8 w-1/6">
                                <p className="text-sm font-medium text-slate-400">└ {payment.customerName}</p>
                              </td>
                              <td className="px-4 py-2 w-1/6">
                                <p className="text-sm font-medium text-slate-300">{payment.description}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-widest">{payment.paymentMethod}</p>
                              </td>
                              <td className="px-4 py-2 w-1/6">
                                <p className={cn('text-sm font-bold', isOverdue(payment) ? 'text-rose-500' : 'text-slate-300')}>
                                  {format(parseISO(payment.dueDate), 'dd/MM/yyyy')}
                                </p>
                              </td>
                              <td className="px-4 py-2 w-1/6">
                                <p className="text-sm font-black">{formatCurrency(payment.totalAmount)}</p>
                                <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Pago: {formatCurrency(payment.paidAmount)}</p>
                              </td>
                              <td className="px-4 py-2 w-1/6">
                                <span className={statusBadgeClass(payment.status)}>{statusLabel(payment.status)}</span>
                              </td>
                              <td className="px-4 py-2 text-right w-1/6">
                                <div className="flex items-center justify-end gap-2">
                                  {payment.status !== 'paid' && (
                                    <button onClick={() => onRecordPayment(payment)} className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all" title="Registrar Pagamento">
                                      <CheckCircle2 size={14} />
                                    </button>
                                  )}
                                  <div className="flex gap-1">
                                    <button onClick={() => onGenerateReceipt(payment, 'simple')} className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all" title="Recibo Térmico (80mm)">
                                      <Zap size={14} />
                                    </button>
                                    <button onClick={() => onGenerateReceipt(payment, 'a4')} className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all" title="Recibo A4 Completo">
                                      <Printer size={14} />
                                    </button>
                                  </div>
                                  <button onClick={() => onSendWhatsApp(payment)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all" title="Enviar WhatsApp">
                                    <MessageCircle size={14} />
                                  </button>
                                </div>
                              </td>
                            </div>
                          ))}
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            }

            const payment = item;
            return (
              <Fragment key={payment.id}>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => togglePaymentExpansion(payment.id)} className="p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors">
                        {expandedPayments.includes(payment.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <p className="text-sm font-bold">{payment.customerName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <p className="text-sm font-medium text-slate-300">{payment.description}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{payment.paymentMethod} • {payment.installmentsCount}x</p>
                  </td>
                  <td className="px-4 py-2">
                    <p className={cn('text-sm font-bold', isOverdue(payment) ? 'text-rose-500' : 'text-slate-300')}>
                      {format(parseISO(payment.dueDate), 'dd/MM/yyyy')}
                    </p>
                  </td>
                  <td className="px-4 py-2">
                    <p className="text-sm font-black">{formatCurrency(payment.totalAmount)}</p>
                    <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Pago: {formatCurrency(payment.paidAmount)}</p>
                  </td>
                  <td className="px-4 py-2">
                    <span className={statusBadgeClass(payment.status)}>{statusLabel(payment.status)}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {payment.status !== 'paid' && (
                        <button onClick={() => onRecordPayment(payment)} className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all" title="Registrar Pagamento">
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      <div className="flex gap-1">
                        <button onClick={() => onGenerateReceipt(payment, 'simple')} className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all" title="Recibo Térmico (80mm)">
                          <Zap size={14} />
                        </button>
                        <button onClick={() => onGenerateReceipt(payment, 'a4')} className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all" title="Recibo A4 Completo">
                          <Printer size={14} />
                        </button>
                      </div>
                      <button onClick={() => onSendWhatsApp(payment)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all" title="Enviar WhatsApp">
                        <MessageCircle size={14} />
                      </button>
                      <button onClick={() => onDeletePayment(payment)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                <AnimatePresence>
                  {expandedPayments.includes(payment.id) && (
                    <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/[0.01] border-b border-white/5">
                      <td colSpan={6} className="px-6 py-4">
                        <PaymentHistory payment={payment} className="pl-10" />
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })}
          {!hasPayments && (
            <tr>
              <td colSpan={6} className="px-6 py-20 text-center">
                <EmptyState title="Nenhum pagamento encontrado" description="Ajuste os filtros para encontrar pagamentos." />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}