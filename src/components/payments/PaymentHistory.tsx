import { CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { ClientPayment } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface PaymentHistoryProps {
  payment: ClientPayment;
  className?: string;
}

export function PaymentHistory({ payment, className }: PaymentHistoryProps) {
  return (
    <div className={className}>
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Histórico de Pagamentos</h4>
      {payment.paymentEntries && payment.paymentEntries.length > 0 ? (
        <div className="space-y-2">
          {payment.paymentEntries.map((h, i) => (
            <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold">{formatCurrency(h.amount)}</p>
                  <p className="text-xs text-slate-500">{format(parseISO(h.date), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Parcela {i + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic">Nenhum pagamento registrado ainda.</p>
      )}
    </div>
  );
}