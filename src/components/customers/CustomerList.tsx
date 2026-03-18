import React, { useState } from 'react';
import { Customer, ClientPayment } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { Search, Plus, Filter, MoreVertical, Phone, MessageCircle, History, CreditCard, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface CustomerListProps {
  customers: Customer[];
  clientPayments: ClientPayment[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
  onAddPayment: (customer: Customer) => void;
  onViewHistory: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ 
  customers, 
  clientPayments, 
  onEdit, 
  onDelete, 
  onAddPayment, 
  onViewHistory 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDebt, setFilterDebt] = useState(false);
  const [sortMode, setSortMode] = useState<'name' | 'debt'>('name');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (filterDebt) {
      const debt = clientPayments
        .filter(p => p.customerId === c.id && p.status !== 'paid')
        .reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
      return debt > 0;
    }

    return true;
  }).sort((a, b) => {
    if (sortMode === 'name') {
      return a.firstName.localeCompare(b.firstName);
    } else {
      const debtA = clientPayments.filter(p => p.customerId === a.id && p.status !== 'paid').reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
      const debtB = clientPayments.filter(p => p.customerId === b.id && p.status !== 'paid').reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
      return debtB - debtA;
    }
  });

  const getCustomerDebt = (customerId: number) => {
    return clientPayments
      .filter(p => p.customerId === customerId && p.status !== 'paid')
      .reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
  };

  const getLastPurchase = (customerId: number) => {
    const payments = clientPayments
      .filter(p => p.customerId === customerId)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    return payments.length > 0 ? payments[0].purchaseDate : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente por nome, empresa ou telefone..."
            className="w-full h-12 bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setSortMode('name')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
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
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
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
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2",
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
      <div className="grid gap-4">
        {filteredCustomers.map(customer => {
          const debt = getCustomerDebt(customer.id);
          const lastPurchase = getLastPurchase(customer.id);

          return (
            <div 
              key={customer.id}
              className="group bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:border-primary/20 relative overflow-hidden"
            >
              {debt > 0 && (
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500/50" />
              )}
              
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                {/* Info Principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white truncate flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">ID: {customer.id}</span>
                      {customer.firstName} {customer.lastName}
                    </h3>
                    {customer.nickname && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {customer.nickname}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    {customer.companyName && (
                      <span className="flex items-center gap-1.5">
                        <CreditCard size={14} />
                        {customer.companyName}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} />
                      {customer.phone}
                    </span>
                    {lastPurchase && (
                      <span className="flex items-center gap-1.5">
                        <History size={14} />
                        Última compra: {format(parseISO(lastPurchase), 'dd/MM/yy')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Financeiro */}
                <div className="flex items-center gap-8 w-full lg:w-auto bg-black/20 p-3 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Pendências</p>
                    <p className={cn(
                      "text-lg font-black tracking-tight",
                      debt > 0 ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {formatCurrency(debt)}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Limite</p>
                    <p className="text-lg font-bold text-slate-300 tracking-tight">
                      {formatCurrency(customer.creditLimit || 0)}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <button 
                    onClick={() => onAddPayment(customer)}
                    className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20"
                    title="Nova Venda"
                  >
                    <Plus size={18} />
                  </button>
                  <button 
                    onClick={() => onViewHistory(customer)}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                    title="Histórico"
                  >
                    <History size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      const msg = `Olá ${customer.firstName}, gostaríamos de lembrar sobre o débito pendente de ${formatCurrency(debt)}. Podemos ajudar com algo?`;
                      window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                    title="Cobrar no WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button 
                    onClick={() => onEdit(customer)}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(customer.id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p>Nenhum cliente encontrado com os filtros atuais.</p>
          </div>
        )}
      </div>
    </div>
  );
};
