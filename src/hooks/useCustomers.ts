import { useState, useCallback } from 'react';
import { Customer, ClientPayment } from '../types';
import { api } from '../services/api';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await api.get('/api/customers');
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  }, []);

  const fetchClientPayments = useCallback(async () => {
    try {
      const data = await api.get('/api/client-payments');
      setClientPayments(data);
    } catch (err) {
      console.error("Failed to fetch client payments", err);
    }
  }, []);

  const addCustomer = useCallback(async (customer: any) => {
    try {
      const data = await api.post('/api/customers', customer);
      fetchCustomers();
      return data;
    } catch (err) {
      console.error("Failed to add customer", err);
      throw err;
    }
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id: number, customer: any) => {
    try {
      await api.put(`/api/customers/${id}`, customer);
      fetchCustomers();
      return true;
    } catch (err) {
      console.error("Failed to update customer", err);
      return false;
    }
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/customers/${id}`);
      fetchCustomers();
      fetchClientPayments();
      return true;
    } catch (err) {
      console.error("Failed to delete customer", err);
      return false;
    }
  }, [fetchCustomers, fetchClientPayments]);

  const addClientPayment = useCallback(async (payment: any) => {
    try {
      await api.post('/api/client-payments', payment);
      fetchClientPayments();
      return true;
    } catch (err) {
      console.error("Failed to add client payment", err);
      return false;
    }
  }, [fetchClientPayments]);

  const updateClientPayment = useCallback(async (id: number, payment: any) => {
    try {
      await api.patch(`/api/client-payments/${id}`, payment);
      fetchClientPayments();
      return true;
    } catch (err) {
      console.error("Failed to update client payment", err);
      return false;
    }
  }, [fetchClientPayments]);

  const deleteClientPayment = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/client-payments/${id}`);
      fetchClientPayments();
      return true;
    } catch (err) {
      console.error("Failed to delete client payment", err);
      return false;
    }
  }, [fetchClientPayments]);

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
