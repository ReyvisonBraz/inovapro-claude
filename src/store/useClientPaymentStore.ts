import { create } from 'zustand';
import { ClientPayment } from '../types';

interface ClientPaymentState {
  clientPayments: { data: ClientPayment[], meta: any };
  paymentsPage: number;
  setClientPayments: (payments: { data: ClientPayment[], meta: any }) => void;
  setPaymentsPage: (page: number) => void;
}

export const useClientPaymentStore = create<ClientPaymentState>((set) => ({
  clientPayments: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
  paymentsPage: 1,
  setClientPayments: (clientPayments) => set({ clientPayments }),
  setPaymentsPage: (paymentsPage) => set({ paymentsPage }),
}));
