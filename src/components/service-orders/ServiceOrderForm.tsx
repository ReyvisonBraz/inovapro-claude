import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User as UserIcon, Calendar, Plus, Search, 
  Cpu, HardDrive, Lock, Camera, Trash2, AlertCircle, 
  ClipboardList, Wrench, ChevronDown, ChevronUp, Check, QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ServiceOrder, Customer, InventoryItem, ServiceOrderStatus, Brand, Model, User, ServiceOrderPart, ServiceOrderItem } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { CustomerSearchSelect } from '../customers/CustomerSearchSelect';
import { SearchableSelect } from '../ui/SearchableSelect';
import { serviceOrderSchema, ServiceOrderFormData } from '../../schemas/serviceOrderSchema';
import { format, parseISO } from 'date-fns';

interface ServiceOrderFormProps {
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  editingOrder: ServiceOrder | null;
  setEditingOrder: (order: ServiceOrder | null) => void;
  customers: Customer[];
  inventoryItems: InventoryItem[];
  statuses: ServiceOrderStatus[];
  equipmentTypes: {id: number, name: string}[];
  brands: Brand[];
  models: Model[];
  currentUser: User | null;
  onAddOrder: (order: any) => Promise<number | null>;
  onUpdateOrder: (id: number, order: any) => Promise<boolean>;
  onAddEquipmentType: (name: string) => Promise<void>;
  onAddBrand: (name: string, equipmentType: string) => Promise<void>;
  onAddModel: (brandId: number, name: string) => Promise<void>;
  onTriggerAddCustomer: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  onOpenConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  setSelectedOrder: (order: ServiceOrder | null) => void;
  setShowWhatsAppModal: (show: boolean) => void;
  setShowQRCodeModal: (show: boolean) => void;
  onGeneratePayment?: (order: any) => void;
}

