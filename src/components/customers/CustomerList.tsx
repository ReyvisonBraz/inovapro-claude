import React, { useState } from 'react';
import { Customer, ClientPayment, AppSettings } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { Search, Plus, Phone, MessageCircle, History, CreditCard, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { WhatsAppModal } from './modals/WhatsAppModal';
import { EmptyState } from '../ui/EmptyState';

import { Pagination } from '../ui/Pagination';

interface CustomerListProps {
  settings: AppSettings;
  customers: Customer[];
  clientPayments: ClientPayment[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
  onAddPayment: (customer: Customer) => void;
  onViewHistory: (customer: Customer) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ 
  settings,
  customers, 
  clientPayments, 
  onEdit, 
  onDelete, 
  onAddPayment, 
  onViewHistory,
  searchTerm,
  setSearchTerm,
  pagination,
  onPageChange
}) => {
  const [filterDebt, setFilterDebt] = useState(false);
  const [sortMode, setSortMode] = useState<'name' | 'debt'>('name');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedCustomerForWhatsApp, setSelectedCustomerForWhatsApp] = useState<Customer | null>(null);
  const [selectedDebtForWhatsApp, setSelectedDebtForWhatsApp] = useState(0);

  const filteredCustomers = (customers || []).filter(c => {
    const matchesSearch = 
      (c.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (c.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (filterDebt) {
      const debt = (clientPayments || [])
        .filter(p => p.customerId === c.id && p.status !== 'paid')
        .reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
      return debt > 0;
    }

    return true;
  }).sort((a, b) => {
    if (sortMode === 'name') {
      return (a.firstName || '').localeCompare(b.firstName || '');
    } else {
      const debtA = (clientPayments || []).filter(p => p.customerId === a.id && p.status !== 'paid').reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
      const debtB = (clientPayments || []).filter(p => p.customerId === b.id && p.status !== 'paid').reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
      return debtB - debtA;
    }
  });

  const getCustomerDebt = (customerId: number) => {
    return (clientPayments || [])
      .filter(p => p.customerId === customerId && p.status !== 'paid')
      .reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
  };

  const getLastPurchase = (customerId: number) => {
    const payments = (clientPayments || [])
      .filter(p => p.customerId === customerId)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    return payments.length > 0 ? (payments[0]?.purchaseDate ?? null) : null;
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header e Filtros */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full h-11 sm:h-12 bg-slate-900/50 border border-white/10 rounded-xl pl-11 sm:pl-12 pr-4 text-sm font-semibold focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto">
          <button 
            onClick={() => setSortMode('name')}
            className={cn(
              "min-h-10 md:flex-none px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest whitespace-nowrap transition-all border text-center",
              sortMode === 'name' 
                ? "bg-primary/10 text-primary border-primary/20" 
                : "bg-white/5 text-slate-500 border-transparent hover:bg-white/10"
            )}
          >
            A-Z Nome
          </button>
          <button 
            onClick={() => setSortMode('debt')}
            className={cn(
              "min-h-10 md:flex-none px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest whitespace-nowrap transition-all border text-center",
              sortMode === 'debt' 
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                : "bg-white/5 text-slate-500 border-transparent hover:bg-white/10"
            )}
          >
            $$$ Dívida
          </button>
          <button 
            onClick={() => setFilterDebt(!filterDebt)}
            className={cn(
              "col-span-2 min-h-10 md:w-auto px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest whitespace-nowrap transition-all border flex items-center justify-center gap-2",
              filterDebt
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                : "bg-white/5 text-slate-500 border-transparent hover:bg-white/10"
            )}
          >
            <AlertTriangle size={14} />
            Com Pendências
          </button>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-3 lg:gap-4">
        {filteredCustomers.map(customer => {
          const debt = getCustomerDebt(customer.id);
          const lastPurchase = getLastPurchase(customer.id);

          return (
            <div 
              key={customer.id}
              className="group bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-2xl p-3.5 md:p-5 transition-all relative overflow-hidden"
            >
              {debt > 0 && <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500/50" />}
              
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 items-start lg:items-center justify-between">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm lg:text-lg font-bold text-white truncate">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    {customer.nickname && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                        {customer.nickname}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-500">
                    <a href={`tel:${customer.phone}`} className="flex items-center gap-1 min-h-6 text-slate-400 active:text-primary"><Phone size={12} />{customer.phone}</a>
                    {customer.companyName && <span className="flex items-center gap-1"><CreditCard size={12} />{customer.companyName}</span>}
                    {lastPurchase && <span className="flex items-center gap-1">Última: {format(parseISO(lastPurchase), 'dd/MM/yy')}</span>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
                  <div className="grid grid-cols-2 gap-3 bg-black/20 px-3 py-2.5 rounded-xl border border-white/5 w-full sm:w-auto">
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Dívida</p>
                      <p className={cn("text-sm font-black", debt > 0 ? "text-rose-500" : "text-emerald-500")}>{formatCurrency(debt)}</p>
                    </div>
                    <div className="border-l border-white/10 pl-3">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Limite</p>
                      <p className="text-sm font-bold text-slate-300">{formatCurrency(customer.creditLimit || 0)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5 w-full sm:w-auto shrink-0">
                    <button onClick={() => onAddPayment(customer)} className="col-span-2 h-11 px-2 rounded-xl bg-primary/10 text-primary border border-primary/20 active:bg-primary/20 transition-all flex items-center justify-center gap-1.5 text-[10px] font-bold" title="Nova Venda"><Plus size={16} /> Venda</button>
                    <button onClick={() => onViewHistory(customer)} className="h-11 grid place-items-center rounded-xl bg-white/5 text-slate-400 border border-white/10 active:bg-white/10 transition-all" title="Histórico"><History size={16} /></button>
                    <button onClick={() => {setSelectedCustomerForWhatsApp(customer);setSelectedDebtForWhatsApp(debt);setIsWhatsAppModalOpen(true);}} className="h-11 grid place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 active:bg-emerald-500/20 transition-all" title="WhatsApp"><MessageCircle size={16} /></button>
                    <button onClick={() => onEdit(customer)} className="h-11 grid place-items-center rounded-xl bg-white/5 text-slate-400 border border-white/10 active:bg-white/10 transition-all" title="Editar"><Edit size={16} /></button>
                    <button onClick={() => onDelete(customer.id)} className="h-11 grid place-items-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 active:bg-rose-500/20 transition-all" title="Excluir"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredCustomers.length === 0 && (
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Ajuste os filtros ou cadastre um novo cliente."
            className="py-20"
          />
        )}
      </div>

      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        limit={pagination.limit}
        onPageChange={onPageChange}
      />

      {selectedCustomerForWhatsApp && (
        <WhatsAppModal 
          isOpen={isWhatsAppModalOpen}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            setSelectedCustomerForWhatsApp(null);
          }}
          customer={selectedCustomerForWhatsApp}
          debt={selectedDebtForWhatsApp}
          settings={settings}
        />
      )}
    </div>
  );
};
