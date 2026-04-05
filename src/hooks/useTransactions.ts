import { useState, useCallback, useMemo } from 'react';
import { Transaction } from '../types';
import { useFilterStore } from '../store/useFilterStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { format, endOfMonth, parseISO } from 'date-fns';

export function useTransactions(showToast: (message: string, type: 'success' | 'error') => void) {
  const { 
    transactions, setTransactions, 
    transactionsPage, setTransactionsPage 
  } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    searchTerm, filterType, filterCategory,
    dateFilterMode, selectedDate, selectedMonth, startDate, endDate,
    filterMinAmount, filterMaxAmount
  } = useFilterStore();

  const fetchTransactions = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      let url = `/api/transactions?page=${page}&limit=20&search=${encodeURIComponent(search)}`;
      
      if (filterType !== 'all') url += `&type=${filterType}`;
      if (filterCategory !== 'all') url += `&category=${encodeURIComponent(filterCategory)}`;
      
      if (dateFilterMode === 'day') {
        url += `&startDate=${selectedDate}&endDate=${selectedDate}`;
      } else if (dateFilterMode === 'month') {
        const start = `${selectedMonth}-01`;
        const end = format(endOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd');
        url += `&startDate=${start}&endDate=${end}`;
      } else if (dateFilterMode === 'range') {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      if (filterMinAmount) url += `&minAmount=${filterMinAmount}`;
      if (filterMaxAmount) url += `&maxAmount=${filterMaxAmount}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      showToast('Erro ao carregar transações.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [
    showToast, setTransactions, filterType, filterCategory, 
    dateFilterMode, selectedDate, selectedMonth, startDate, endDate, 
    filterMinAmount, filterMaxAmount
  ]);

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
    return transactions.data;
  }, [transactions.data]);

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
