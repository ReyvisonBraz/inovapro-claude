import { create } from 'zustand';
import { Customer } from '../types';

interface CustomerState {
  customers: { data: Customer[], meta: any };
  customersPage: number;
  setCustomers: (customers: { data: Customer[], meta: any }) => void;
  setCustomersPage: (page: number) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
  customersPage: 1,
  setCustomers: (customers) => set({ customers }),
  setCustomersPage: (customersPage) => set({ customersPage }),
}));
