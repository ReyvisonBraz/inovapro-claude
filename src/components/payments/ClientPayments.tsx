import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { ClientPayment, Customer, PaymentListItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useFormStore } from '../../store/useFormStore';
import { useAppStore } from '../../store/useAppStore';
import { useFilterStore } from '../../store/useFilterStore';
import { useModalStore } from '../../store/useModalStore';
import { AddClientPaymentModal } from './modals/AddClientPaymentModal';
import { RecordPaymentModal } from './modals/RecordPaymentModal';
import { Pagination } from '../ui/Pagination';
import { PaymentCardMobile } from './PaymentCardMobile';
import { PaymentTableDesktop } from './PaymentTableDesktop';

interface ClientPaymentsProps {
  filteredClientPayments: ClientPayment[];
  generateReceipt: (payment: ClientPayment, type: 'simple' | 'a4') => void;
  sendWhatsAppReminder: (payment: ClientPayment) => void;
  handleDeleteClientPayment: (payment: ClientPayment) => void;
  handleDeleteClientPaymentGroup: (saleId: string) => void;
  handleRecordPayment: (data: any) => void;
  customers: Customer[];
  handleAddClientPayment: (data: any) => void;
  isSaving?: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  paymentSearchTerm: string;
  setPaymentSearchTerm: (value: string) => void;
  onTriggerAddCustomer?: () => void;
}

export const ClientPayments = ({
  filteredClientPayments,
  generateReceipt,
  sendWhatsAppReminder,
  handleDeleteClientPayment,
  handleDeleteClientPaymentGroup,
  handleRecordPayment,
  customers,
  handleAddClientPayment,
  isSaving,
  pagination,
  onPageChange,
  paymentSearchTerm,
  setPaymentSearchTerm,
  onTriggerAddCustomer
}: ClientPaymentsProps) => {

  const { expandedPayments, togglePaymentExpansion } = useAppStore();
  const { paymentFilterStatus, setPaymentFilterStatus, paymentSortMode, setPaymentSortMode } = useFilterStore();
  const { isRecordingPayment, setIsRecordingPayment, isAddingClientPayment, setIsAddingClientPayment } = useModalStore();

  const setNewClientPayment = useFormStore((s) => s.setNewClientPayment);
  const [paymentInitialData, setPaymentInitialData] = useState<{ customerId: number } | null>(null);

  useEffect(() => {
    if (isAddingClientPayment) {
      const { customerId } = useFormStore.getState().newClientPayment;
      if (customerId > 0) {
        setPaymentInitialData({ customerId });
        setNewClientPayment({ customerId: 0 });
      }
    } else {
      setPaymentInitialData(null);
    }
  }, [isAddingClientPayment, setNewClientPayment]);

  const groupedPayments: PaymentListItem[] = React.useMemo(() => {
    const groups: { [key: string]: ClientPayment[] } = {};
    const result: PaymentListItem[] = [];
    const processedSaleIds = new Set<string>();

    filteredClientPayments.forEach(payment => {
      if (payment.saleId) {
        if (!groups[payment.saleId]) groups[payment.saleId] = [];
        groups[payment.saleId].push(payment);
      }
    });

    filteredClientPayments.forEach(payment => {
      if (!payment.saleId) {
        result.push(payment);
      } else if (!processedSaleIds.has(payment.saleId)) {
        const groupPayments = groups[payment.saleId];
        if (groupPayments.length > 1) {
          result.push({ isGroup: true, payments: groupPayments, saleId: payment.saleId });
        } else {
          result.push(payment);
        }
        processedSaleIds.add(payment.saleId);
      }
    });

    return result;
  }, [filteredClientPayments]);

  const sharedHandlers = {
    expandedPayments,
    togglePaymentExpansion,
    onRecordPayment: setIsRecordingPayment,
    onGenerateReceipt: generateReceipt,
    onSendWhatsApp: sendWhatsAppReminder,
    onDeletePayment: handleDeleteClientPayment,
    onDeleteGroup: handleDeleteClientPaymentGroup,
    hasPayments: filteredClientPayments.length > 0,
  };

  return (
    <div className="p-4 lg:p-10 space-y-4 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold tracking-tight">Pagamentos e Parcelamentos</h3>
          <p className="text-xs lg:text-sm text-slate-500 font-bold mt-1">Registre vendas, parcelamentos e envie lembretes de cobrança</p>
        </div>
        <button
          onClick={() => setIsAddingClientPayment(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={18} />
          Novo Registro
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-3 lg:p-4 border-b border-white/5 flex flex-col lg:flex-row gap-3 lg:gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 lg:left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente ou descrição..."
              value={paymentSearchTerm}
              onChange={(e) => setPaymentSearchTerm(e.target.value)}
              className="w-full h-10 lg:h-12 bg-white/5 border border-white/10 rounded-xl pl-10 lg:pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto">
            <select
              value={paymentFilterStatus}
              onChange={(e) => setPaymentFilterStatus(e.target.value)}
              className="h-10 lg:h-12 bg-white/5 border border-white/10 rounded-xl px-3 lg:px-4 text-xs lg:text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
            >
              <option value="all">Status</option>
              <option value="paid">Pagos</option>
              <option value="partial">Parciais</option>
              <option value="pending">Pendentes</option>
              <option value="overdue">Vencidos</option>
            </select>
            <select
              value={paymentSortMode}
              onChange={(e) => setPaymentSortMode(e.target.value as 'date' | 'amount' | 'alphabetical')}
              className="h-10 lg:h-12 bg-white/5 border border-white/10 rounded-xl px-3 lg:px-4 text-xs lg:text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
            >
              <option value="date">Recentes</option>
              <option value="amount">Valor</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>

        <PaymentCardMobile
          groupedPayments={groupedPayments}
          onClearFilters={() => {
            setPaymentSearchTerm('');
            setPaymentFilterStatus('all');
          }}
          {...sharedHandlers}
        />

        <PaymentTableDesktop
          groupedPayments={groupedPayments}
          {...sharedHandlers}
        />

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={onPageChange}
        />
      </div>

      <AddClientPaymentModal
        isOpen={isAddingClientPayment}
        onClose={() => setIsAddingClientPayment(false)}
        customers={customers}
        onAdd={handleAddClientPayment}
        onTriggerAddCustomer={onTriggerAddCustomer}
        isSaving={isSaving}
        initialData={paymentInitialData ?? undefined}
      />

      <RecordPaymentModal
        payment={isRecordingPayment}
        onClose={() => setIsRecordingPayment(null)}
        onConfirm={handleRecordPayment}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};