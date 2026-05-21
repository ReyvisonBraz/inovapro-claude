import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Transaction } from '../types';
import { useFilterStore } from '../store/useFilterStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAuthStore } from '../store/useAuthStore';
import { format, endOfMonth, parseISO } from 'date-fns';
import { useCrudApi } from './useCrudApi';

export function useTransactions(showToast: (message: string, type: 'success' | 'error') => void) {
  const { isAuthenticated } = useAuthStore();
  const { transactionsPage, setTransactionsPage } = useTransactionStore();
  const { 
    searchTerm, filterType, filterCategory,
    dateFilterMode, selectedDate, selectedMonth, startDate, endDate,
    filterMinAmount, filterMaxAmount
  } = useFilterStore();

  // Query para buscar transações
  const { data: transactionsData, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'transactions', 
      transactionsPage, 
      searchTerm, 
      filterType, 
      filterCategory, 
      dateFilterMode, 
      selectedDate, 
      selectedMonth, 
      startDate, 
      endDate, 
      filterMinAmount, 
      filterMaxAmount
    ],
    staleTime: 30_000,
    enabled: isAuthenticated,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: transactionsPage.toString(),
        limit: '20',
        search: searchTerm,
      });

      if (filterType !== 'all') params.set('type', filterType);
      if (filterCategory !== 'all') params.set('category', filterCategory);

      if (dateFilterMode === 'day') {
        params.set('startDate', selectedDate);
        params.set('endDate', selectedDate);
      } else if (dateFilterMode === 'month') {
        const start = `${selectedMonth}-01`;
        const end = format(endOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd');
        params.set('startDate', start);
        params.set('endDate', end);
      } else if (dateFilterMode === 'range') {
        params.set('startDate', startDate);
        params.set('endDate', endDate);
      }

      if (filterMinAmount) params.set('minAmount', filterMinAmount);
      if (filterMaxAmount) params.set('maxAmount', filterMaxAmount);

      const { data } = await api.get(`/transactions?${params.toString()}`);
      return data;
    },
  });

  const { saveMutation, deleteMutation } = useCrudApi({
    baseKey: 'transactions',
    endpoint: '/transactions',
    saveSuccessMessage: 'Transação salva com sucesso!',
    deleteSuccessMessage: 'Transação excluída com sucesso!',
    extraInvalidations: [['dashboard-stats']],
    showToast,
  });

  const handleDuplicateTransaction = async (tx: Transaction) => {
    try {
      await saveMutation.mutateAsync({
        item: {
          description: `${tx.description} (Cópia)`,
          category: tx.category,
          type: tx.type,
          amount: tx.amount,
          date: new Date().toISOString().split('T')[0],
        }
      });
    } catch {
      showToast('Erro ao duplicar transação.', 'error');
    }
  };

  return {
    transactions: transactionsData || { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } },
    transactionsPage,
    setTransactionsPage,
    fetchTransactions: refetch,
    saveTransactionAPI: (transaction: Partial<Transaction>, id?: number) => saveMutation.mutateAsync({ item: transaction, id }),
    deleteTransactionAPI: (id: number) => deleteMutation.mutateAsync(id),
    handleDuplicateTransaction,
    filteredTransactions: transactionsData?.data || [],
    isLoading,
    isError
  };
}
