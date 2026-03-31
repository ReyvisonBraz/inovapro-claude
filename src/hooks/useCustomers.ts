import { useState, useCallback } from 'react';
import { Customer } from '../types';
import { useToast } from '../components/ui/Toast';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<{ data: Customer[], meta: any }>({ 
    data: [], 
    meta: { total: 0, page: 1, limit: 20, totalPages: 0 } 
  });
  const [customersPage, setCustomersPage] = useState(1);
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
  const { showToast } = useToast();

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers?page=${customersPage}&limit=20&search=${customerSearchTerm}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
      showToast('Erro ao carregar clientes.', 'error');
    }
  }, [customersPage, customerSearchTerm, showToast]);

  const saveCustomerAPI = useCallback(async (customer: Partial<Customer>, id?: number) => {
    const url = id ? `/api/customers/${id}` : '/api/customers';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("API Error:", errorData);
      throw new Error(errorData?.error || 'Failed to save customer');
    }
    
    return await res.json();
  }, []);

  const deleteCustomerAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete customer');
  }, []);

  const checkCustomerPaymentsAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/customers/${id}/payments`);
    if (!res.ok) throw new Error('Failed to fetch customer payments');
    return await res.json();
  }, []);

  return { 
    customers, 
    customersPage,
    setCustomersPage,
    customerSearchTerm,
    setCustomerSearchTerm,
    fetchCustomers, 
    saveCustomerAPI,
    deleteCustomerAPI,
    checkCustomerPaymentsAPI
  };
};
