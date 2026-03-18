import { useState, useCallback } from 'react';
import { Transaction, Category, AuditLog } from '../types';
import { api } from '../services/api';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await api.get('/api/transactions');
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const data = await api.get('/api/audit-logs');
      setAuditLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  }, []);

  const addTransaction = useCallback(async (tx: any) => {
    try {
      await api.post('/api/transactions', tx);
      fetchTransactions();
      fetchAuditLogs();
      return true;
    } catch (err) {
      console.error("Failed to add transaction", err);
      return false;
    }
  }, [fetchTransactions, fetchAuditLogs]);

  const updateTransaction = useCallback(async (id: number, tx: any) => {
    try {
      await api.put(`/api/transactions/${id}`, tx);
      fetchTransactions();
      fetchAuditLogs();
      return true;
    } catch (err) {
      console.error("Failed to update transaction", err);
      return false;
    }
  }, [fetchTransactions, fetchAuditLogs]);

  const deleteTransaction = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      fetchTransactions();
      fetchAuditLogs();
      return true;
    } catch (err) {
      console.error("Failed to delete transaction", err);
      return false;
    }
  }, [fetchTransactions, fetchAuditLogs]);

  const addCategory = useCallback(async (name: string, type: 'income' | 'expense') => {
    try {
      await api.post('/api/categories', { name, type });
      fetchCategories();
      return true;
    } catch (err) {
      console.error("Failed to add category", err);
      return false;
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
      return true;
    } catch (err) {
      console.error("Failed to delete category", err);
      return false;
    }
  }, [fetchCategories]);

  return { 
    transactions, 
    categories, 
    auditLogs, 
    fetchTransactions, 
    fetchCategories, 
    fetchAuditLogs,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory
  };
};