export const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  isAdding,
  setIsAdding,
  editingOrder,
  setEditingOrder,
  customers,
  inventoryItems,
  statuses,
  equipmentTypes,
  brands,
  models,
  currentUser,
  onAddOrder,
  onUpdateOrder,
  onAddEquipmentType,
  onAddBrand,
  onAddModel,
  onTriggerAddCustomer,
  showToast,
  onOpenConfirm,
  setSelectedOrder,
  setShowWhatsAppModal,
  setShowQRCodeModal,
  onGeneratePayment
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      customerId: 0,
      entryDate: format(new Date(), 'yyyy-MM-dd'),
      equipmentType: '',
      equipmentBrand: '',
      equipmentModel: '',
      equipmentColor: '',
      equipmentSerial: '',
      reportedProblem: '',
      technicalAnalysis: '',
      priority: 'medium',
      status: 'Aguardando Análise',
      customerPassword: '',
      accessories: '',
      ramInfo: '',
      ssdInfo: '',
      arrivalPhotoBase64: '',
      servicesPerformed: '',
      serviceFee: 0,
      totalAmount: 0,
      finalObservations: '',
      services: [],
      partsUsed: [],
    }
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'services'
  });

  const { fields: partFields, append: appendPart, remove: removePart, update: updatePart } = useFieldArray({
    control,
    name: 'partsUsed'
  });

  const watchedServices = watch('services');
  const watchedParts = watch('partsUsed');
  const watchedServiceFee = watch('serviceFee');
  const watchedCustomerId = watch('customerId');
  const watchedEquipmentType = watch('equipmentType');
  const watchedEquipmentBrand = watch('equipmentBrand');
  const watchedArrivalPhoto = watch('arrivalPhotoBase64');
  const watchedPriority = watch('priority');

  // Atualizar totais quando serviços ou peças mudarem
  useEffect(() => {
    const servicesTotal = watchedServices.reduce((acc, s) => acc + s.price, 0);
    const partsTotal = watchedParts.reduce((acc, p) => acc + p.subtotal, 0);
    const total = servicesTotal + partsTotal;
    
    setValue('serviceFee', servicesTotal);
    setValue('totalAmount', total);
  }, [watchedServices, watchedParts, setValue]);

  // Sincronizar com edição
  useEffect(() => {
    if (editingOrder) {
      reset({
        customerId: editingOrder.customerId,
        entryDate: editingOrder.entryDate || format(parseISO(editingOrder.createdAt), 'yyyy-MM-dd'),
        equipmentType: editingOrder.equipmentType || '',
        equipmentBrand: editingOrder.equipmentBrand || '',
        equipmentModel: editingOrder.equipmentModel || '',
        equipmentColor: editingOrder.equipmentColor || '',
        equipmentSerial: editingOrder.equipmentSerial || '',
        reportedProblem: editingOrder.reportedProblem || '',
        technicalAnalysis: editingOrder.technicalAnalysis || '',
        priority: (editingOrder.priority as any) || 'medium',
        status: editingOrder.status,
        customerPassword: editingOrder.customerPassword || '',
        accessories: editingOrder.accessories || '',
        ramInfo: editingOrder.ramInfo || '',
        ssdInfo: editingOrder.ssdInfo || '',
        arrivalPhotoBase64: editingOrder.arrivalPhotoBase64 || '',
        servicesPerformed: editingOrder.servicesPerformed || '',
        serviceFee: editingOrder.serviceFee || 0,
        totalAmount: editingOrder.totalAmount || 0,
        finalObservations: editingOrder.finalObservations || '',
        services: editingOrder.services || [],
        partsUsed: editingOrder.partsUsed || [],
      });
    } else {
      reset({
        customerId: 0,
        entryDate: format(new Date(), 'yyyy-MM-dd'),
        equipmentType: '',
        equipmentBrand: '',
        equipmentModel: '',
        equipmentColor: '',
        equipmentSerial: '',
        reportedProblem: '',
        technicalAnalysis: '',
        priority: 'medium',
        status: 'Aguardando Análise',
        customerPassword: '',
        accessories: '',
        ramInfo: '',
        ssdInfo: '',
        arrivalPhotoBase64: '',
        servicesPerformed: '',
        serviceFee: 0,
        totalAmount: 0,
        finalObservations: '',
        services: [],
        partsUsed: [],
      });
    }
  }, [editingOrder, reset]);

  const [partSearch, setPartSearch] = useState('');
  const [isAddingPart, setIsAddingPart] = useState(false);

  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    type: 'type' | 'brand' | 'model';
    title: string;
    placeholder: string;
    value: string;
  }>({
    isOpen: false,
    type: 'type',
    title: '',
    placeholder: '',
    value: ''
  });

  const handleQuickAdd = () => {
    if (!quickAddModal.value.trim()) return;
    
    if (quickAddModal.type === 'type') {
      onAddEquipmentType(quickAddModal.value.trim());
      setValue('equipmentType', quickAddModal.value.trim());
      setValue('equipmentBrand', '');
      setValue('equipmentModel', '');
    } else if (quickAddModal.type === 'brand') {
      onAddBrand(quickAddModal.value.trim(), watchedEquipmentType);
      setValue('equipmentBrand', quickAddModal.value.trim());
      setValue('equipmentModel', '');
    } else if (quickAddModal.type === 'model') {
      const brand = brands.find(b => b.name === watchedEquipmentBrand);
      if (brand) {
        onAddModel(brand.id, quickAddModal.value.trim());
        setValue('equipmentModel', quickAddModal.value.trim());
      }
    }
    
    setQuickAddModal({ ...quickAddModal, isOpen: false, value: '' });
  };

  const onFormSubmit = async (data: ServiceOrderFormData) => {
    console.log('Submitting Service Order Data:', data);
    const orderData = {
      ...data,
      createdBy: currentUser?.id
    };

    if (editingOrder) {
      const success = await onUpdateOrder(editingOrder.id, orderData);
      if (!success) return;
      
      setIsAdding(false);
      setEditingOrder(null);

      if (orderData.status === 'Concluído' && onGeneratePayment) {
        onOpenConfirm(
          'Gerar Pagamento',
          'Deseja gerar a cobrança/pagamento para esta OS agora?',
          () => {
            onGeneratePayment({ ...orderData, id: editingOrder.id });
          },
          'info'
        );
      }
    } else {
      const newId = await onAddOrder(orderData);
      if (!newId) return;
      
      setIsAdding(false);
      setEditingOrder(null);

      if (orderData.status === 'Concluído' && onGeneratePayment) {
        onOpenConfirm(
          'Gerar Pagamento',
          'Deseja gerar a cobrança/pagamento para esta OS agora?',
          () => {
            onGeneratePayment({ ...orderData, id: newId });
          },
          'info'
        );
      } else {
        onOpenConfirm(
          'Enviar via WhatsApp',
          'Deseja enviar a Ordem de Serviço via WhatsApp agora?',
          () => {
            const tempOrder = {
              ...orderData,
              id: newId,
              createdAt: new Date().toISOString()
            };
            setSelectedOrder(tempOrder as any);
            setShowWhatsAppModal(true);
          },
          'info'
        );
      }
    }
    
    reset();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAdding(false)}
          className="absolute inset-0 bg-bg-dark/95 backdrop-blur-xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl glass-modal p-0 max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-white/10"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div>
              <h3 className="text-xl font-bold text-white">{editingOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h3>
              <p className="text-xs text-slate-400 mt-1">Preencha os dados técnicos e do cliente com atenção.</p>
            </div>
            <button onClick={() => setIsAdding(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 custom-scrollbar">
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

            {/* Equipamento */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Dados do Equipamento</h4>
              </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Tipo</label>
                    <div className="flex gap-2">
                      <SearchableSelect
                        options={equipmentTypes.map(t => ({ value: t.name, label: t.name }))}
                        value={watchedEquipmentType || ''}
                        onChange={(val) => {
                          setValue('equipmentType', val as string);
                          setValue('equipmentBrand', '');
                          setValue('equipmentModel', '');
                        }}
                        placeholder="Selecione o Tipo"
                        onAdd={(val) => onAddEquipmentType(val)}
                        className="h-12 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setQuickAddModal({ isOpen: true, type: 'type', title: 'Novo Tipo de Equipamento', placeholder: 'Ex: Notebook, Smartphone...', value: '' })}
                        className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5"
                        title="Adicionar Novo Tipo"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {errors.equipmentType && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.equipmentType.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Marca</label>
                    </div>
                    <div className="flex gap-2">
                      <SearchableSelect
                        options={brands
                          .filter(b => !watchedEquipmentType || b.equipmentType === watchedEquipmentType)
                          .map(b => ({ value: b.name, label: b.name }))}
                        value={watchedEquipmentBrand || ''}
                        onChange={(val) => {
                          setValue('equipmentBrand', val as string);
                          setValue('equipmentModel', '');
                        }}
                        placeholder="Selecione a Marca"
                        onAdd={(val) => onAddBrand(val, watchedEquipmentType || '')}
                        disabled={!watchedEquipmentType}
                        className="h-12 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!watchedEquipmentType) {
                            showToast('Selecione um tipo primeiro!', 'error');
                            return;
                          }
                          setQuickAddModal({ isOpen: true, type: 'brand', title: 'Nova Marca', placeholder: 'Ex: Samsung, Apple...', value: '' });
                        }}
                        disabled={!watchedEquipmentType}
                        className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Adicionar Nova Marca"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {errors.equipmentBrand && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.equipmentBrand.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Modelo</label>
                    </div>
                    <div className="flex gap-2">
                      <SearchableSelect
                        options={models
                          .filter(m => {
                            const brand = brands.find(b => b.name === watchedEquipmentBrand);
                            return brand ? m.brandId === brand.id : false;
                          })
                          .map(m => ({ value: m.name, label: m.name }))}
                        value={watch('equipmentModel') || ''}
                        onChange={(val) => setValue('equipmentModel', val as string)}
                        placeholder="Selecione o Modelo"
                        onAdd={(val) => {
                          const brand = brands.find(b => b.name === watchedEquipmentBrand);
                          if (brand) {
                            onAddModel(brand.id, val);
                          } else {
                            showToast('Selecione uma marca primeiro!', 'error');
                          }
                        }}
                        disabled={!watchedEquipmentBrand}
                        className="h-12 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!watchedEquipmentBrand) {
                            showToast('Selecione uma marca primeiro!', 'error');
                            return;
                          }
                          setQuickAddModal({ isOpen: true, type: 'model', title: 'Novo Modelo', placeholder: 'Ex: Galaxy S23, iPhone 15...', value: '' });
                        }}
                        disabled={!watchedEquipmentBrand}
                        className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Adicionar Novo Modelo"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {errors.equipmentModel && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.equipmentModel.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Cor do Equipamento</label>
                    <input 
                      {...register('equipmentColor')}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 placeholder:text-slate-500 outline-none transition-all"
                      placeholder="Ex: Preto, Prata, Azul"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Nº de Série</label>
                    <input 
                      {...register('equipmentSerial')}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 outline-none transition-all"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
            </div>

            {/* Especificações e Senha */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Cpu size={12} /> RAM
                </label>
                <input 
                  {...register('ramInfo')}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 outline-none transition-all"
                  placeholder="Ex: 8GB DDR4"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <HardDrive size={12} /> SSD/HD
                </label>
                <input 
                  {...register('ssdInfo')}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 outline-none transition-all"
                  placeholder="Ex: 240GB SSD"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Lock size={12} /> Senha do Equipamento
                </label>
                <input 
                  {...register('customerPassword')}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 outline-none transition-all"
                  placeholder="Opcional"
                />
              </div>
            </div>

            {/* Acessórios */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Acessórios Inclusos</label>
              <input 
                {...register('accessories')}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 outline-none transition-all"
                placeholder="Ex: Carregador, Capa, Cabo USB..."
              />
            </div>

            {/* Foto de Entrada */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Foto do Equipamento (Entrada)</h4>
              </div>
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 hover:bg-white/10 transition-all group relative overflow-hidden">
                {watchedArrivalPhoto ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                    <img 
                      src={watchedArrivalPhoto} 
                      alt="Foto de Entrada" 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => setValue('arrivalPhotoBase64', '')}
                      className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-all">
                      <Camera size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">Clique para tirar ou anexar foto</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG ou JPEG (Máx. 2MB)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            showToast('A imagem deve ter no máximo 2MB', 'error');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setValue('arrivalPhotoBase64', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Problema e Análise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-rose-500 ml-1 flex items-center gap-2 bg-rose-500/5 px-2 py-1 rounded-md w-fit mb-1">
                  <AlertCircle size={12} /> Problema Relatado <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  {...register('reportedProblem')}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Descreva o defeito informado pelo cliente..."
                />
                {errors.reportedProblem && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.reportedProblem.message}</p>}
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

            {/* Serviços e Peças */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-8 bg-primary rounded-full" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <Wrench size={12} /> Serviços e Peças
                  </h4>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const name = prompt('Nome do serviço:');
                      const price = parseFloat(prompt('Preço do serviço:') || '0');
                      if (name && !isNaN(price)) {
                        appendService({ name, price });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all"
                  >
                    <Plus size={14} /> Serviço
                  </button>
                  <button 
                    onClick={() => setIsAddingPart(!isAddingPart)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                  >
                    {isAddingPart ? <X size={14} /> : <Plus size={14} />}
                    Peça
                  </button>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-3">
                {serviceFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/20 transition-all">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-200">{watchedServices[idx].name}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mão de Obra</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-black text-primary w-24 text-right">{formatCurrency(watchedServices[idx].price)}</span>
                      <button 
                        type="button"
                        onClick={() => removeService(idx)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {isAddingPart && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl"
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      value={partSearch}
                      onChange={(e) => setPartSearch(e.target.value)}
                      placeholder="Buscar no inventário..."
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {inventoryItems
                      .filter(item => item.name.toLowerCase().includes(partSearch.toLowerCase()) && item.category === 'product')
                      .map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const existingIdx = watchedParts.findIndex(p => p.id === item.id);
                            if (existingIdx !== -1) {
                              const p = watchedParts[existingIdx];
                              updatePart(existingIdx, {
                                ...p,
                                quantity: p.quantity + 1,
                                subtotal: (p.quantity + 1) * p.unitPrice
                              });
                            } else {
                              appendPart({ 
                                id: item.id, 
                                name: item.name, 
                                quantity: 1, 
                                unitPrice: item.unitPrice, 
                                subtotal: item.unitPrice 
                              });
                            }
                            setPartSearch('');
                          }}
                          className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-white/5 text-left transition-all group border border-transparent hover:border-white/5"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200">{item.name}</span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Estoque: {item.stockLevel}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-primary">{formatCurrency(item.unitPrice)}</span>
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                              <Plus size={16} />
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {partFields.map((field, idx) => (
                  <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/20 transition-all gap-4 sm:gap-0">
                    <div className="flex-1 w-full">
                      <p className="text-sm font-bold text-slate-200 truncate">{watchedParts[idx].name}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{formatCurrency(watchedParts[idx].unitPrice)} x {watchedParts[idx].quantity}</p>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
                      <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                        <button 
                          type="button"
                          onClick={() => {
                            if (watchedParts[idx].quantity > 1) {
                              const p = watchedParts[idx];
                              updatePart(idx, {
                                ...p,
                                quantity: p.quantity - 1,
                                subtotal: (p.quantity - 1) * p.unitPrice
                              });
                            }
                          }}
                          className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <span className="text-sm font-black w-6 text-center">{watchedParts[idx].quantity}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            const p = watchedParts[idx];
                            updatePart(idx, {
                              ...p,
                              quantity: p.quantity + 1,
                              subtotal: (p.quantity + 1) * p.unitPrice
                            });
                          }}
                          className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <ChevronUp size={16} />
                        </button>
                      </div>
                      <span className="text-sm font-black text-slate-300 w-24 text-right">{formatCurrency(watchedParts[idx].subtotal)}</span>
                      <button 
                        type="button"
                        onClick={() => removePart(idx)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seção de Fechamento (Apenas Edição) */}
            {editingOrder && (
              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Fechamento e Valores</h4>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-emerald-500 ml-1">Serviços Realizados</label>
                  <textarea 
                    {...register('servicesPerformed')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] text-white placeholder:text-slate-500 resize-none transition-all"
                    placeholder="Descreva o que foi feito no equipamento..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Mão de Obra (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                      <input 
                        type="number"
                        step="0.01"
                        {...register('serviceFee', { valueAsNumber: true })}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Valor Total (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
                      <input 
                        type="number"
                        step="0.01"
                        {...register('totalAmount', { valueAsNumber: true })}
                        className="w-full h-14 bg-primary/10 border border-primary/20 rounded-2xl pl-12 pr-4 text-sm font-black text-primary focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center bg-primary/5 p-6 rounded-3xl border border-primary/20 shadow-inner">
                  <div className="bg-white p-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowQRCodeModal(true)}>
                    <QRCodeSVG 
                      value={`${window.location.origin}/?osId=${editingOrder.id}`}
                      size={140}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                      <QrCode size={16} className="text-primary" />
                      <h5 className="text-sm font-black text-white uppercase tracking-widest">QR Code de Acompanhamento</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Este código permite que o cliente ou técnico acesse esta OS rapidamente via celular. Clique no QR Code para ampliar.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Observações Finais</label>
                  <textarea 
                    {...register('finalObservations')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none min-h-[80px] resize-none transition-all"
                    placeholder="Garantia, recomendações, etc..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleSubmit(onFormSubmit, (errors) => console.log('Validation Errors:', errors))}
              className="flex-[2] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <Check size={20} />
              {editingOrder ? 'Salvar Alterações' : 'Gerar Ordem de Serviço'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddModal.isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickAddModal({ ...quickAddModal, isOpen: false })}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-modal p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-4">{quickAddModal.title}</h3>
              <input 
                autoFocus
                value={quickAddModal.value}
                onChange={(e) => setQuickAddModal({ ...quickAddModal, value: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                placeholder={quickAddModal.placeholder}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none mb-6"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setQuickAddModal({ ...quickAddModal, isOpen: false })}
                  className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleQuickAdd}
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-black hover:bg-primary/90 transition-all"
                >
                  Adicionar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
