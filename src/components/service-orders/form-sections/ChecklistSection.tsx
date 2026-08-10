import React from 'react';
import { CheckSquare } from 'lucide-react';
import { type Path, useFormContext } from 'react-hook-form';
import { useServiceOrderFormContext } from '../../../contexts/ServiceOrderFormContext';
import type { ServiceOrderFormData } from '../../../schemas/serviceOrderSchema';

export const ChecklistSection: React.FC = () => {
  const { checklistTemplate, deductStockStatuses } = useServiceOrderFormContext();
  const { register, setValue, watch } = useFormContext<ServiceOrderFormData>();
  const status = watch('status') ?? '';
  const isExitMode = deductStockStatuses.includes(status);
  const fieldName = isExitMode ? 'checklistOut' : 'checklistIn';
  const templateItems = isExitMode ? checklistTemplate.saida : checklistTemplate.entrada;
  const items = watch(fieldName) ?? [];

  React.useEffect(() => {
    if (items.length > 0 || templateItems.length === 0) return;
    setValue(
      fieldName,
      templateItems.map((item) => ({
        label: item.label,
        value: '',
        done: item.defaultValue ?? false,
      })),
      { shouldDirty: false },
    );
  }, [fieldName, items.length, setValue, templateItems]);

  if (items.length === 0 && templateItems.length === 0) return null;

  return (
    <div className="space-y-4 pt-6 border-t border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="h-1 w-8 bg-cyan-500 rounded-full" />
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
            Checklist de {isExitMode ? 'Saída' : 'Entrada'}
          </h4>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Definido pelo status da OS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, index) => {
          const donePath = `${fieldName}.${index}.done` as Path<ServiceOrderFormData>;
          const valuePath = `${fieldName}.${index}.value` as Path<ServiceOrderFormData>;
          const labelPath = `${fieldName}.${index}.label` as Path<ServiceOrderFormData>;

          return (
            <div key={`${item.label}-${index}`} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <input type="hidden" {...register(labelPath)} />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register(donePath)}
                  className="h-5 w-5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-bg-dark"
                />
                <CheckSquare size={16} className="text-cyan-400 shrink-0" />
                <span className="text-sm font-bold text-slate-200">{item.label}</span>
              </label>
              <input
                {...register(valuePath)}
                placeholder="Valor ou observação (opcional)"
                className="w-full h-10 bg-bg-dark/40 border border-white/10 rounded-xl px-3 text-xs font-bold text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
