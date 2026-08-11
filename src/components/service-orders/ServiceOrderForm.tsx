import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FormProvider, useForm, useFieldArray, type FieldArrayPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { SavingButton } from '../ui/SavingButton';
import { useServiceOrderFormContext } from '../../contexts/ServiceOrderFormContext';
import { useFormStore } from '../../store/useFormStore';
import { useAutosave } from '../../hooks/useAutosave';
import { ServicesAndPartsSection } from './form-sections/ServicesAndPartsSection';
import { EquipmentSection } from './form-sections/EquipmentSection';
import { CustomerSection } from './form-sections/CustomerSection';
import { AnalysisSection } from './form-sections/AnalysisSection';
import { ClosingSection } from './form-sections/ClosingSection';
import { ChecklistSection } from './form-sections/ChecklistSection';
import { WarrantySection } from './form-sections/WarrantySection';
import { QuickAddModal } from './QuickAddModal';
import { serviceOrderSchema, ServiceOrderFormData } from '../../schemas/serviceOrderSchema';
import { format, parseISO } from 'date-fns';
import { sendWhatsAppStatusUpdate } from '../../lib/whatsappUtils';
import { compressImage } from '../../lib/photoUtils';

export const ServiceOrderForm: React.FC = () => {
  const {
    isAdding, setIsAdding, editingOrder, setEditingOrder,
    customers, customersLoading, inventoryItems, statuses, equipmentTypes, brands, models,
    currentUser, onAddOrder, onUpdateOrder, onAddEquipmentType, onAddBrand, onAddModel,
    onTriggerAddCustomer, showToast, onOpenConfirm, setSelectedOrder,
    setShowWhatsAppModal, setShowQRCodeModal, onGeneratePayment,
  } = useServiceOrderFormContext();

  const methods = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema) as any,
    defaultValues: {
      customerId: 0, entryDate: format(new Date(), 'yyyy-MM-dd'),
      equipmentType: '', equipmentBrand: '', equipmentModel: '',
      equipmentColor: '', equipmentSerial: '', reportedProblem: '',
      technicalAnalysis: '', priority: 'medium', status: 'Aguardando Análise',
      customerPassword: '', accessories: '', ramInfo: '', ssdInfo: '',
      arrivalPhotoBase64: '', servicesPerformed: '',
      serviceFee: 0, totalAmount: 0, finalObservations: '',
      services: [], partsUsed: [], checklistIn: [], checklistOut: [], warrantyReturn: false,
    }
  });

  const { register, handleSubmit, control, setValue, watch, reset, setError, clearErrors, formState: { errors } } = methods;

  const draftKey = editingOrder ? `so-draft-${editingOrder.id}` : 'so-draft-new';
  const { load: loadDraft, clear: clearDraft } = useAutosave(draftKey, watch());
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  useEffect(() => {
    if (hasRestoredDraft || editingOrder) return;
    const draft = loadDraft();
    if (draft && Object.keys(draft).length > 0) {
      reset(draft);
      showToast('Rascunho restaurado automaticamente', 'info');
    }
    setHasRestoredDraft(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRestoredDraft]);

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({ control, name: 'services' as FieldArrayPath<ServiceOrderFormData> });
  const { fields: partFields, append: appendPart, remove: removePart, update: updatePart } = useFieldArray({ control, name: 'partsUsed' as FieldArrayPath<ServiceOrderFormData> });

  const watchedServices = watch('services');
  const watchedParts = watch('partsUsed');
  const computedTotal = useMemo(() => {
    const servicesTotal = (watchedServices || []).reduce((acc, s) => acc + (Number(s.price) || 0), 0);
    const partsTotal = (watchedParts || []).reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
    return servicesTotal + partsTotal;
  }, [watchedServices, watchedParts]);
  const watchedEquipmentType = watch('equipmentType');
  const watchedEquipmentBrand = watch('equipmentBrand');
  const watchedArrivalPhotosRaw = watch('arrivalPhotoBase64');
  const watchedArrivalPhotos: Array<{ base64: string; timestamp: string }> = (() => {
    try { return watchedArrivalPhotosRaw ? JSON.parse(watchedArrivalPhotosRaw) : []; }
    catch { return []; }
  })();

  const { newServiceOrder, setNewServiceOrder } = useFormStore();

  useEffect(() => {
    if (!editingOrder && (newServiceOrder as any)?.customerId) {
      setValue('customerId', (newServiceOrder as any).customerId);
      setNewServiceOrder(null);
    }
  }, [editingOrder, newServiceOrder, setNewServiceOrder, setValue]);

  const [isSimplified, setIsSimplified] = useState(false);
  const [skipEquipmentValidation, setSkipEquipmentValidation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const manuallyEditedFee = useRef(false);

  const addPhoto = async (file: File) => {
    if (watchedArrivalPhotos.length >= 3) { showToast('Máximo de 3 fotos permitido', 'error'); return; }
    if (file.size > 4 * 1024 * 1024) { showToast('A imagem deve ter no máximo 4MB', 'error'); return; }
    try {
      const compressed = await compressImage(file);
      const updated = [...watchedArrivalPhotos, { base64: compressed, timestamp: new Date().toISOString() }];
      setValue('arrivalPhotoBase64', JSON.stringify(updated));
    } catch { showToast('Erro ao processar imagem', 'error'); }
  };

  const removePhoto = (index: number) => {
    const updated = watchedArrivalPhotos.filter((_, i) => i !== index);
    setValue('arrivalPhotoBase64', JSON.stringify(updated));
  };

  useEffect(() => {
    if (manuallyEditedFee.current) return;
    const servicesTotal = (watchedServices ?? []).reduce((acc, s) => acc + (Number(s.price) || 0), 0);
    const partsTotal = (watchedParts ?? []).reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
    setValue('serviceFee', servicesTotal);
    setValue('totalAmount', servicesTotal + partsTotal);
  }, [watchedServices, watchedParts, setValue]);

  useEffect(() => {
    if (editingOrder) {
      manuallyEditedFee.current = false;
      reset({
        customerId: editingOrder.customerId,
        entryDate: editingOrder.entryDate || format(parseISO(editingOrder.createdAt), 'yyyy-MM-dd'),
        equipmentType: editingOrder.equipmentType || '', equipmentBrand: editingOrder.equipmentBrand || '',
        equipmentModel: editingOrder.equipmentModel || '', equipmentColor: editingOrder.equipmentColor || '',
        equipmentSerial: editingOrder.equipmentSerial || '', reportedProblem: editingOrder.reportedProblem || '',
        technicalAnalysis: editingOrder.technicalAnalysis || '', priority: (editingOrder.priority as any) || 'medium',
        status: editingOrder.status, customerPassword: editingOrder.customerPassword || '',
        accessories: editingOrder.accessories || '', ramInfo: editingOrder.ramInfo || '', ssdInfo: editingOrder.ssdInfo || '',
        arrivalPhotoBase64: (() => {
          if (editingOrder.arrivalPhotoUrls) {
            const urls = Array.isArray(editingOrder.arrivalPhotoUrls) ? editingOrder.arrivalPhotoUrls as string[]
              : (() => { try { return JSON.parse(editingOrder.arrivalPhotoUrls as string) as string[]; } catch { return []; } })();
            return JSON.stringify(urls.map(url => ({ base64: url, timestamp: '' })));
          }
          return editingOrder.arrivalPhotoBase64 || '';
        })(),
        servicesPerformed: editingOrder.servicesPerformed || '',
        serviceFee: editingOrder.serviceFee || 0, totalAmount: editingOrder.totalAmount || 0,
        finalObservations: editingOrder.finalObservations || '',
        services: editingOrder.services || [], partsUsed: editingOrder.partsUsed || [],
        checklistIn: editingOrder.checklistIn || [], checklistOut: editingOrder.checklistOut || [],
        warrantyReturn: editingOrder.warrantyReturn ?? false,
      });
    } else {
      reset({
        customerId: 0, entryDate: format(new Date(), 'yyyy-MM-dd'),
        equipmentType: '', equipmentBrand: '', equipmentModel: '', equipmentColor: '',
        equipmentSerial: '', reportedProblem: '', technicalAnalysis: '', priority: 'medium',
        status: 'Aguardando Análise', customerPassword: '', accessories: '', ramInfo: '', ssdInfo: '',
        arrivalPhotoBase64: '', servicesPerformed: '', serviceFee: 0, totalAmount: 0,
        finalObservations: '', services: [], partsUsed: [], checklistIn: [], checklistOut: [], warrantyReturn: false,
      });
    }
  }, [editingOrder, reset]);

  useEffect(() => {
    if (isSimplified) clearErrors(['equipmentType', 'equipmentBrand', 'equipmentModel', 'reportedProblem']);
  }, [isSimplified, clearErrors]);

  const [quickAddModal, setQuickAddModal] = useState({ isOpen: false, type: 'type' as 'type' | 'brand' | 'model', title: '', placeholder: '', value: '' });

  const handleQuickAdd = async () => {
    if (!quickAddModal.value.trim()) return;
    try {
      if (quickAddModal.type === 'type') {
        await onAddEquipmentType(quickAddModal.value.trim());
        setValue('equipmentType', quickAddModal.value.trim()); setValue('equipmentBrand', ''); setValue('equipmentModel', '');
      } else if (quickAddModal.type === 'brand') {
        await onAddBrand(quickAddModal.value.trim(), watchedEquipmentType ?? '');
        setValue('equipmentBrand', quickAddModal.value.trim()); setValue('equipmentModel', '');
      } else {
        const brand = brands.find(b => b.name === watchedEquipmentBrand);
        if (brand) { await onAddModel(brand.id, quickAddModal.value.trim()); setValue('equipmentModel', quickAddModal.value.trim()); }
      }
      setQuickAddModal({ ...quickAddModal, isOpen: false, value: '' });
    } catch { showToast('Erro ao adicionar item.', 'error'); }
  };

  const onFormSubmit = async (data: ServiceOrderFormData) => {
    if (isSaving) return;
    setIsSaving(true);
    const editingOrderId = editingOrder?.id;
    let hasError = false;
    if (!isSimplified && !skipEquipmentValidation) {
      if (!data.equipmentType) { setError('equipmentType', { message: 'Obrigatório no modo completo', type: 'manual' }); hasError = true; }
      if (!data.equipmentBrand) { setError('equipmentBrand', { message: 'Obrigatório no modo completo', type: 'manual' }); hasError = true; }
      if (!data.equipmentModel) { setError('equipmentModel', { message: 'Obrigatório no modo completo', type: 'manual' }); hasError = true; }
      if (!data.reportedProblem) { setError('reportedProblem', { message: 'Obrigatório no modo completo', type: 'manual' }); hasError = true; }
    }
    if (hasError) { showToast('Preencha os campos obrigatórios ou ative "Pular equipamento"', 'error'); return; }

    const orderData = {
      ...data,
      checklistIn: data.checklistIn ?? [],
      checklistOut: data.checklistOut ?? [],
      warrantyReturn: data.warrantyReturn ?? false,
      ...(editingOrder ? { updatedBy: currentUser?.id } : { createdBy: currentUser?.id }),
      ...(skipEquipmentValidation && { equipmentType: '', equipmentBrand: '', equipmentModel: '', equipmentColor: '', equipmentSerial: '' }),
    };

    try {
      if (editingOrder) {
        const success = await onUpdateOrder(editingOrderId!, orderData, editingOrder.version);
        if (!success) { setIsSaving(false); return; }
        setIsAdding(false); setEditingOrder(null);
        const notifyStatuses = ['Concluído', 'Pronto', 'Aguardando Autorização', 'Aguardando Aprovação'];
        if (notifyStatuses.includes(orderData.status ?? '')) {
          const customer = customers.find(c => c.id === editingOrder.customerId);
          if (customer?.phone) setTimeout(() => sendWhatsAppStatusUpdate({ ...editingOrder, ...orderData }, customer, 'INOVA PRO', window.location.origin), 300);
        }
        if (orderData.status === 'Concluído' && onGeneratePayment) {
          onOpenConfirm('Gerar Pagamento', 'Deseja gerar a cobrança/pagamento para esta OS agora?', () => onGeneratePayment({ ...orderData, id: editingOrderId! }), 'info');
        }
        reset();
        clearDraft();
      } else {
        const newId = await onAddOrder(orderData);
        if (!newId) { setIsSaving(false); return; }
        setIsAdding(false); setEditingOrder(null);
        if (orderData.status === 'Concluído' && onGeneratePayment) {
          onOpenConfirm('Gerar Pagamento', 'Deseja gerar a cobrança/pagamento para esta OS agora?', () => onGeneratePayment({ ...orderData, id: editingOrderId! }), 'info');
        } else {
          onOpenConfirm('Enviar via WhatsApp', 'Deseja enviar a Ordem de Serviço via WhatsApp agora?', () => {
            setSelectedOrder({ ...orderData, id: newId, createdAt: new Date().toISOString() } as any);
            setShowWhatsAppModal(true);
          }, 'info');
        }
        reset();
        clearDraft();
      }
    } finally { setIsSaving(false); }
  };

  return (
    <FormProvider {...methods}>
      <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="absolute inset-0 bg-bg-dark/95 backdrop-blur-xl" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-5xl glass-modal p-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-white/10 sm:rounded-2xl">
          <div className="px-4 py-3 sm:p-6 border-b border-white/5 flex justify-between items-center gap-3 bg-white/5 mobile-safe-top">
            <div>
              <h3 className="text-base sm:text-xl font-bold text-white">{editingOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h3>
              <p className="hidden sm:block text-xs text-slate-400 mt-1">Preencha os dados técnicos e do cliente com atenção.</p>
            </div>
            <button onClick={() => setIsAdding(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X size={20} />
            </button>
          </div>

          <div id="os-form-body" className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            <CustomerSection isSimplified={isSimplified} setIsSimplified={setIsSimplified} customers={customers} customersLoading={customersLoading} onTriggerAddCustomer={onTriggerAddCustomer} />
            <EquipmentSection skipEquipmentValidation={skipEquipmentValidation} setSkipEquipmentValidation={setSkipEquipmentValidation} isSimplified={isSimplified} equipmentTypes={equipmentTypes} brands={brands} models={models} onAddEquipmentType={onAddEquipmentType} onAddBrand={onAddBrand} onAddModel={onAddModel} setQuickAddModal={setQuickAddModal} showToast={showToast as (msg: string, type: string) => void} watchedArrivalPhotos={watchedArrivalPhotos} addPhoto={addPhoto} removePhoto={removePhoto} />
            <AnalysisSection isSimplified={isSimplified} statuses={statuses} />
            <ChecklistSection />
            <ServicesAndPartsSection inventoryItems={inventoryItems} serviceFields={serviceFields} watchedServices={watchedServices ?? []} appendService={appendService} removeService={removeService} partFields={partFields} watchedParts={watchedParts ?? []} appendPart={appendPart} removePart={removePart} updatePart={updatePart} />
            <WarrantySection editingOrder={editingOrder} />
            <ClosingSection register={register} editingOrder={editingOrder} computedTotal={computedTotal} manuallyEditedFee={manuallyEditedFee} setShowQRCodeModal={setShowQRCodeModal} />
          </div>

          <div className="p-3 sm:p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row gap-2 sm:gap-4 mobile-safe-bottom">
            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all order-2 sm:order-1">Cancelar</button>
            <SavingButton type="button" onClick={handleSubmit(onFormSubmit as any)} isSaving={isSaving} className="flex-[2] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {editingOrder ? 'Salvar Alterações' : 'Gerar Ordem de Serviço'}
            </SavingButton>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {quickAddModal.isOpen && (
          <QuickAddModal
            isOpen={quickAddModal.isOpen}
            type={quickAddModal.type}
            title={quickAddModal.title}
            placeholder={quickAddModal.placeholder}
            value={quickAddModal.value}
            onClose={() => setQuickAddModal({ ...quickAddModal, isOpen: false })}
            onValueChange={(v) => setQuickAddModal({ ...quickAddModal, value: v })}
            onConfirm={handleQuickAdd}
          />
        )}
      </AnimatePresence>
    </FormProvider>
  );
};
