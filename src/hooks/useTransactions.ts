import { useState, useCallback } from 'react';
import { Transaction, Category, AuditLog } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const { showToast } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await api.get('/api/transactions');
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      showToast("Erro ao carregar transações.", "error");
    }
  }, [showToast]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      showToast("Erro ao carregar categorias.", "error");
    }
  }, [showToast]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const data = await api.get('/api/audit-logs');
      setAuditLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
      showToast("Erro ao carregar logs de auditoria.", "error");
    }
  }, [showToast]);

  const addTransaction = useCallback(async (tx: any) => {
    try {
      await api.post('/api/transactions', tx);
      fetchTransactions();
      fetchAuditLogs();
      return true;
    } catch (err) {
      console.error("Failed to add transaction", err);
      showToast("Erro ao adicionar transação.", "error");
      return false;
    }
  }, [fetchTransactions, fetchAuditLogs, showToast]);

  const updateTransaction = useCallback(async (id: number, tx: any) => {
    try {
      await api.put(`/api/transactions/${id}`, tx);
      fetchTransactions();
      fetchAuditLogs();
      return true;
    } catch (err) {
      console.error("Failed to update transaction", err);
      showToast("Erro ao atualizar transação.", "error");
      return false;
    }
  }, [fetchTransactions, fetchAuditLogs, showToast]);

  const deleteTransaction = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      fetchTransactions();
      fetchAuditLogs();
      return true;
    } catch (err) {
      console.error("Failed to delete transaction", err);
      showToast("Erro ao excluir transação.", "error");
      return false;
    }
  }, [fetchTransactions, fetchAuditLogs, showToast]);

  const addCategory = useCallback(async (name: string, type: 'income' | 'expense') => {
    try {
      await api.post('/api/categories', { name, type });
      fetchCategories();
      return true;
    } catch (err) {
      console.error("Failed to add category", err);
      showToast("Erro ao adicionar categoria.", "error");
      return false;
    }
  }, [fetchCategories, showToast]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
      return true;
    } catch (err) {
      console.error("Failed to delete category", err);
      showToast("Erro ao excluir categoria.", "error");
      return false;
    }
  }, [fetchCategories, showToast]);

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
