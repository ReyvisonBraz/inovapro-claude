import React, { useState, useRef, useEffect } from 'react';
import { FormProvider, useForm, useFieldArray, type FieldArrayPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User as UserIcon, Calendar, Plus, Search, 
  Cpu, HardDrive, Lock, Camera, Trash2, AlertCircle, 
  ClipboardList, Wrench, ChevronDown, ChevronUp, Check, QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ServiceOrderPart, ServiceOrderItem } from '../../types';
import { useServiceOrderFormContext } from '../../contexts/ServiceOrderFormContext';
import { useFormStore } from '../../store/useFormStore';
import { cn, formatCurrency } from '../../lib/utils';
import { CustomerSearchSelect } from '../customers/CustomerSearchSelect';
import { SearchableSelect } from '../ui/SearchableSelect';
import { ServicesAndPartsSection } from './form-sections/ServicesAndPartsSection';
import { EquipmentSection } from './form-sections/EquipmentSection';
import { CustomerSection } from './form-sections/CustomerSection';
import { AnalysisSection } from './form-sections/AnalysisSection';
import { ClosingSection } from './form-sections/ClosingSection';
import { serviceOrderSchema, ServiceOrderFormData } from '../../schemas/serviceOrderSchema';
import { format, parseISO } from 'date-fns';
import { sendWhatsAppStatusUpdate } from '../../lib/whatsappUtils';

export const ServiceOrderForm: React.FC = () => {
  const {
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
    onGeneratePayment,
  } = useServiceOrderFormContext();
  const methods = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema) as any,
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

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors }
  } = methods;

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'services' as FieldArrayPath<ServiceOrderFormData>,
  });

  const { fields: partFields, append: appendPart, remove: removePart, update: updatePart } = useFieldArray({
    control,
    name: 'partsUsed' as FieldArrayPath<ServiceOrderFormData>,
  });

  const watchedServices = watch('services');
  const watchedParts = watch('partsUsed');
  const watchedServiceFee = watch('serviceFee');
  const watchedCustomerId = watch('customerId');
  const watchedEquipmentType = watch('equipmentType');
  const watchedEquipmentBrand = watch('equipmentBrand');
  const watchedArrivalPhoto = watch('arrivalPhotoBase64');
  const watchedPriority = watch('priority');
