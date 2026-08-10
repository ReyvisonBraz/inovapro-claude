import React from 'react';
import { Package, RotateCcw, Wrench } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { ServiceOrderFormData } from '../../../schemas/serviceOrderSchema';
import type { ServiceOrder } from '../../../types';
import { formatWarrantyDate, getOrderWarranties, getWarrantyExpirySummary } from '../../../lib/warrantyUtils';
import { cn } from '../../../lib/utils';

interface WarrantySectionProps {
  editingOrder: ServiceOrder | null;
}

export const WarrantySection: React.FC<WarrantySectionProps> = ({ editingOrder }) => {
  const { register } = useFormContext<ServiceOrderFormData>();
  const warranties = getOrderWarranties(editingOrder);
  const summary = getWarrantyExpirySummary(warranties);

  if (!editingOrder) return null;

  return (
    <div className="space-y-5 pt-6 border-t border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-1 w-8 bg-emerald-500 rounded-full" />
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Garantia</h4>
        </div>
        {summary && (
          <span className={cn(
            'text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border',
            summary.state === 'active' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            summary.state === 'expiring' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            summary.state === 'expired' && 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          )}>
            {summary.label}
          </span>
        )}
      </div>

      {warranties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {warranties.map((warranty) => (
            <div key={warranty.id} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                {warranty.itemType === 'part' ? <Package size={17} /> : <Wrench size={17} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-200 truncate">{warranty.itemName}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                  {warranty.itemType === 'part' ? 'Peça' : 'Serviço'} · {warranty.warrantyMonths} {warranty.warrantyMonths === 1 ? 'mês' : 'meses'}
                </p>
                <p className="text-xs font-black text-emerald-400 mt-2">Válida até {formatWarrantyDate(warranty.expiresAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-5 px-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-xs text-slate-500 text-center">
          Esta OS ainda não possui itens de garantia gerados.
        </div>
      )}

      <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 cursor-pointer">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <RotateCcw size={18} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-200">Retorno em garantia</p>
            <p className="text-xs text-slate-500 mt-1">Marque quando esta OS for um retorno coberto por garantia.</p>
          </div>
        </div>
        <input
          type="checkbox"
          {...register('warrantyReturn')}
          className="h-5 w-5 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500 focus:ring-offset-bg-dark shrink-0"
        />
      </label>
    </div>
  );
};
