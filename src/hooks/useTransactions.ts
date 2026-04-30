import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Transaction } from '../types';
import { useFilterStore } from '../store/useFilterStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAuthStore } from '../store/useAuthStore';
import { format, endOfMonth, parseISO } from 'date-fns';

export function useTransactions(showToast: (message: string, type: 'success' | 'error') => void) {
  const queryClient = useQueryClient();
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
    staleTime: 0,
    refetchOnMount: true,
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

  // Mutação para salvar/editar transação
  const saveMutation = useMutation({
    mutationFn: async ({ transaction, id }: { transaction: Partial<Transaction>; id?: number }) => {
      if (id) {
        const { data } = await api.put(`/transactions/${id}`, transaction);
        return data;
      } else {
        const { data } = await api.post('/transactions', transaction);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Transação salva com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save transaction', error);
      showToast(error.response?.data?.error || 'Erro ao salvar transação.', 'error');
    },
  });

  // Mutação para excluir transação
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Transação excluída com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete transaction', error);
      showToast(error.response?.data?.error || 'Erro ao excluir transação.', 'error');
    },
  });

  const handleDuplicateTransaction = async (tx: Transaction) => {
    try {
      await saveMutation.mutateAsync({
        transaction: {
          description: `${tx.description} (Cópia)`,
          category: tx.category,
          type: tx.type,
          amount: tx.amount,
          date: new Date().toISOString().split('T')[0],
        }
      });
    } catch (err) {
      console.error("Failed to duplicate", err);
    }
  };

  return {
    transactions: transactionsData || { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } },
    transactionsPage,
    setTransactionsPage,
    fetchTransactions: refetch,
    saveTransactionAPI: (transaction: Partial<Transaction>, id?: number) => saveMutation.mutateAsync({ transaction, id }),
    deleteTransactionAPI: (id: number) => deleteMutation.mutateAsync(id),
    handleDuplicateTransaction,
    filteredTransactions: transactionsData?.data || [],
    isLoading,
    isError
  };
}
