import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '../../store/useModalStore';
import { useAppStore } from '../../store/useAppStore';
import { useFormStore } from '../../store/useFormStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToast } from '../ui/Toast';
import { formatCurrency } from '../../lib/utils';

// Hooks
import { useCustomers } from '../../hooks/useCustomers';
import { useTransactions } from '../../hooks/useTransactions';
import { useClientPayments } from '../../hooks/useClientPayments';
import { useServiceOrders } from '../../hooks/useServiceOrders';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useAuth } from '../../hooks/useAuth';

// Modals
import { CustomerModal } from '../customers/modals/CustomerModal';
import { CustomerWarningModal } from '../customers/modals/CustomerWarningModal';
import { CustomerSuccessModal } from '../customers/modals/CustomerSuccessModal';
import { CustomerDeleteWarningModal } from '../customers/modals/CustomerDeleteWarningModal';
import { PasswordModal } from '../ui/modals/PasswordModal';
import { WarningModal } from '../ui/modals/WarningModal';
import { AddTransactionModal } from '../transactions/modals/AddTransactionModal';
import { DeleteConfirmationModal } from '../ui/modals/DeleteConfirmationModal';
import { CustomerHistoryModal } from '../customers/modals/CustomerHistoryModal';
import { ConfirmModal } from '../ui/modals/ConfirmModal';
import { DirectOsSearchModal } from '../service-orders/modals/DirectOsSearchModal';

