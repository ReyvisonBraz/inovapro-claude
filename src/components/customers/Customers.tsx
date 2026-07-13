import React from 'react';
import { CustomerList } from './CustomerList';
import { Customer, ClientPayment, AppSettings } from '../../types';
import { LoadingState } from '../ui/LoadingState';
import { Plus } from 'lucide-react';

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
  onAdd: () => void;
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
  onAdd,
  isLoading
}: CustomersProps) => {
  return (
    <div className="px-3 py-4 sm:p-6 lg:p-10 space-y-4 lg:space-y-8 pb-28 lg:pb-10">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">Clientes</h3>
          <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">Contatos, limites e pendências</p>
        </div>
        <button
          onClick={onAdd}
          aria-label="Novo Cliente"
          className="shrink-0 h-11 sm:h-12 bg-primary hover:bg-primary/90 text-white px-3.5 sm:px-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden min-[360px]:inline">Novo cliente</span>
          <span className="min-[360px]:hidden">Novo</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingState className="py-20" />
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
