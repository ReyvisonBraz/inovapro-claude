import { useState, useCallback } from 'react';
import { Customer, ClientPayment } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const { showToast } = useToast();

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await api.get('/api/customers');
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
      showToast("Erro ao carregar clientes.", "error");
    }
  }, [showToast]);

  const fetchClientPayments = useCallback(async () => {
    try {
      const data = await api.get('/api/client-payments');
      setClientPayments(data);
    } catch (err) {
      console.error("Failed to fetch client payments", err);
      showToast("Erro ao carregar pagamentos de clientes.", "error");
    }
  }, [showToast]);

  const addCustomer = useCallback(async (customer: any) => {
    try {
      const data = await api.post('/api/customers', customer);
      fetchCustomers();
      return data;
    } catch (err) {
      console.error("Failed to add customer", err);
      showToast("Erro ao adicionar cliente.", "error");
      throw err;
    }
  }, [fetchCustomers, showToast]);

  const updateCustomer = useCallback(async (id: number, customer: any) => {
    try {
      await api.put(`/api/customers/${id}`, customer);
      fetchCustomers();
      return true;
    } catch (err) {
      console.error("Failed to update customer", err);
      showToast("Erro ao atualizar cliente.", "error");
      return false;
    }
  }, [fetchCustomers, showToast]);

  const deleteCustomer = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/customers/${id}`);
      fetchCustomers();
      fetchClientPayments();
      return true;
    } catch (err) {
      console.error("Failed to delete customer", err);
      showToast("Erro ao excluir cliente.", "error");
      return false;
    }
  }, [fetchCustomers, fetchClientPayments, showToast]);

  const addClientPayment = useCallback(async (payment: any) => {
    try {
      await api.post('/api/client-payments', payment);
      fetchClientPayments();
      return true;
    } catch (err) {
      console.error("Failed to add client payment", err);
      showToast("Erro ao adicionar pagamento de cliente.", "error");
      return false;
    }
  }, [fetchClientPayments, showToast]);

  const updateClientPayment = useCallback(async (id: number, payment: any) => {
    try {
      await api.patch(`/api/client-payments/${id}`, payment);
      fetchClientPayments();
      return true;
    } catch (err) {
      console.error("Failed to update client payment", err);
      showToast("Erro ao atualizar pagamento de cliente.", "error");
      return false;
    }
  }, [fetchClientPayments, showToast]);

  const deleteClientPayment = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/client-payments/${id}`);
      fetchClientPayments();
      return true;
    } catch (err) {
      console.error("Failed to delete client payment", err);
      showToast("Erro ao excluir pagamento de cliente.", "error");
      return false;
    }
  }, [fetchClientPayments, showToast]);

  return { 
    customers, 
    clientPayments, 
    fetchCustomers, 
    fetchClientPayments,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addClientPayment,
    updateClientPayment,
    deleteClientPayment
  };
};
