import React from 'react';
import { Plus, Printer } from 'lucide-react';
import { CustomerList } from './customers/CustomerList';
import { Customer, ClientPayment, AppSettings } from '../types';

interface CustomersProps {
  settings: AppSettings;
  customers: Customer[];
  clientPayments: ClientPayment[];
  setEditingCustomer: (customer: Customer | null) => void;
  setNewCustomer: (customer: any) => void;
  setIsAddingCustomer: (isAdding: boolean) => void;
  onDelete: (id: string) => void;
  onAddPayment: (customer: Customer) => void;
  onViewHistory: (customer: Customer) => void;
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
  onViewHistory
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
        customers={customers}
        clientPayments={clientPayments}
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
