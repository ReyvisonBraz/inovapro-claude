import React from 'react';
import { User as UserIcon, Calendar, Plus, Check } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { CustomerSearchSelect } from '../../customers/CustomerSearchSelect';
import { ServiceOrderFormData } from '../../../schemas/serviceOrderSchema';
import { Customer } from '../../../types';

interface CustomerSectionProps {
  isSimplified: boolean;
  setIsSimplified: (val: boolean) => void;
  customers: Customer[];
  onTriggerAddCustomer: () => void;
}

export const CustomerSection: React.FC<CustomerSectionProps> = ({
  isSimplified,
  setIsSimplified,
  customers,
  onTriggerAddCustomer
}) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext<ServiceOrderFormData>();
  const watchedCustomerId = watch('customerId');

  return (
    <>
      {/* Toggle Simplificado */}
      <label className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl w-full sm:w-fit cursor-pointer hover:bg-emerald-500/20 transition-colors shadow-lg shadow-emerald-500/5">
        <div className="relative flex items-center justify-center">
          <input 
            type="checkbox" 
            checked={isSimplified} 
            onChange={(e) => setIsSimplified(e.target.checked)} 
            className="peer appearance-none w-6 h-6 border-2 border-emerald-500/50 rounded-lg checked:bg-emerald-500 checked:border-emerald-500 transition-all"
          />
          <Check size={16} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-emerald-400">Preenchimento Simplificado</span>
          <span className="text-xs font-bold text-slate-400">Torna os detalhes técnicos não obrigatórios</span>
        </div>
      </label>

      {/* Cliente e Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-primary/80 ml-1 flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg w-fit mb-2">
            <UserIcon size={14} /> Cliente <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <CustomerSearchSelect 
              customers={customers}
              selectedId={watchedCustomerId}
              onSelect={(id) => setValue('customerId', id)}
              className="flex-1"
            />
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTriggerAddCustomer();
              }}
              className="h-14 w-14 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5"
              title="Adicionar Novo Cliente"
            >
              <Plus size={20} />
            </button>
          </div>
          {errors.customerId && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.customerId.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-primary/80 ml-1 flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg w-fit mb-2">
            <Calendar size={14} /> Data de Entrada <span className="text-rose-500">*</span>
          </label>
          <input 
            type="date"
            {...register('entryDate')}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-white placeholder:text-slate-500 outline-none transition-all [color-scheme:dark]"
          />
          {errors.entryDate && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.entryDate.message}</p>}
        </div>
      </div>
    </>
  );
};
