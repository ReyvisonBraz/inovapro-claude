import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Customers } from '../components/Customers';
import { useCustomers } from '../hooks/useCustomers';
import { useClientPayments } from '../hooks/useClientPayments';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFilterStore } from '../store/useFilterStore';
import { useModalStore } from '../store/useModalStore';
import { useAppStore } from '../store/useAppStore';
import { useFormStore } from '../store/useFormStore';
import { useToast } from '../components/ui/Toast';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings } = useSettingsStore();
  const { customerSearchTerm, setCustomerSearchTerm } = useFilterStore();
  const { 
    customers, 
    deleteCustomerAPI 
  } = useCustomers();
  const { clientPayments } = useClientPayments(showToast);
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
      searchTerm={customerSearchTerm}
      onSearchChange={setCustomerSearchTerm}
      customers={customers}
      clientPayments={clientPayments}
      onDelete={(id) => {
        const customer = customers.data.find(c => c.id === id);
        if (customer) setCustomerToDelete(customer);
      }}
      onAddPayment={(customer) => {
        setNewClientPayment({ customerId: customer.id });
        setIsAddingClientPayment(true);
        navigate('/client-payments');
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
      onPageChange={() => {}} // TODO: Implement pagination in useCustomers
    />
  );
};

export default CustomersPage;
