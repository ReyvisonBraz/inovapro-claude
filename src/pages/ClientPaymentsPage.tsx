import React, { useState, useEffect } from 'react';
import { ClientPayments } from '../components/payments/ClientPayments';
import { useClientPayments } from '../hooks/useClientPayments';
import { useCustomers } from '../hooks/useCustomers';
import { useToast } from '../components/ui/Toast';
import { useFilterStore } from '../store/useFilterStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import { useFormStore } from '../store/useFormStore';
import { useAppStore } from '../store/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
import { useReceipt } from '../hooks/useReceipt';
import { format } from 'date-fns';
import { sendWhatsAppPaymentReminder } from '../lib/whatsappUtils';
import { ClientPayment } from '../types';

export const ClientPaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { 
    clientPaymentsQuery,
    paymentsPage,
    setPaymentsPage,
    addPaymentMutation,
    deletePaymentMutation,
    recordPaymentMutation
  } = useClientPayments();
  
  const { customers } = useCustomers();
  const { settings } = useSettingsStore();
  const { currentUser } = useAuthStore();
  const { 
    paymentSearchTerm, setPaymentSearchTerm,
    paymentFilterStatus, setPaymentFilterStatus,
    paymentSortMode, setPaymentSortMode
  } = useFilterStore();
  
  const [localSearchTerm, setLocalSearchTerm] = useState(paymentSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  useEffect(() => {
    setPaymentSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setPaymentSearchTerm]);

  const { generateReceipt } = useReceipt(settings, customers.data);

  const {
    setClientPaymentToDelete,
    setIsRecordingPayment,
    isRecordingPayment,
    paymentAmount,
    setPaymentAmount,
    paymentDate,
    setPaymentDate,
    openConfirm
  } = useModalStore();
  
  const { 
    isAddingClientPayment, setIsAddingClientPayment,
    expandedPayments, togglePaymentExpansion,
    setIsAddingCustomer,
    setCustomerRegistrationSource
  } = useAppStore();

  const clientPayments = clientPaymentsQuery.data || { data: [], meta: { page: 1, totalPages: 1, total: 0, limit: 10 } };

  const filteredClientPayments = clientPayments.data.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(paymentSearchTerm.toLowerCase()) || 
                          payment.description.toLowerCase().includes(paymentSearchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

    switch (paymentFilterStatus) {
      case 'paid': return payment.status === 'paid';
      case 'partial': return payment.status === 'partial';
      case 'pending': return payment.status === 'pending' && !isOverdue;
      case 'overdue': return isOverdue;
      default: return true;
    }
  }).sort((a, b) => {
    if (paymentSortMode === 'amount') {
      return b.totalAmount - a.totalAmount;
    } else if (paymentSortMode === 'alphabetical') {
      return a.customerName.localeCompare(b.customerName);
    } else {
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
  });

  const handleAddClientPayment = async (data: any) => {
    try {
      const total = data.totalAmount;
      const paid = data.paidAmount || 0;
      const installmentsCount = data.installmentsCount || 1;
      const interval = data.installmentInterval || 'monthly';
      const saleId = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const paymentsToCreate = [];

      // 1. Criar a Entrada se houver
      if (paid > 0) {
        paymentsToCreate.push({
          ...data,
          description: `ENTRADA: ${data.description}`,
          totalAmount: paid,
          paidAmount: paid,
          dueDate: data.purchaseDate,
          status: 'paid',
          installmentsCount: 1,
          saleId,
          createdBy: currentUser?.id
        });
      }

      // 2. Criar as parcelas do saldo restante
      const remainingAmount = total - paid;
      if (remainingAmount > 0) {
        const installmentAmount = remainingAmount / installmentsCount;

        for (let i = 0; i < installmentsCount; i++) {
          let dueDate = new Date(data.dueDate + 'T12:00:00');
          if (interval === 'monthly') {
            dueDate.setMonth(dueDate.getMonth() + i);
          } else if (interval === 'biweekly' || interval === '15days') {
            dueDate.setDate(dueDate.getDate() + (i * 15));
          } else if (interval === 'weekly') {
            dueDate.setDate(dueDate.getDate() + (i * 7));
          } else if (interval === 'daily') {
            dueDate.setDate(dueDate.getDate() + i);
          }

          const description = installmentsCount > 1 
            ? `${data.description} (Parcela ${i + 1}/${installmentsCount})`
            : data.description;

          paymentsToCreate.push({
            ...data,
            description,
            totalAmount: installmentAmount,
            paidAmount: 0,
            dueDate: format(dueDate, 'yyyy-MM-dd'),
            status: 'pending',
            installmentsCount: 1,
            saleId,
            createdBy: currentUser?.id
          });
        }
      }

      // We need to handle multiple creations. For now, let's just loop the mutation.
      // Ideally, the backend should handle bulk creation.
      for (const payment of paymentsToCreate) {
        await addPaymentMutation.mutateAsync(payment);
      }

      setIsAddingClientPayment(false);
      showToast('Pagamento adicionado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to add client payment", err);
      showToast('Erro ao adicionar pagamento de cliente.', 'error');
    }
  };

  const handleRecordPayment = async (data: any) => {
    if (!isRecordingPayment) return;
    
    try {
      await recordPaymentMutation.mutateAsync({
        paymentId: isRecordingPayment.id,
        amount: data.amount,
        date: new Date(data.date).toISOString(),
        userId: currentUser?.id
      });
      setIsRecordingPayment(null);
      showToast('Pagamento registrado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to record payment", err);
      showToast('Erro ao registrar pagamento.', 'error');
    }
  };

  const handleWhatsAppReminder = (payment: ClientPayment) => {
    const customer = customers.data.find(c => c.id === payment.customerId);
    if (!customer) return;
    sendWhatsAppPaymentReminder(payment, customer, settings.appName);
  };

  const handleDeleteClientPaymentGroup = async (saleId: string) => {
    openConfirm(
      'Excluir Venda Completa',
      'Deseja excluir todos os lançamentos desta venda agrupada? Esta ação não pode ser desfeita.',
      async () => {
        try {
          const res = await fetch(`/api/client-payments/group/${saleId}`, { method: 'DELETE' });
          if (res.ok) {
            clientPaymentsQuery.refetch();
            showToast('Venda excluída com sucesso.', 'success');
          }
        } catch (err) {
          console.error("Failed to delete client payment group", err);
          showToast('Erro ao excluir venda.', 'error');
        }
      },
      'danger'
    );
  };

  return (
    <ClientPayments 
      filteredClientPayments={filteredClientPayments}
      generateReceipt={generateReceipt}
      sendWhatsAppReminder={handleWhatsAppReminder}
      handleDeleteClientPayment={(payment) => {
        openConfirm(
          'Excluir Lançamento',
          'Tem certeza que deseja excluir este lançamento?',
          async () => {
            try {
              await deletePaymentMutation.mutateAsync(payment.id);
              showToast('Lançamento excluído com sucesso.', 'success');
            } catch (err) {
              showToast('Erro ao excluir lançamento.', 'error');
            }
          },
          'danger'
        );
      }}
      handleDeleteClientPaymentGroup={handleDeleteClientPaymentGroup}
      handleRecordPayment={handleRecordPayment}
      customers={customers.data}
      handleAddClientPayment={handleAddClientPayment}
      isSaving={addPaymentMutation.isPending || recordPaymentMutation.isPending}
      pagination={{
        currentPage: clientPayments.meta.page,
        totalPages: clientPayments.meta.totalPages,
        totalItems: clientPayments.meta.total,
        limit: clientPayments.meta.limit
      }}
      onPageChange={setPaymentsPage}
      isAddingClientPayment={isAddingClientPayment}
      setIsAddingClientPayment={setIsAddingClientPayment}
      expandedPayments={expandedPayments}
      togglePaymentExpansion={togglePaymentExpansion}
      paymentSearchTerm={localSearchTerm}
      setPaymentSearchTerm={setLocalSearchTerm}
      paymentFilterStatus={paymentFilterStatus}
      setPaymentFilterStatus={setPaymentFilterStatus}
      paymentSortMode={paymentSortMode}
      setPaymentSortMode={setPaymentSortMode}
      isRecordingPayment={isRecordingPayment}
      setIsRecordingPayment={setIsRecordingPayment}
      onTriggerAddCustomer={() => {
        setCustomerRegistrationSource('payments');
        setIsAddingCustomer(true);
      }}
    />
  );
};

export default ClientPaymentsPage;
