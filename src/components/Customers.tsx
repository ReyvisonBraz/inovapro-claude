import React from 'react';
import { Plus, Printer } from 'lucide-react';
import { CustomerList } from './customers/CustomerList';
import { Customer, ClientPayment, AppSettings } from '../types';

interface CustomersProps {
  settings: AppSettings;
  customers: { data: Customer[], meta: any };
  clientPayments: { data: ClientPayment[], meta: any };
  setEditingCustomer: (customer: Customer | null) => void;
  setNewCustomer: (customer: any) => void;
  setIsAddingCustomer: (isAdding: boolean) => void;
  onDelete: (id: number) => void;
  onAddPayment: (customer: Customer) => void;
  onViewHistory: (customer: Customer) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onPageChange: (page: number) => void;
}

export const Customers = ({
  settings,
  customers,
  clientPayments,
  setEditingCustomer,
  setNewCustomer,
  setIsAddingCustomer,
  onDelete,
  onAddPayment,
  onViewHistory,
  searchTerm,
  setSearchTerm,
  onPageChange
}: CustomersProps) => {
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
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
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
