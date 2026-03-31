import { useState, useCallback, useMemo } from 'react';
import { Transaction } from '../types';
import { useFilterStore } from '../store/useFilterStore';

export function useTransactions(showToast: (message: string, type: 'success' | 'error') => void) {
  const [transactions, setTransactions] = useState<{ data: Transaction[], meta: any }>({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { searchTerm, filterType, filterCategory } = useFilterStore();

  const fetchTransactions = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions?page=${page}&limit=20&search=${search}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      showToast('Erro ao carregar transações.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const saveTransactionAPI = useCallback(async (transaction: Partial<Transaction>, id?: number) => {
    const url = id ? `/api/transactions/${id}` : '/api/transactions';
    const method = id ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to save transaction');
    }
    
    return await res.json();
  }, []);

  const deleteTransactionAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete transaction');
  }, []);

  const handleDuplicateTransaction = useCallback(async (tx: Transaction) => {
    try {
      await saveTransactionAPI({
        description: `${tx.description} (Cópia)`,
        category: tx.category,
        type: tx.type,
        amount: tx.amount,
        date: new Date().toISOString().split('T')[0],
      });
      fetchTransactions(transactionsPage, searchTerm);
      showToast('Transação duplicada com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to duplicate", err);
      showToast('Erro ao duplicar transação.', 'error');
    }
  }, [saveTransactionAPI, fetchTransactions, transactionsPage, searchTerm, showToast]);

  const filteredTransactions = useMemo(() => {
    return transactions.data.filter(t => {
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesType && matchesCategory;
    });
  }, [transactions.data, filterType, filterCategory]);

  return {
    transactions,
    transactionsPage,
    setTransactionsPage,
    fetchTransactions,
    saveTransactionAPI,
    deleteTransactionAPI,
    handleDuplicateTransaction,
    filteredTransactions,
    isLoading
  };
}
