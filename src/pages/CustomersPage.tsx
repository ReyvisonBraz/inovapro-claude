import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customers } from '../components/customers/Customers';
import { useCustomers } from '../hooks/useCustomers';
import { useClientPayments } from '../hooks/useClientPayments';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFilterStore } from '../store/useFilterStore';
import { useModalStore } from '../store/useModalStore';
import { useAppStore } from '../store/useAppStore';
import { useFormStore } from '../store/useFormStore';
import { useToast } from '../components/ui/Toast';
import { useDebounce } from '../hooks/useDebounce';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings } = useSettingsStore();
  const { customerSearchTerm, setCustomerSearchTerm } = useFilterStore();
  const [localSearchTerm, setLocalSearchTerm] = useState(customerSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  
  const { 
    customers, 
    customersPage,
    setCustomersPage,
    deleteCustomerAPI,
    isLoading,
    isError
  } = useCustomers();

  // Update global search term when debounced local term changes
  useEffect(() => {
    setCustomerSearchTerm(debouncedSearchTerm);
    setCustomersPage(1); // Reset to first page on search
  }, [debouncedSearchTerm, setCustomerSearchTerm, setCustomersPage]);

  const { clientPayments } = useClientPayments();
  const { 
    setHistoryCustomer, 
    setShowHistoryModal,
    setCustomerToDelete,
    setEditingCustomer
  } = useModalStore();
  const { 
    setIsAddingClientPayment,
    setIsAddingCustomer
  } = useAppStore();
  const { 
    setNewClientPayment,
    setNewCustomer
  } = useFormStore();

  return (
    <Customers 
      settings={settings}
      searchTerm={localSearchTerm}
      onSearchChange={setLocalSearchTerm}
      customers={customers}
      clientPayments={clientPayments}
      isLoading={isLoading}
      onDelete={(id) => {
        const customer = customers.data.find(c => c.id === id);
        if (customer) setCustomerToDelete(customer);
      }}
      onAddPayment={(customer) => {
        setNewClientPayment({ customerId: customer.id });
        setIsAddingClientPayment(true);
        navigate('/vendas');
      }}
      onViewHistory={(customer) => {
        setHistoryCustomer(customer);
        setShowHistoryModal(true);
      }}
      onEdit={(customer) => {
        setEditingCustomer(customer);
        setNewCustomer({
          firstName: customer.firstName,
          lastName: customer.lastName,
          nickname: customer.nickname || '',
          cpf: customer.cpf || '',
          companyName: customer.companyName || '',
          phone: customer.phone,
          observation: customer.observation || '',
          creditLimit: customer.creditLimit?.toString() || ''
        });
        setIsAddingCustomer(true);
      }}
      onPageChange={setCustomersPage}
    />
  );
};

export default CustomersPage;
