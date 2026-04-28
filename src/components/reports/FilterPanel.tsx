import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFilterStore } from '../../store/useFilterStore';

interface FilterPanelProps {
  customers: { id: number; firstName: string; lastName: string; nickname?: string }[];
}

export const FilterPanel = ({ customers }: FilterPanelProps) => {
  const {
    showReportFilters,
    setShowReportFilters,
    reportCustomerFilter,
    setReportCustomerFilter,
    reportPaymentStatus,
    setReportPaymentStatus,
    reportTagsFilter,
    setReportTagsFilter,
  } = useFilterStore();

  const customerOptions = customers.map(c => ({
    id: c.id,
    name: c.nickname || `${c.firstName} ${c.lastName}`.trim()
  }));

  return (
    <AnimatePresence>
      {showReportFilters && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest">Filtros Avançados</span>
              </div>
              <button
                onClick={() => setShowReportFilters(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cliente</label>
                <select
                  value={reportCustomerFilter}
                  onChange={(e) => setReportCustomerFilter(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-bold outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900"
                >
                  <option value="">Todos os Clientes</option>
                  {customerOptions.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Status Pagamento</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'paid', label: 'Pago' },
                    { id: 'pending', label: 'Pendente' },
                    { id: 'overdue', label: 'Vencido' },
                  ].map(status => (
                    <button
                      key={status.id}
                      onClick={() => setReportPaymentStatus(status.id as typeof reportPaymentStatus)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                        reportPaymentStatus === status.id
                          ? "bg-primary border-primary text-white"
                          : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {['urgente', 'recorrente', 'parcelado', 'garantia', 'promocional'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (reportTagsFilter.includes(tag)) {
                          setReportTagsFilter(reportTagsFilter.filter(t => t !== tag));
                        } else {
                          setReportTagsFilter([...reportTagsFilter, tag]);
                        }
                      }}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                        reportTagsFilter.includes(tag)
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500"
                          : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 mt-6 flex gap-3">
              <button
                onClick={() => {
                  setReportCustomerFilter('');
                  setReportPaymentStatus('all');
                  setReportTagsFilter([]);
                }}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 transition-all border border-white/10"
              >
                Limpar
              </button>
              <button
                onClick={() => setShowReportFilters(false)}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-xs font-bold uppercase tracking-widest text-white transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};