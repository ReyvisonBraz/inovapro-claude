import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerFormData } from '../../../schemas/customerSchema';

const COUNTRIES = [
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: '+1', name: 'EUA/Canadá', flag: '🇺🇸' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+57', name: 'Colômbia', flag: '🇨🇴' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
];

const parsePhone = (fullPhone: string) => {
  if (!fullPhone) return { country: '+55', number: '' };
  
  const sortedCountries = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  const country = sortedCountries.find(c => fullPhone.startsWith(c.code));
  
  if (country) {
    return { country: country.code, number: fullPhone.slice(country.code.length) };
  }
  
  if (fullPhone.startsWith('+')) {
     const match = fullPhone.match(/^(\+\d{1,3})(.*)$/);
     if (match) {
        return { country: match[1], number: match[2] };
     }
  }
  return { country: '+55', number: fullPhone };
};

const formatNumber = (country: string, number: string) => {
  let cleaned = number.replace(/\D/g, '');
  
  if (country === '+55') {
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    if (cleaned.length >= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }
  
  return cleaned;
};

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCustomer: any;
  onSave: (data: CustomerFormData, force?: boolean) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  editingCustomer,
  onSave
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      cpf: '',
      companyName: '',
      phone: '+55',
      observation: '',
      creditLimit: undefined
    }
  });

  const phoneValue = watch('phone');
  const { country, number } = parsePhone(phoneValue);

  useEffect(() => {
    if (isOpen) {
      if (editingCustomer) {
        reset({
          firstName: editingCustomer.firstName,
          lastName: editingCustomer.lastName || '',
          nickname: editingCustomer.nickname || '',
          cpf: editingCustomer.cpf || '',
          companyName: editingCustomer.companyName || '',
          phone: editingCustomer.phone,
          observation: editingCustomer.observation || '',
          creditLimit: editingCustomer.creditLimit?.toString()
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          nickname: '',
          cpf: '',
          companyName: '',
          phone: '+55',
          observation: '',
          creditLimit: undefined
        });
      }
    }
  }, [isOpen, editingCustomer, reset]);

  const onSubmit = (data: CustomerFormData) => {
    onSave(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl glass-modal p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex justify-between">
                    <span>Nome *</span>
                    {errors.firstName && <span className="text-[8px] text-red-500 italic">{errors.firstName.message}</span>}
                  </label>
                  <input 
                    {...register('firstName')}
                    className={`w-full h-12 bg-white/5 border-2 ${errors.firstName ? 'border-red-500/50' : 'border-primary/30'} rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all`}
                    placeholder="João"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sobrenome</label>
                  <input 
                    {...register('lastName')}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Silva"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Apelido</label>
                  <input 
                    {...register('nickname')}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Jão"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">CPF</label>
                  <input 
                    {...register('cpf')}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome da Empresa</label>
                  <input 
                    {...register('companyName')}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Empresa LTDA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex justify-between">
                    <span>Telefone (WhatsApp) *</span>
                    {errors.phone && <span className="text-[8px] text-red-500 italic">{errors.phone.message}</span>}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-32 shrink-0">
                      <select
                        value={country}
                        onChange={(e) => {
                          const currentNumber = number.replace(/\D/g, '');
                          setValue('phone', e.target.value + currentNumber);
                        }}
                        className="w-full h-12 bg-white/5 border-2 border-primary/30 rounded-xl pl-3 pr-8 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none text-white"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                    <input 
                      value={formatNumber(country, number)}
                      onChange={(e) => {
                        const rawNumber = e.target.value.replace(/\D/g, '');
                        setValue('phone', country + rawNumber);
                      }}
                      className={`flex-1 w-full h-12 bg-white/5 border-2 ${errors.phone ? 'border-red-500/50' : 'border-primary/30'} rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all`}
                      placeholder={country === '+55' ? "(11) 9 9999-9999" : "Número"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Limite de Crédito</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                    <input 
                      type="text"
                      {...register('creditLimit')}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Observações</label>
                <textarea 
                  {...register('observation')}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Notas sobre o cliente..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Salvando...' : (editingCustomer ? 'Atualizar Cliente' : 'Salvar Cliente')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
