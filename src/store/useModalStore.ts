import { create } from 'zustand';
import { Transaction, Customer, ClientPayment } from '../types';

interface ModalState {
  // Confirmation Modal
  confirmModal: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  };
  openConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  closeConfirm: () => void;

  // Password Modal
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  isSettingsUnlocked: boolean;
  setIsSettingsUnlocked: (unlocked: boolean) => void;
  passwordInput: string;
  setPasswordInput: (input: string) => void;

  // Warning Modals
  showWarningModal: boolean;
  setShowWarningModal: (show: boolean) => void;
  warningType: 'category' | 'description' | 'both';
  setWarningType: (type: 'category' | 'description' | 'both') => void;

  showCustomerWarningModal: boolean;
  setShowCustomerWarningModal: (show: boolean) => void;
  customerWarningType: 'cpf' | 'phone' | 'both';
  setCustomerWarningType: (type: 'cpf' | 'phone' | 'both') => void;

  showCustomerSuccessModal: boolean;
  setShowCustomerSuccessModal: (show: boolean) => void;
  lastAddedCustomerId: number | null;
  setLastAddedCustomerId: (id: number | null) => void;

  // Transaction Modals
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  transactionToDelete: number | null;
  setTransactionToDelete: (id: number | null) => void;

  // Customer Modals
  editingCustomer: Customer | null;
  setEditingCustomer: (customer: Customer | null) => void;
  customerToDelete: Customer | null;
  setCustomerToDelete: (customer: Customer | null) => void;
  customerPaymentsWarning: any[];
  setCustomerPaymentsWarning: (warnings: any[]) => void;

  // Client Payment Modals
  clientPaymentToDelete: number | null;
  setClientPaymentToDelete: (id: number | null) => void;
  isRecordingPayment: ClientPayment | null;
  setIsRecordingPayment: (payment: ClientPayment | null) => void;
  paymentAmount: string;
  setPaymentAmount: (amount: string) => void;
  paymentDate: string;
  setPaymentDate: (date: string) => void;
  showHistoryModal: boolean;
  setShowHistoryModal: (show: boolean) => void;
  historyCustomer: Customer | null;
  setHistoryCustomer: (customer: Customer | null) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  },
  openConfirm: (title, message, onConfirm, type = 'warning') => set({
    confirmModal: { isOpen: true, title, message, onConfirm, type }
  }),
  closeConfirm: () => set((state) => ({
    confirmModal: { ...state.confirmModal, isOpen: false }
  })),

  showPasswordModal: false,
  setShowPasswordModal: (show) => set({ showPasswordModal: show }),
  isSettingsUnlocked: false,
  setIsSettingsUnlocked: (unlocked) => set({ isSettingsUnlocked: unlocked }),
  passwordInput: '',
  setPasswordInput: (input) => set({ passwordInput: input }),

  showWarningModal: false,
  setShowWarningModal: (show) => set({ showWarningModal: show }),
  warningType: 'both',
  setWarningType: (type) => set({ warningType: type }),

  showCustomerWarningModal: false,
  setShowCustomerWarningModal: (show) => set({ showCustomerWarningModal: show }),
  customerWarningType: 'both',
  setCustomerWarningType: (type) => set({ customerWarningType: type }),

  showCustomerSuccessModal: false,
  setShowCustomerSuccessModal: (show) => set({ showCustomerSuccessModal: show }),
  lastAddedCustomerId: null,
  setLastAddedCustomerId: (id) => set({ lastAddedCustomerId: id }),

  editingTransaction: null,
  setEditingTransaction: (tx) => set({ editingTransaction: tx }),
  transactionToDelete: null,
  setTransactionToDelete: (id) => set({ transactionToDelete: id }),

  editingCustomer: null,
  setEditingCustomer: (customer) => set({ editingCustomer: customer }),
  customerToDelete: null,
  setCustomerToDelete: (customer) => set({ customerToDelete: customer }),
  customerPaymentsWarning: [],
  setCustomerPaymentsWarning: (warnings) => set({ customerPaymentsWarning: warnings }),

  clientPaymentToDelete: null,
  setClientPaymentToDelete: (id) => set({ clientPaymentToDelete: id }),
  isRecordingPayment: null,
  setIsRecordingPayment: (payment) => set({ isRecordingPayment: payment }),
  paymentAmount: '',
  setPaymentAmount: (amount) => set({ paymentAmount: amount }),
  paymentDate: '',
  setPaymentDate: (date) => set({ paymentDate: date }),
  showHistoryModal: false,
  setShowHistoryModal: (show) => set({ showHistoryModal: show }),
  historyCustomer: null,
  setHistoryCustomer: (customer) => set({ historyCustomer: customer }),
}));
