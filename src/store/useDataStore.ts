import { create } from 'zustand';

interface DataState {
  transactionsPage: number;
  setTransactionsPage: (page: number) => void;

  customersPage: number;
  setCustomersPage: (page: number) => void;

  clientPaymentsPage: number;
  setClientPaymentsPage: (page: number) => void;

  serviceOrdersPage: number;
  setServiceOrdersPage: (page: number) => void;
}

export const useDataStore = create<DataState>((set) => ({
  transactionsPage: 1,
  setTransactionsPage: (transactionsPage) => set({ transactionsPage }),

  customersPage: 1,
  setCustomersPage: (customersPage) => set({ customersPage }),

  clientPaymentsPage: 1,
  setClientPaymentsPage: (clientPaymentsPage) => set({ clientPaymentsPage }),

  serviceOrdersPage: 1,
  setServiceOrdersPage: (serviceOrdersPage) => set({ serviceOrdersPage }),
}));
