import React from 'react';
import { Plus, Printer } from 'lucide-react';
import { CustomerList } from './customers/CustomerList';
import { Customer, ClientPayment, AppSettings } from '../types';

import { useSettingsStore } from '../store/useSettingsStore';
import { useFilterStore } from '../store/useFilterStore';
import { useModalStore } from '../store/useModalStore';
import { useAppStore } from '../store/useAppStore';
import { useFormStore } from '../store/useFormStore';

interface CustomersProps {
  customers: { data: Customer[], meta: any };
  clientPayments: { data: ClientPayment[], meta: any };
  onDelete: (id: number) => void;
  onAddPayment: (customer: Customer) => void;
  onViewHistory: (customer: Customer) => void;
  onPageChange: (page: number) => void;
}

export const Customers = ({
  customers,
  clientPayments,
  onDelete,
  onAddPayment,
  onViewHistory,
  onPageChange
}: CustomersProps) => {
  const { settings } = useSettingsStore();
  const { customerSearchTerm, setCustomerSearchTerm } = useFilterStore();
  const { setEditingCustomer } = useModalStore();
  const { setIsAddingCustomer } = useAppStore();
  const { setNewCustomer } = useFormStore();
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Gestão de Clientes</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Cadastre e gerencie seus clientes para cobranças rápidas</p>
        </div>
      </div>

      <CustomerList 
        settings={settings}
        customers={customers.data}
        clientPayments={clientPayments.data}
        searchTerm={customerSearchTerm}
        setSearchTerm={setCustomerSearchTerm}
        pagination={{
          currentPage: customers.meta.page,
          totalPages: customers.meta.totalPages,
          totalItems: customers.meta.total,
          limit: customers.meta.limit
        }}
        onPageChange={onPageChange}
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
        onDelete={onDelete}
        onAddPayment={onAddPayment}
        onViewHistory={onViewHistory}
      />
    </div>
  );
};
