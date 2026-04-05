import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { ServiceOrder, ServiceOrderPart, ServiceOrderItem, User } from '../types';
import { useFormStore } from '../store/useFormStore';

interface UseServiceOrderFormProps {
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  editingOrder: ServiceOrder | null;
  setEditingOrder: (order: ServiceOrder | null) => void;
  onAddOrder: (order: any) => Promise<number | null>;
  onUpdateOrder: (id: number, order: any) => Promise<boolean>;
  currentUser: User | null;
  showToast: (message: string, type: 'success' | 'error') => void;
  onOpenConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  setSelectedOrder: (order: ServiceOrder | null) => void;
  setShowWhatsAppModal: (show: boolean) => void;
  onGeneratePayment?: (order: any) => void;
}

export const useServiceOrderForm = ({
  isAdding,
  setIsAdding,
  editingOrder,
  setEditingOrder,
  onAddOrder,
  onUpdateOrder,
  currentUser,
  showToast,
  onOpenConfirm,
  setSelectedOrder,
  setShowWhatsAppModal,
  onGeneratePayment
}: UseServiceOrderFormProps) => {
  const { newServiceOrder } = useFormStore();

  const initialFormState = {
    customerId: 0,
    equipmentType: '',
    equipmentBrand: '',
    equipmentModel: '',
    equipmentColor: '',
    equipmentSerial: '',
    reportedProblem: '',
    status: 'Aguardando Análise',
    technicalAnalysis: '',
    servicesPerformed: '',
    serviceFee: '',
    totalAmount: '',
    finalObservations: '',
    entryDate: format(new Date(), 'yyyy-MM-dd'),
    analysisPrediction: '',
    customerPassword: '',
    accessories: '',
    ramInfo: '',
    ssdInfo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    partsUsed: [] as ServiceOrderPart[],
    services: [] as ServiceOrderItem[],
    arrivalPhotoBase64: ''
  };

  const [newOrder, setNewOrder] = useState(initialFormState);

  // Sync with global store when adding new
  useEffect(() => {
    if (newServiceOrder && isAdding && !editingOrder) {
      setNewOrder(prev => ({
        ...prev,
        customerId: newServiceOrder.customerId || prev.customerId,
        equipmentType: newServiceOrder.equipmentType || prev.equipmentType,
        equipmentBrand: newServiceOrder.equipmentBrand || prev.equipmentBrand,
        equipmentModel: newServiceOrder.equipmentModel || prev.equipmentModel,
        reportedProblem: newServiceOrder.reportedProblem || prev.reportedProblem,
        status: newServiceOrder.status || prev.status,
        entryDate: newServiceOrder.entryDate || prev.entryDate,
        analysisPrediction: newServiceOrder.analysisPrediction || prev.analysisPrediction,
        accessories: newServiceOrder.accessories || prev.accessories,
        priority: newServiceOrder.priority || prev.priority,
      }));
    }
  }, [newServiceOrder, isAdding, editingOrder]);

  // Sync with editing order
  useEffect(() => {
    if (editingOrder) {
      setNewOrder({
        customerId: editingOrder.customerId,
        equipmentType: editingOrder.equipmentType || '',
        equipmentBrand: editingOrder.equipmentBrand || '',
        equipmentModel: editingOrder.equipmentModel || '',
        equipmentColor: editingOrder.equipmentColor || '',
        equipmentSerial: editingOrder.equipmentSerial || '',
        reportedProblem: editingOrder.reportedProblem || '',
        status: editingOrder.status,
        technicalAnalysis: editingOrder.technicalAnalysis || '',
        servicesPerformed: editingOrder.servicesPerformed || '',
        serviceFee: editingOrder.serviceFee?.toString() || '',
        totalAmount: editingOrder.totalAmount?.toString() || '',
        finalObservations: editingOrder.finalObservations || '',
        entryDate: editingOrder.entryDate || format(parseISO(editingOrder.createdAt), 'yyyy-MM-dd'),
        analysisPrediction: editingOrder.analysisPrediction || '',
        customerPassword: editingOrder.customerPassword || '',
        accessories: editingOrder.accessories || '',
        ramInfo: editingOrder.ramInfo || '',
        ssdInfo: editingOrder.ssdInfo || '',
        priority: editingOrder.priority || 'medium',
        partsUsed: editingOrder.partsUsed || [],
        services: editingOrder.services || [],
        arrivalPhotoBase64: editingOrder.arrivalPhotoBase64 || ''
      });
    } else {
      setNewOrder(initialFormState);
    }
  }, [editingOrder]);

  const updateOrderTotals = useCallback((updatedServices: ServiceOrderItem[], updatedParts: ServiceOrderPart[]) => {
    const newFee = updatedServices.reduce((acc, s) => acc + s.price, 0);
    const partsTotal = updatedParts.reduce((acc, p) => acc + p.subtotal, 0);
    setNewOrder(prev => ({
      ...prev,
      services: updatedServices,
      partsUsed: updatedParts,
      serviceFee: newFee.toString(),
      totalAmount: (newFee + partsTotal).toFixed(2)
    }));
  }, []);

  const handleSave = async () => {
    if (newOrder.customerId === 0) {
      showToast("Selecione um cliente.", "error");
      return;
    }
    
    if (!newOrder.reportedProblem.trim()) {
      showToast("Descreva o problema relatado.", "error");
      return;
    }
    
    const orderData = {
      ...newOrder,
      serviceFee: parseFloat(newOrder.serviceFee.toString().replace(',', '.')) || 0,
      totalAmount: parseFloat(newOrder.totalAmount.toString().replace(',', '.')) || 0,
      createdBy: currentUser?.id
    };

    if (editingOrder) {
      const success = await onUpdateOrder(editingOrder.id, orderData);
      if (!success) return;
      
      setIsAdding(false);
      setEditingOrder(null);

      // Check if status was changed to Concluído
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

      // Check if status is Concluído
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
    
    setNewOrder(initialFormState);
  };

  return {
    newOrder,
    setNewOrder,
    updateOrderTotals,
    handleSave,
    resetForm: () => setNewOrder(initialFormState)
  };
};
