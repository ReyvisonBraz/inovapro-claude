import React from 'react';
import { ClipboardList, AlertCircle } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { ServiceOrderFormData } from '../../../schemas/serviceOrderSchema';
import { ServiceOrderStatus } from '../../../types';
import { cn } from '../../../lib/utils';

interface AnalysisSectionProps {
  isSimplified: boolean;
  statuses: ServiceOrderStatus[];
}

export const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  isSimplified,
  statuses
}) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ServiceOrderFormData>();
  const watchedPriority = watch('priority');

  return (
    <>
      {/* Problema e Análise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-rose-500 ml-1 flex items-center gap-2 bg-rose-500/5 px-2 py-1 rounded-md w-fit mb-1">
            <AlertCircle size={12} /> Defeito Relatado {!isSimplified && <span className="text-rose-500">*</span>}
          </label>
          <textarea 
            {...register('reportedProblem')}
            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
            placeholder="Descreva o defeito informado pelo cliente..."
          />
          {errors.reportedProblem && <p className="form-field-error text-rose-500 text-xs mt-1 font-bold">{errors.reportedProblem.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-amber-500 ml-1 flex items-center gap-2 bg-amber-500/5 px-2 py-1 rounded-md w-fit mb-1">
            <ClipboardList size={12} /> Análise Técnica
          </label>
          <textarea 
            {...register('technicalAnalysis')}
            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
            placeholder="Diagnóstico técnico inicial..."
          />
        </div>
      </div>

      {/* Status e Prioridade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Status Atual</label>
          <select 
            {...register('status')}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900 transition-all"
          >
            {statuses.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Prioridade</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setValue('priority', p)}
                className={cn(
                  "flex-1 h-14 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all",
                  watchedPriority === p 
                    ? p === 'high' ? "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-lg shadow-rose-500/5" : 
                      p === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-lg shadow-amber-500/5" :
                      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                    : "bg-white/5 text-slate-500 border-transparent hover:bg-white/10"
                )}
              >
                {p === 'low' ? 'Baixa' : p === 'medium' ? 'Normal' : 'Alta'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
