import { create } from 'zustand';
import { Transaction } from '../types';

interface TransactionState {
  transactions: { data: Transaction[], meta: any };
  transactionsPage: number;
  setTransactions: (transactions: { data: Transaction[], meta: any }) => void;
  setTransactionsPage: (page: number) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
  transactionsPage: 1,
  setTransactions: (transactions) => set({ transactions }),
  setTransactionsPage: (transactionsPage) => set({ transactionsPage }),
}));
