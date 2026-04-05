import { create } from 'zustand';
import { format } from 'date-fns';

interface FormState {
  newTx: {
    description: string;
    category: string;
    type: 'income' | 'expense';
    amount: string;
    date: string;
  };
  setNewTx: (tx: any) => void;

  newCustomer: {
    firstName: string;
    lastName: string;
    nickname: string;
    cpf: string;
    companyName: string;
    phone: string;
    observation: string;
    creditLimit: string;
  };
  setNewCustomer: (customer: any) => void;

  newClientPayment: {
    customerId: number;
    description: string;
    totalAmount: string;
    paidAmount: string;
    purchaseDate: string;
    dueDate: string;
    paymentMethod: string;
    installmentsCount: number;
    installmentInterval: 'monthly' | 'weekly' | 'biweekly' | 'daily';
    type: 'income' | 'expense';
  };
  setNewClientPayment: (payment: any) => void;

  newServiceOrder: any;
  setNewServiceOrder: (order: any) => void;
}

export const useFormStore = create<FormState>((set) => ({
  newTx: {
    description: '',
    category: '',
    type: 'expense',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd')
  },
  setNewTx: (tx) => set((state) => ({ newTx: { ...state.newTx, ...tx } })),

  newCustomer: {
    firstName: '',
    lastName: '',
    nickname: '',
    cpf: '',
    companyName: '',
    phone: '+55',
    observation: '',
    creditLimit: ''
  },
  setNewCustomer: (customer) => set((state) => ({ newCustomer: { ...state.newCustomer, ...customer } })),

  newClientPayment: {
    customerId: 0,
    description: '',
    totalAmount: '',
    paidAmount: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'Dinheiro',
    installmentsCount: 1,
    installmentInterval: 'monthly',
    type: 'income'
  },
  setNewClientPayment: (payment) => set((state) => ({ newClientPayment: { ...state.newClientPayment, ...payment } })),

  newServiceOrder: null,
  setNewServiceOrder: (order) => set({ newServiceOrder: order }),
}));
