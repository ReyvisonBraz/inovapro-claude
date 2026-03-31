import { useState, useCallback } from 'react';
import { ClientPayment } from '../types';

export function useClientPayments(showToast: (message: string, type: 'success' | 'error') => void) {
  const [clientPayments, setClientPayments] = useState<{ data: ClientPayment[], meta: any }>({ 
    data: [], 
    meta: { total: 0, page: 1, limit: 20, totalPages: 0 } 
  });
  const [paymentsPage, setPaymentsPage] = useState(1);

  const fetchClientPayments = useCallback(async (page: number, searchTerm: string = '') => {
    try {
      const res = await fetch(`/api/client-payments?page=${page}&limit=20&search=${searchTerm}`);
      if (!res.ok) throw new Error('Failed to fetch client payments');
      const data = await res.json();
      setClientPayments(data);
    } catch (err) {
      console.error("Failed to fetch client payments", err);
      showToast('Erro ao carregar pagamentos.', 'error');
    }
  }, [showToast]);

  const saveClientPaymentAPI = useCallback(async (payment: Partial<ClientPayment>, id?: number) => {
    const url = id ? `/api/client-payments/${id}` : '/api/client-payments';
    const method = id ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to save client payment');
    }
    
    return await res.json();
  }, []);

  const deleteClientPaymentAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/client-payments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete client payment');
  }, []);

  const recordPaymentAPI = useCallback(async (id: number, amount: number, date: string, updatedBy?: number) => {
    const res = await fetch(`/api/client-payments/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, date, updatedBy })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to record payment');
    }
    
    return await res.json();
  }, []);

  return {
    clientPayments,
    paymentsPage,
    setPaymentsPage,
    fetchClientPayments,
    saveClientPaymentAPI,
    deleteClientPaymentAPI,
    recordPaymentAPI
  };
}
