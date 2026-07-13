import React, { useState, useEffect } from 'react';
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react';
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
        const group = groups[payment.saleId]!;
        group.push(payment);
      }
    });

    filteredClientPayments.forEach(payment => {
      if (!payment.saleId) {
        result.push(payment);
      } else if (!processedSaleIds.has(payment.saleId)) {
        const groupPayments = groups[payment.saleId]!;
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
    <div className="px-3 py-4 sm:p-6 lg:p-10 space-y-4 lg:space-y-8 pb-28 lg:pb-10">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight truncate">Vendas e pagamentos</h3>
          <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">Vendas, parcelas e cobranças em um só lugar</p>
        </div>
        <button
          onClick={() => setIsAddingClientPayment(true)}
          aria-label="Novo Registro"
          className="shrink-0 h-11 sm:h-12 bg-primary hover:bg-primary/90 text-white px-3.5 sm:px-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden min-[360px]:inline">Nova venda</span>
          <span className="min-[360px]:hidden">Nova</span>
        </button>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl lg:rounded-[2rem]">
        <div className="p-3 sm:p-4 border-b border-white/5 space-y-2.5 lg:flex lg:items-center lg:gap-4 lg:space-y-0">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 lg:left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              type="text"
              placeholder="Buscar por cliente ou descrição..."
              value={paymentSearchTerm}
              onChange={(e) => setPaymentSearchTerm(e.target.value)}
              className="w-full h-11 lg:h-12 bg-white/5 border border-white/10 rounded-xl pl-10 lg:pl-12 pr-10 text-sm font-semibold focus:ring-1 focus:ring-primary outline-none"
            />
            {paymentSearchTerm && (
              <button onClick={() => setPaymentSearchTerm('')} className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center text-slate-500 active:text-white" aria-label="Limpar busca">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto">
            <select
              value={paymentFilterStatus}
              onChange={(e) => setPaymentFilterStatus(e.target.value)}
              className="h-11 lg:h-12 min-w-0 bg-white/5 border border-white/10 rounded-xl px-2.5 lg:px-4 text-xs lg:text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
            >
              <option value="all">Todos os status</option>
              <option value="paid">Pagos</option>
              <option value="partial">Parciais</option>
              <option value="pending">Pendentes</option>
              <option value="overdue">Vencidos</option>
            </select>
            <select
              value={paymentSortMode}
              onChange={(e) => setPaymentSortMode(e.target.value as 'date' | 'amount' | 'alphabetical')}
              className="h-11 lg:h-12 min-w-0 bg-white/5 border border-white/10 rounded-xl px-2.5 lg:px-4 text-xs lg:text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
            >
              <option value="date">Recentes</option>
              <option value="amount">Valor</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
          <div className="lg:hidden flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1">
            <SlidersHorizontal size={12} />
            {pagination.totalItems} {pagination.totalItems === 1 ? 'registro' : 'registros'}
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
