import React from 'react';
import { Plus, Printer } from 'lucide-react';
import { CustomerList } from './CustomerList';
import { Customer, ClientPayment, AppSettings } from '../../types';

interface CustomersProps {
  customers: { data: Customer[], meta: any };
  clientPayments: { data: ClientPayment[], meta: any };
  onDelete: (id: number) => void;
  onAddPayment: (customer: Customer) => void;
  onViewHistory: (customer: Customer) => void;
  onPageChange: (page: number) => void;
  settings: AppSettings;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEdit: (customer: Customer) => void;
  isLoading?: boolean;
}

export const Customers = ({
  customers,
  clientPayments,
  onDelete,
  onAddPayment,
  onViewHistory,
  onPageChange,
  settings,
  searchTerm,
  onSearchChange,
  onEdit,
  isLoading
}: CustomersProps) => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Gestão de Clientes</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Cadastre e gerencie seus clientes para cobranças rápidas</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <CustomerList 
          settings={settings}
          customers={customers.data}
          clientPayments={clientPayments.data}
          searchTerm={searchTerm}
          setSearchTerm={onSearchChange}
          pagination={{
            currentPage: customers.meta.page,
            totalPages: customers.meta.totalPages,
            totalItems: customers.meta.total,
            limit: customers.meta.limit
          }}
          onPageChange={onPageChange}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddPayment={onAddPayment}
          onViewHistory={onViewHistory}
        />
      )}
    </div>
  );
};