const watchedArrivalPhotosRaw = watch('arrivalPhotoBase64');
const watchedArrivalPhotos: Array<{base64: string; timestamp: string}> = (() => {
  try {
    return watchedArrivalPhotosRaw ? JSON.parse(watchedArrivalPhotosRaw) : [];
  } catch {
    return [];
  }
})();

  const { newServiceOrder, setNewServiceOrder } = useFormStore();

  // Pré-preenche o cliente quando o form abre vindo do cadastro de cliente
  useEffect(() => {
    if (!editingOrder && (newServiceOrder as any)?.customerId) {
      setValue('customerId', (newServiceOrder as any).customerId);
      setNewServiceOrder(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isSimplified, setIsSimplified] = useState(false);
  // Estado para pular validação de equipamento
  const [skipEquipmentValidation, setSkipEquipmentValidation] = useState(false);

  // Reset skipEquipmentValidation when switching from simplified
  useEffect(() => {
    if (!isSimplified && skipEquipmentValidation) {
      // Keep the value, just don't skip
    }
  }, [isSimplified]);

  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject('Could not get canvas context'); return; }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const addPhoto = async (file: File) => {
    if (watchedArrivalPhotos.length >= 3) {
      showToast('Máximo de 3 fotos permitido', 'error');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 4MB', 'error');
      return;
    }
    try {
      const compressed = await compressImage(file);
      const newPhoto = { base64: compressed, timestamp: new Date().toISOString() };
      const updated = [...watchedArrivalPhotos, newPhoto];
      setValue('arrivalPhotoBase64', JSON.stringify(updated));
    } catch {
      showToast('Erro ao processar imagem', 'error');
    }
  };

  const removePhoto = (index: number) => {
    const updated = watchedArrivalPhotos.filter((_, i) => i !== index);
    setValue('arrivalPhotoBase64', JSON.stringify(updated));
  };

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
        arrivalPhotoBase64: (() => {
          if (editingOrder.arrivalPhotoUrls) {
            try {
              const urls: string[] = JSON.parse(editingOrder.arrivalPhotoUrls);
              return JSON.stringify(urls.map(url => ({ base64: url, timestamp: '' })));
            } catch { return ''; }
          }
          return editingOrder.arrivalPhotoBase64 || '';
        })(),
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

  
  


  useEffect(() => {
    if (isSimplified) {
      clearErrors(['equipmentType', 'equipmentBrand', 'equipmentModel', 'reportedProblem']);
    }
  }, [isSimplified, clearErrors]);

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

  const handleQuickAdd = async () => {
    if (!quickAddModal.value.trim()) return;
    
    try {
      if (quickAddModal.type === 'type') {
        await onAddEquipmentType(quickAddModal.value.trim());
        setValue('equipmentType', quickAddModal.value.trim());
        setValue('equipmentBrand', '');
        setValue('equipmentModel', '');
      } else if (quickAddModal.type === 'brand') {
        await onAddBrand(quickAddModal.value.trim(), watchedEquipmentType);
        setValue('equipmentBrand', quickAddModal.value.trim());
        setValue('equipmentModel', '');
      } else if (quickAddModal.type === 'model') {
        const brand = brands.find(b => b.name === watchedEquipmentBrand);
        if (brand) {
          await onAddModel(brand.id, quickAddModal.value.trim());
          setValue('equipmentModel', quickAddModal.value.trim());
        }
      }
      setQuickAddModal({ ...quickAddModal, isOpen: false, value: '' });
    } catch {
      showToast('Erro ao adicionar item.', 'error');
    }
  };

  const onFormSubmit = async (data: ServiceOrderFormData) => {
    let hasError = false;
    const shouldValidateEquipment = !isSimplified && !skipEquipmentValidation;

    if (shouldValidateEquipment) {
      if (!data.equipmentType) { setError('equipmentType', { message: 'Obrigatório no modo completo', type: 'manual' }); hasError = true; }
      if (!data.equipmentBrand) { setError('equipmentBrand', { message: 'Obrigatório no modo completo', type: 'manual' }); hasError = true; }
      if (!data.equipmentModel) { setError('equipmentModel', { message: 'Obrigatório no modo completo', type: 'manual' }); hasError = true; }
      if (!data.reportedProblem) { setError('reportedProblem', { message: 'Obrigatório no modo completo', type: 'manual' }); hasError = true; }
    }

    if (hasError) {
      showToast('Preencha os campos obrigatórios ou ative "Pular equipamento"', 'error');
      setTimeout(() => {
        const body = document.getElementById('os-form-body');
        const firstError = body?.querySelector<HTMLElement>('.form-field-error');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
      return;
    }

    // Se skipEquipmentValidation, limpa os campos de equipamento para não salvar dados inválidos
    const orderData = {
      ...data,
      ...(editingOrder ? { updatedBy: currentUser?.id } : { createdBy: currentUser?.id }),
      ...(skipEquipmentValidation && {
        equipmentType: '',
        equipmentBrand: '',
        equipmentModel: '',
        equipmentColor: '',
        equipmentSerial: '',
      })
    };

    if (editingOrder) {
      const success = await onUpdateOrder(editingOrder.id, orderData, editingOrder.updatedAt);
      if (!success) return;
      
      setIsAdding(false);
      setEditingOrder(null);

      const notifyStatuses = ['Concluído', 'Pronto', 'Aguardando Autorização', 'Aguardando Aprovação'];
      if (notifyStatuses.includes(orderData.status)) {
        const appUrl = window.location.origin;
        const orderWithCustomer = { ...editingOrder, ...orderData };
        const customer = customers.find(c => c.id === editingOrder.customerId);
        if (customer?.phone) {
          setTimeout(() => {
            sendWhatsAppStatusUpdate(orderWithCustomer, customer, 'INOVA PRO', appUrl);
          }, 300);
        }
      }

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
    <FormProvider {...methods}>
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
          className="relative w-full max-w-5xl glass-modal p-0 max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-white/10"
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
          <div id="os-form-body" className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* Cliente e Data Componentizado */}
            <CustomerSection 
              isSimplified={isSimplified}
              setIsSimplified={setIsSimplified}
              customers={customers}
              onTriggerAddCustomer={onTriggerAddCustomer}
            />

            {/* Equipamento Componentizado */}
            <EquipmentSection 
              skipEquipmentValidation={skipEquipmentValidation}
              setSkipEquipmentValidation={setSkipEquipmentValidation}
              isSimplified={isSimplified}
              equipmentTypes={equipmentTypes}
              brands={brands}
              models={models}
              onAddEquipmentType={onAddEquipmentType}
              onAddBrand={onAddBrand}
              onAddModel={onAddModel}
              setQuickAddModal={setQuickAddModal}
              showToast={showToast}
              watchedArrivalPhotos={watchedArrivalPhotos}
              addPhoto={addPhoto}
              removePhoto={removePhoto}
            />

            {/* Problema e Análise Componentizado */}
            <AnalysisSection 
              isSimplified={isSimplified}
              statuses={statuses}
            />

            {/* Serviços e Peças Componentizado */}
            <ServicesAndPartsSection 
              inventoryItems={inventoryItems}
              serviceFields={serviceFields}
              watchedServices={watchedServices}
              appendService={appendService}
              removeService={removeService}
              partFields={partFields}
              watchedParts={watchedParts}
              appendPart={appendPart}
              removePart={removePart}
              updatePart={updatePart}
            />

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
              onClick={handleSubmit(onFormSubmit as any)}
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
    </FormProvider>
  );
};
