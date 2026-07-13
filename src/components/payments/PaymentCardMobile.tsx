import { Search, ChevronDown, ChevronUp, Trash2, MessageCircle, Zap, Printer, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import type { ClientPayment, PaymentListItem } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { PaymentHistory } from './PaymentHistory';

interface PaymentCardMobileProps {
  groupedPayments: PaymentListItem[];
  expandedPayments: (number | string)[];
  togglePaymentExpansion: (id: number | string) => void;
  onRecordPayment: (payment: ClientPayment) => void;
  onGenerateReceipt: (payment: ClientPayment, type: 'simple' | 'a4') => void;
  onSendWhatsApp: (payment: ClientPayment) => void;
  onDeletePayment: (payment: ClientPayment) => void;
  onDeleteGroup: (saleId: string) => void;
  onClearFilters: () => void;
  hasPayments: boolean;
}

function statusBadgeClass(status: string) {
  return cn(
    'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border',
    status === 'paid'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
      : status === 'partial'
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
        : 'bg-rose-500/10 border-rose-500/20 text-rose-500',
  );
}

function statusLabel(status: string, short = false) {
  if (status === 'paid') return 'Pago';
  if (status === 'partial') return short ? 'Parcial' : 'Parcial';
  return short ? 'Pend.' : 'Pendente';
}

function isOverdue(payment: ClientPayment) {
  return new Date(payment.dueDate) < new Date() && payment.status !== 'paid';
}

export function PaymentCardMobile({
  groupedPayments,
  expandedPayments,
  togglePaymentExpansion,
  onRecordPayment,
  onGenerateReceipt,
  onSendWhatsApp,
  onDeletePayment,
  onDeleteGroup,
  onClearFilters,
  hasPayments,
}: PaymentCardMobileProps) {
  return (
    <div className="lg:hidden divide-y divide-white/5">
      {groupedPayments.map((item) => {
        if ('isGroup' in item) {
          const totalGroupAmount = item.payments.reduce((acc, p) => acc + p.totalAmount, 0);
          const totalGroupPaid = item.payments.reduce((acc, p) => acc + p.paidAmount, 0);
          const allPaid = item.payments.every((p) => p.status === 'paid');
          const someOverdue = item.payments.some((p) => isOverdue(p));

          return (
            <div key={item.saleId} className="p-3 space-y-2 bg-white/[0.02] border-l-4 border-primary/60">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <button onClick={() => togglePaymentExpansion(item.saleId)} className="p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors shrink-0">
                    {expandedPayments.includes(item.saleId) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Zap size={11} className="text-primary shrink-0" />
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Venda Agrupada</p>
                    </div>
                    <p className="text-xs font-bold text-slate-200 truncate mt-0.5">{item.payments[0]?.customerName ?? ''}</p>
                    <p className="text-[10px] text-slate-500 truncate">{(item.payments[0]?.description ?? '').split(' (')[0]}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn(statusBadgeClass(allPaid ? 'paid' : someOverdue ? 'pending' : 'partial'))}>
                    {allPaid ? 'Pago' : someOverdue ? 'Vencido' : 'Aberto'}
                  </span>
                  <p className="text-xs font-black text-primary mt-1">{formatCurrency(totalGroupAmount)}</p>
                  <p className="text-[10px] text-emerald-500 font-bold">{formatCurrency(totalGroupPaid)} pago</p>
                </div>
              </div>

              <AnimatePresence>
                {expandedPayments.includes(item.saleId) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1.5">
                    {item.payments.map((p) => (
                      <div key={p.id} className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{p.description}</p>
                            <p className={cn('text-[11px] font-bold mt-0.5', isOverdue(p) ? 'text-rose-500' : 'text-slate-400')}>
                              {format(parseISO(p.dueDate), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className={statusBadgeClass(p.status)}>{statusLabel(p.status, true)}</span>
                            <p className="text-xs font-black mt-1">{formatCurrency(p.totalAmount)}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {p.status !== 'paid' && (
                            <button onClick={() => onRecordPayment(p)} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                              <CheckCircle2 size={12} /> Pagar
                            </button>
                          )}
                          <button onClick={() => onGenerateReceipt(p, 'simple')} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 border border-white/10"><Zap size={12} /></button>
                          <button onClick={() => onSendWhatsApp(p)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><MessageCircle size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end">
                <button onClick={() => onDeleteGroup(item.saleId)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold">
                  <Trash2 size={11} /> Excluir venda
                </button>
              </div>
            </div>
          );
        }

        const payment = item;
        return (
          <div key={payment.id} className="p-3 space-y-2.5">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button onClick={() => togglePaymentExpansion(payment.id)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 transition-colors shrink-0">
                  {expandedPayments.includes(payment.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{payment.customerName}</p>
                  <p className="text-xs text-slate-400 truncate">{payment.description}</p>
                </div>
              </div>
              <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border shrink-0', statusBadgeClass(payment.status))}>
                {statusLabel(payment.status)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-black/20 px-3 py-2 rounded-xl border border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Vencimento</p>
                <p className={cn('text-sm font-bold', isOverdue(payment) ? 'text-rose-400' : 'text-slate-200')}>
                  {format(parseISO(payment.dueDate), 'dd/MM/yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">{formatCurrency(payment.totalAmount)}</p>
                <p className="text-xs text-emerald-400 font-bold">Pago: {formatCurrency(payment.paidAmount)}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {payment.status !== 'paid' && (
                <button onClick={() => onRecordPayment(payment)} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 active:bg-primary/20 transition-all text-xs font-bold" title="Registrar Pagamento">
                  <CheckCircle2 size={14} /> Pagar
                </button>
              )}
              <button onClick={() => onGenerateReceipt(payment, 'simple')} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 border border-white/10 active:bg-white/10 transition-all" title="Recibo Térmico"><Zap size={14} /></button>
              <button onClick={() => onGenerateReceipt(payment, 'a4')} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 border border-white/10 active:bg-white/10 transition-all" title="Recibo A4"><Printer size={14} /></button>
              <button onClick={() => onSendWhatsApp(payment)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 active:bg-emerald-500/20 transition-all" title="WhatsApp"><MessageCircle size={14} /></button>
              <button onClick={() => onDeletePayment(payment)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 active:bg-rose-500/20 transition-all" title="Excluir"><Trash2 size={14} /></button>
            </div>

            <AnimatePresence>
              {expandedPayments.includes(payment.id) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <PaymentHistory payment={payment} className="pt-4 border-t border-white/5" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      {!hasPayments && (
        <div className="py-12 px-6 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
            <Search size={22} />
          </div>
          <div>
            <p className="text-slate-300 font-bold text-sm">Nenhum registro encontrado</p>
            <p className="text-slate-500 text-xs mt-1">Tente ajustar os filtros de busca</p>
          </div>
          <button onClick={onClearFilters} className="mt-1 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold active:bg-primary/20 transition-all">
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}