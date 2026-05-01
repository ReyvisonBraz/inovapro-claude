import { create } from 'zustand';
import { format } from 'date-fns';

interface NewTxForm {
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: string;
  date: string;
}

interface NewCustomerForm {
  firstName: string;
  lastName: string;
  nickname: string;
  cpf: string;
  companyName: string;
  phone: string;
  observation: string;
  creditLimit: string;
}

interface NewClientPaymentForm {
  customerId: number;
  description: string;
  totalAmount: string;
  paidAmount: string;
  purchaseDate: string;
  dueDate: string;
  paymentMethod: string;
  status?: 'pending' | 'partial' | 'paid';
  installmentsCount: number;
  installmentInterval: 'monthly' | 'weekly' | 'biweekly' | 'daily';
  type: 'income' | 'expense';
}

interface NewServiceOrderForm {
  [key: string]: unknown;
}

interface FormState {
  newTx: NewTxForm;
  setNewTx: (tx: Partial<NewTxForm>) => void;

  newCustomer: NewCustomerForm;
  setNewCustomer: (customer: Partial<NewCustomerForm>) => void;

  newClientPayment: NewClientPaymentForm;
  setNewClientPayment: (payment: Partial<NewClientPaymentForm>) => void;

  newServiceOrder: NewServiceOrderForm | null;
  setNewServiceOrder: (order: NewServiceOrderForm | null) => void;
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
