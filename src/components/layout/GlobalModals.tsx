import React from 'react';
import { format } from 'date-fns';
import { useModalStore } from '../../store/useModalStore';
import { useAppStore } from '../../store/useAppStore';
import { useFormStore } from '../../store/useFormStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { CustomerModal } from '../modals/CustomerModal';
import { CustomerWarningModal } from '../modals/CustomerWarningModal';
import { CustomerDeleteWarningModal } from '../modals/CustomerDeleteWarningModal';
import { PasswordModal } from '../modals/PasswordModal';
import { WarningModal } from '../modals/WarningModal';
import { AddTransactionModal } from '../modals/AddTransactionModal';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { CustomerHistoryModal } from '../modals/CustomerHistoryModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import { Category, ClientPayment, ServiceOrder } from '../../types';

interface GlobalModalsProps {
  categories: Category[];
  clientPayments: ClientPayment[];
  serviceOrders: ServiceOrder[];
  onAddCustomer: (confirmed?: boolean) => void;
  onConfirmDeleteCustomer: () => void;
  onUnlockSettings: () => void;
  onAddTransaction: (e?: React.FormEvent, confirmed?: boolean) => void;
  onDeleteTransaction: () => void;
  onConfirmDeleteClientPayment: () => void;
  formatCurrency: (amount: number) => string;
}

export const GlobalModals: React.FC<GlobalModalsProps> = ({
  categories,
  clientPayments,
  serviceOrders,
  onAddCustomer,
  onConfirmDeleteCustomer,
  onUnlockSettings,
  onAddTransaction,
  onDeleteTransaction,
  onConfirmDeleteClientPayment,
  formatCurrency
}) => {
  const { 
    isAddingCustomer, setIsAddingCustomer,
    isAdding, setIsAdding
  } = useAppStore();

  const {
    confirmModal, closeConfirm,
    showPasswordModal, setShowPasswordModal,
    passwordInput, setPasswordInput,
    showWarningModal, setShowWarningModal,
    warningType,
    showCustomerWarningModal, setShowCustomerWarningModal,
    customerWarningType,
    editingTransaction, setEditingTransaction,
    transactionToDelete, setTransactionToDelete,
    editingCustomer, setEditingCustomer,
    customerToDelete, setCustomerToDelete,
    customerPaymentsWarning,
    clientPaymentToDelete, setClientPaymentToDelete,
    showHistoryModal, setShowHistoryModal,
    historyCustomer
  } = useModalStore();

  const {
    newCustomer, setNewCustomer,
    newTx, setNewTx
  } = useFormStore();

  const { settings, saveSettingsAPI: updateSettings } = useSettingsStore();

  return (
    <>
      <CustomerModal 
        isOpen={isAddingCustomer}
        onClose={() => {
          setIsAddingCustomer(false);
          setEditingCustomer(null);
        }}
        editingCustomer={editingCustomer}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        onSave={onAddCustomer}
      />

      <CustomerWarningModal 
        isOpen={showCustomerWarningModal}
        onClose={() => setShowCustomerWarningModal(false)}
        type={customerWarningType}
        onConfirm={() => onAddCustomer(true)}
      />

      <CustomerDeleteWarningModal 
        customer={customerToDelete}
        paymentsWarning={customerPaymentsWarning}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={onConfirmDeleteCustomer}
        onGoToPayments={() => {
          setCustomerToDelete(null);
          // Navigation is handled by the caller or by a redirect
        }}
        formatCurrency={formatCurrency}
      />

      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
        onUnlock={onUnlockSettings}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
      />

      <WarningModal 
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        type={warningType}
        onConfirm={() => onAddTransaction(undefined, true)}
        showWarnings={settings.showWarnings}
        setShowWarnings={(val: boolean) => updateSettings({ showWarnings: val })}
      />

      <AddTransactionModal 
        isOpen={isAdding}
        onClose={() => {
          setIsAdding(false);
          setEditingTransaction(null);
          setNewTx({
            description: '',
            category: '',
            type: 'expense',
            amount: '',
            date: format(new Date(), 'yyyy-MM-dd')
          });
        }}
        editingTransaction={editingTransaction}
        newTx={newTx}
        setNewTx={setNewTx}
        categories={categories}
        onSubmit={onAddTransaction}
      />

      <DeleteConfirmationModal 
        isOpen={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => {
          if (transactionToDelete !== null) {
            onDeleteTransaction();
            setTransactionToDelete(null);
          }
        }}
      />

      <DeleteConfirmationModal 
        isOpen={clientPaymentToDelete !== null}
        onClose={() => setClientPaymentToDelete(null)}
        onConfirm={onConfirmDeleteClientPayment}
        title="Excluir Venda/Pagamento"
        message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita e afetará o saldo do cliente."
      />

      <CustomerHistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        customer={historyCustomer}
        clientPayments={clientPayments}
        serviceOrders={serviceOrders}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </>
  );
};
