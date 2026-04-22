import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, User as UserIcon, FileText, DollarSign, Calendar, CreditCard, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomerSearchSelect } from '../../customers/CustomerSearchSelect';
import { clientPaymentSchema, ClientPaymentFormData } from '../../../schemas/paymentSchema';
import { addMonths, addDays, parseISO, format } from 'date-fns';
import { formatCurrency } from '../../../lib/utils';

interface AddClientPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
  onAdd: (data: ClientPaymentFormData) => void;
  onTriggerAddCustomer?: () => void;
  isSaving?: boolean;
  initialData?: Partial<ClientPaymentFormData>;
  newClientPayment?: any;
  setNewClientPayment?: (data: any) => void;
}

export const AddClientPaymentModal: React.FC<AddClientPaymentModalProps> = ({
  isOpen,
  onClose,
  customers,
  onAdd,
  onTriggerAddCustomer,
  isSaving,
  initialData
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ClientPaymentFormData>({
    resolver: zodResolver(clientPaymentSchema),
    defaultValues: {
      customerId: 0,
      description: '',
      totalAmount: 0,
      paidAmount: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Dinheiro',
      installmentsCount: 1,
      installmentInterval: 'monthly',
      ...initialData
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        customerId: 0,
        description: '',
        totalAmount: 0,
        paidAmount: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Dinheiro',
        installmentsCount: 1,
        installmentInterval: 'monthly',
        ...initialData
      });
    }
  }, [isOpen, initialData, reset]);

  const customerId = watch('customerId');
  const installmentsCount = watch('installmentsCount');
  const installmentInterval = watch('installmentInterval');
  const purchaseDate = watch('purchaseDate');
  const dueDate = watch('dueDate');
  const totalAmount = watch('totalAmount');
  const paidAmount = watch('paidAmount');

  // Ajuste automático da data de vencimento (pula 1 mês se for parcelado mensalmente, etc)
  useEffect(() => {
    if (purchaseDate && Number(installmentsCount) > 1) {
      try {
        const pd = parseISO(purchaseDate);
        let nextDate = pd;
        if (installmentInterval === 'monthly') nextDate = addMonths(pd, 1);
        else if (installmentInterval === '15days') nextDate = addDays(pd, 15);
        else if (installmentInterval === 'weekly') nextDate = addDays(pd, 7);
        
        setValue('dueDate', format(nextDate, 'yyyy-MM-dd'));
      } catch (e) {}
    }
  }, [installmentsCount, installmentInterval, purchaseDate, setValue]);

  // Resumo das Parcelas
  const preview = React.useMemo(() => {
    const count = Number(installmentsCount) || 1;
    if (count <= 1) return null;
    
    const total = Number(totalAmount) || 0;
    const paid = Number(paidAmount) || 0;
    const remaining = Math.max(0, total - paid);
    const amountPerInst = remaining / count;
    
    const dates: { date: string, amount: number }[] = [];
    try {
      let current = parseISO(dueDate || purchaseDate || new Date().toISOString().split('T')[0]);
      
      for (let i = 0; i < count; i++) {
        dates.push({
          date: format(current, 'dd/MM/yyyy'),
          amount: amountPerInst
        });
        
        if (installmentInterval === 'monthly') current = addMonths(current, 1);
        else if (installmentInterval === '15days') current = addDays(current, 15);
        else if (installmentInterval === 'weekly') current = addDays(current, 7);
      }
    } catch(e) {}
    
    return dates;
  }, [installmentsCount, totalAmount, paidAmount, dueDate, installmentInterval, purchaseDate]);

  const onFormSubmit = (data: ClientPaymentFormData) => {
    onAdd({
      ...data,
      customerId: Number(data.customerId),
      totalAmount: Number(data.totalAmount),
      paidAmount: Number(data.paidAmount) || 0,
      installmentsCount: Number(data.installmentsCount) || 1,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full glass-modal p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar transition-all duration-300 ${preview && preview.length > 0 ? 'max-w-5xl' : 'max-w-3xl'}`}
          >
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold">Novo Registro de Venda/Pagamento</h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)}>
              <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Lado Esquerdo - Formulário */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-primary/80 flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg w-fit mb-1">
                  <UserIcon size={14} /> Cliente
                </label>
                <div className="flex gap-2">
                  <CustomerSearchSelect 
                    customers={customers}
                    selectedId={typeof customerId === 'string' ? parseInt(customerId) || 0 : customerId}
                    onSelect={(id) => setValue('customerId', id, { shouldValidate: true })}
                    className="flex-1"
                  />
                  {onTriggerAddCustomer && (
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
                  )}
                </div>
                {errors.customerId && <p className="text-rose-500 text-xs font-bold mt-1">{errors.customerId.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <FileText size={14} /> Descrição da Compra
                </label>
                <textarea 
                  {...register('description')}
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-base font-bold focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-white"
                  placeholder="Ex: Venda de Notebook, incluindo acessórios..."
                />
                {errors.description && <p className="text-rose-500 text-xs font-bold mt-1">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <DollarSign size={14} /> Valor Total
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">R$</span>
                  <input 
                    type="number"
                    step="0.01"
                    {...register('totalAmount')}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-base font-black focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                    placeholder="0.00"
                  />
                </div>
                {errors.totalAmount && <p className="text-rose-500 text-xs font-bold mt-1">{errors.totalAmount.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                  <DollarSign size={14} /> Valor Já Pago (Entrada)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">R$</span>
                  <input 
                    type="number"
                    step="0.01"
                    {...register('paidAmount')}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-base font-black focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                    placeholder="0.00"
                  />
                </div>
                {errors.paidAmount && <p className="text-rose-500 text-xs font-bold mt-1">{errors.paidAmount.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Calendar size={14} /> Data da Compra
                </label>
                <input 
                  type="date"
                  {...register('purchaseDate')}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-base font-bold focus:ring-2 focus:ring-primary outline-none transition-all [color-scheme:dark] text-white"
                />
                {errors.purchaseDate && <p className="text-rose-500 text-xs font-bold mt-1">{errors.purchaseDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Calendar size={14} /> {Number(installmentsCount) > 1 ? 'Vencimento da 1ª Parcela' : 'Data de Vencimento'}
                </label>
                <input 
                  type="date"
                  {...register('dueDate')}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-base font-bold focus:ring-2 focus:ring-primary outline-none transition-all [color-scheme:dark] text-white"
                />
                {errors.dueDate && <p className="text-rose-500 text-xs font-bold mt-1">{errors.dueDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <CreditCard size={14} /> Forma de Pagamento
                </label>
                <select 
                  {...register('paymentMethod')}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-base font-bold focus:ring-2 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900 transition-all"
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto">Boleto</option>
                </select>
                {errors.paymentMethod && <p className="text-rose-500 text-xs font-bold mt-1">{errors.paymentMethod.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Layers size={14} /> Nº de Parcelas
                </label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 h-14">
                  <button 
                    type="button" 
                    onClick={() => setValue('installmentsCount', Math.max(1, Number(installmentsCount) - 1))}
                    className="h-12 w-12 flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-100 hover:text-white transition-all"
                  >
                    <Minus size={22} />
                  </button>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{installmentsCount}x</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setValue('installmentsCount', Number(installmentsCount) + 1)}
                    className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-all shadow-lg shadow-primary/10"
                  >
                    <Plus size={22} />
                  </button>
                </div>
                {errors.installmentsCount && <p className="text-rose-500 text-xs font-bold mt-1">{errors.installmentsCount.message}</p>}
              </div>

              {Number(installmentsCount) > 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Intervalo das Parcelas</label>
                  <select 
                    {...register('installmentInterval')}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-base font-bold focus:ring-2 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900 transition-all"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="15days">A cada 15 dias</option>
                    <option value="weekly">Semanal</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 md:pt-8 md:col-span-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  {isSaving ? 'Registrando...' : 'Registrar Venda'}
                </button>
              </div>
            </div> {/* Fim do Lado Esquerdo */}

            {/* Lado Direito - Resumo do Parcelamento */}
            {preview && preview.length > 0 && (
              <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 transition-all duration-300">
                <div className="bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col h-full lg:max-h-full max-h-[350px]">
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2 shrink-0">
                    <Layers size={16} /> Resumo do Parcelamento
                  </h4>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                    {preview.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div>
                          <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Parcela {i + 1}</span>
                          <span className="block text-sm font-bold text-slate-200 mt-1">{p.date}</span>
                        </div>
                        <span className="text-base font-black text-emerald-400">{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </div> {/* Fim do Flex Wrapper */}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
