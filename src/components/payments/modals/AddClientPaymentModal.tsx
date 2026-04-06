import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, User as UserIcon, FileText, DollarSign, Calendar, CreditCard, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomerSearchSelect } from '../../customers/CustomerSearchSelect';
import { clientPaymentSchema, ClientPaymentFormData } from '../../../schemas/paymentSchema';

interface AddClientPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
  onAdd: (data: ClientPaymentFormData) => void;
  onTriggerAddCustomer?: () => void;
  isSaving?: boolean;
  initialData?: Partial<ClientPaymentFormData>;
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

  const onFormSubmit = (data: ClientPaymentFormData) => {
    onAdd(data);
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
            className="relative w-full max-w-2xl glass-modal p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
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

            <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-md w-fit mb-1">
                  <UserIcon size={12} /> Cliente
                </label>
                <div className="flex gap-2">
                  <CustomerSearchSelect 
                    customers={customers}
                    selectedId={customerId}
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
                {errors.customerId && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.customerId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <FileText size={12} /> Descrição da Compra
                </label>
                <input 
                  {...register('description')}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Ex: Venda de Notebook"
                />
                {errors.description && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                  <DollarSign size={12} /> Valor Total
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                  <input 
                    type="number"
                    step="0.01"
                    {...register('totalAmount')}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                {errors.totalAmount && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.totalAmount.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                  <DollarSign size={12} /> Valor Já Pago (Entrada)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                  <input 
                    type="number"
                    step="0.01"
                    {...register('paidAmount')}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                {errors.paidAmount && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.paidAmount.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Calendar size={12} /> Data da Compra
                </label>
                <input 
                  type="date"
                  {...register('purchaseDate')}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                />
                {errors.purchaseDate && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.purchaseDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Calendar size={12} /> {installmentsCount > 1 ? 'Vencimento da 1ª Parcela' : 'Data de Vencimento'}
                </label>
                <input 
                  type="date"
                  {...register('dueDate')}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                />
                {errors.dueDate && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.dueDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <CreditCard size={12} /> Forma de Pagamento
                </label>
                <select 
                  {...register('paymentMethod')}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900 transition-all"
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto">Boleto</option>
                </select>
                {errors.paymentMethod && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.paymentMethod.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Layers size={12} /> Nº de Parcelas
                </label>
                <input 
                  type="number"
                  {...register('installmentsCount')}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                  min="1"
                />
                {errors.installmentsCount && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.installmentsCount.message}</p>}
              </div>

              {installmentsCount > 1 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Intervalo das Parcelas</label>
                  <select 
                    {...register('installmentInterval')}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
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
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