export const GlobalModals: React.FC = () => {
  const navigate = useNavigate();
  const { settings, categories, saveSettingsAPI: updateSettings } = useSettingsStore();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  
  const {
    isAdding, setIsAdding,
    isAddingCustomer, setIsAddingCustomer,
    customerRegistrationSource,
    isSearchingOS, setIsSearchingOS,
    setDirectOsId, setDirectMode
  } = useAppStore();

  const {
    confirmModal, closeConfirm,
    showPasswordModal, setShowPasswordModal,
    passwordInput, setPasswordInput,
    showWarningModal, setShowWarningModal,
    warningType, setWarningType,
    showCustomerWarningModal, setShowCustomerWarningModal,
    customerWarningType, setCustomerWarningType,
    showCustomerSuccessModal, setShowCustomerSuccessModal,
    lastAddedCustomerId, setLastAddedCustomerId,
    editingTransaction, setEditingTransaction,
    transactionToDelete, setTransactionToDelete,
    editingCustomer, setEditingCustomer,
    customerToDelete, setCustomerToDelete,
    customerPaymentsWarning, setCustomerPaymentsWarning,
    clientPaymentToDelete, setClientPaymentToDelete,
    showHistoryModal, setShowHistoryModal,
    historyCustomer
  } = useModalStore();

  const {
    newCustomer, setNewCustomer,
    newTx, setNewTx
  } = useFormStore();

  // Hooks for API calls
  const { customers, saveCustomerAPI, deleteCustomerAPI, checkCustomerPaymentsAPI } = useCustomers();
  const { saveTransactionAPI, deleteTransactionAPI } = useTransactions(showToast);
  const { clientPayments, deleteClientPaymentAPI } = useClientPayments();
  const { serviceOrders } = useServiceOrders();
  const { fetchAuditLogs } = useAuditLogs();

  const handleAddCustomer = async (formData: any, force: boolean = false) => {
    // Validação de avisos
    if (!force && settings.showWarnings) {
      const hasSimilarCpf = customers.data.some((c: any) => c.cpf === formData.cpf && c.cpf !== '');
      const hasSimilarPhone = customers.data.some((c: any) => c.phone === formData.phone);

      if (hasSimilarCpf || hasSimilarPhone) {
        setNewCustomer(formData);
        setCustomerWarningType(hasSimilarCpf && hasSimilarPhone ? 'both' : hasSimilarCpf ? 'cpf' : 'phone');
        setShowCustomerWarningModal(true);
        return;
      }
    }

    try {
      const data = await saveCustomerAPI({
        ...formData,
        createdBy: !editingCustomer ? currentUser?.id : undefined,
        updatedBy: currentUser?.id
      }, editingCustomer?.id);
      
      setIsAddingCustomer(false);
      setShowCustomerWarningModal(false);
      setEditingCustomer(null);
      setLastAddedCustomerId(data.id);
      setShowCustomerSuccessModal(true);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to save customer", err);
    }
  };

  const confirmDeleteCustomerWithPayments = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomerAPI(customerToDelete.id);
      setCustomerToDelete(null);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  };

  const handleUnlockSettings = () => {
    if (passwordInput === settings.adminPassword) {
      setShowPasswordModal(false);
      setPasswordInput('');
      navigate('/configuracoes');
    } else {
      showToast('Senha incorreta!', 'error');
    }
  };

  const handleAddTransaction = async (formData: any, force: boolean = false) => {
    // Validação de avisos
    if (!force && settings.showWarnings) {
      const hasSimilar = false; // Implementar lógica se necessário
      if (hasSimilar) {
        setNewTx(formData);
        setWarningType('duplicate');
        setShowWarningModal(true);
        return;
      }
    }

    try {
      await saveTransactionAPI({
        ...formData,
        createdBy: !editingTransaction ? currentUser?.id : undefined,
        updatedBy: currentUser?.id
      }, editingTransaction?.id);
      
      showToast(editingTransaction ? 'Lançamento atualizado!' : 'Lançamento criado!', 'success');
      setIsAdding(false);
      setShowWarningModal(false);
      setEditingTransaction(null);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to save transaction", err);
      showToast('Erro ao salvar lançamento. Tente novamente.', 'error');
    }
  };

  const handleDeleteTransaction = async (tx: any) => {
    try {
      await deleteTransactionAPI(tx.id);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  };

  const confirmDeleteClientPayment = async () => {
    if (!clientPaymentToDelete) return;
    try {
      await deleteClientPaymentAPI(clientPaymentToDelete.id);
      setClientPaymentToDelete(null);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to delete client payment", err);
    }
  };

  return (
    <>
      {/* Global Customer Modals */}
      <CustomerModal 
        isOpen={isAddingCustomer}
        onClose={() => {
          setIsAddingCustomer(false);
          setEditingCustomer(null);
        }}
        editingCustomer={editingCustomer}
        onSave={(data) => handleAddCustomer(data)}
      />

      <CustomerWarningModal 
        isOpen={showCustomerWarningModal}
        onClose={() => setShowCustomerWarningModal(false)}
        type={customerWarningType}
        onConfirm={() => handleAddCustomer(newCustomer, true)}
      />

      <CustomerSuccessModal
        isOpen={showCustomerSuccessModal}
        onClose={() => setShowCustomerSuccessModal(false)}
        customerId={lastAddedCustomerId}
        source={customerRegistrationSource}
      />

      <CustomerDeleteWarningModal 
        customer={customerToDelete}
        paymentsWarning={customerPaymentsWarning}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={confirmDeleteCustomerWithPayments}
        onGoToPayments={() => {
          setCustomerToDelete(null);
          navigate('/vendas');
        }}
        formatCurrency={formatCurrency}
      />

      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
        onUnlock={handleUnlockSettings}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
      />

      <WarningModal 
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        type={warningType}
        onConfirm={() => handleAddTransaction(newTx, true)}
        showWarnings={settings.showWarnings}
        setShowWarnings={(val: boolean) => updateSettings({ ...settings, showWarnings: val })}
      />

      <AddTransactionModal 
        isOpen={isAdding}
        onClose={() => {
          setIsAdding(false);
          setEditingTransaction(null);
        }}
        editingTransaction={editingTransaction}
        categories={categories}
        onSubmit={(data) => handleAddTransaction(data)}
      />

      <DeleteConfirmationModal 
        isOpen={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => {
          if (transactionToDelete !== null) {
            handleDeleteTransaction(transactionToDelete);
            setTransactionToDelete(null);
          }
        }}
      />

      <DeleteConfirmationModal 
        isOpen={clientPaymentToDelete !== null}
        onClose={() => setClientPaymentToDelete(null)}
        onConfirm={confirmDeleteClientPayment}
        title="Excluir Venda/Pagamento"
        message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita e afetará o saldo do cliente."
      />

      <CustomerHistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        customer={historyCustomer}
        clientPayments={clientPayments.data}
        serviceOrders={serviceOrders.data}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      <DirectOsSearchModal 
        show={isSearchingOS}
        onClose={() => setIsSearchingOS(false)}
        orders={serviceOrders.data}
        handleEdit={(order) => {
          setDirectOsId(order.id);
          setDirectMode('edit');
          navigate('/ordens');
        }}
      />
    </>
  );
};
