import React from 'react';
import {
  Coffee, Briefcase, Zap, Car, ShoppingBag,
  Edit, Copy, Trash2, MessageCircle, Search
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatCurrency } from '../../lib/utils';
import { Transaction, AppSettings } from '../../types';
import { Pagination } from '../ui/Pagination';

interface TransactionListProps {
  filteredTransactions: Transaction[];
  handleDuplicateTransaction: (tx: Transaction) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  settings: AppSettings;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
  onAddNewTransaction: () => void;
  onWhatsAppReminder?: (tx: Transaction) => void;
}

export const TransactionList = ({
  filteredTransactions,
  handleDuplicateTransaction,
  pagination,
  onPageChange,
  settings,
  onEditTransaction,
  onDeleteTransaction,
  onAddNewTransaction,
  onWhatsAppReminder
}: TransactionListProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Alimentação': return <Coffee size={16} />;
      case 'Trabalho': return <Briefcase size={16} />;
      case 'Utilidades': return <Zap size={16} />;
      case 'Viagem': return <Car size={16} />;
      case 'Lazer': return <ShoppingBag size={16} />;
      default: return <ShoppingBag size={16} />;
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Mobile View */}
      <div className="md:hidden divide-y divide-white/5">
        {filteredTransactions.map((tx) => (
          <div key={tx.id} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold">{tx.description}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {format(new Date(tx.date), 'dd/MM/yyyy')} • {tx.category}
                </p>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-sm font-black tracking-tight block",
                  tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                )}>
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </span>
                <span className={cn(
                  "text-xs font-bold",
                  tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                )}>
                  {tx.type === 'income' ? 'Entrada' : 'Saída'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-emerald-500">{tx.status}</span>
              </div>
              <div className="flex items-center gap-2">
                {tx.customerPhone && onWhatsAppReminder && (
                  <button
                    onClick={() => onWhatsAppReminder(tx)}
                    className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                )}
                <button
                  onClick={() => onEditTransaction(tx)}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDuplicateTransaction(tx)}
                  className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                  title="Duplicar"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => onDeleteTransaction(tx.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                <Search size={32} />
              </div>
              <div>
                <p className="text-slate-400 font-bold">Nenhuma transação encontrada</p>
                <p className="text-xs text-slate-600 uppercase tracking-widest mt-1">Ajuste seus filtros</p>
              </div>
              <button 
                onClick={() => onAddNewTransaction()}
                className="mt-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-primary/20"
              >
                Nova Transação
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              {!settings.hiddenColumns.includes('Data') && <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Data</th>}
              {!settings.hiddenColumns.includes('Descrição') && <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Descrição</th>}
              {!settings.hiddenColumns.includes('Categoria') && <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Categoria</th>}
              {!settings.hiddenColumns.includes('Tipo') && <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Tipo</th>}
              {!settings.hiddenColumns.includes('Valor') && <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Valor</th>}
              {!settings.hiddenColumns.includes('Status') && <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>}
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/[0.02] transition-all duration-300 border-b border-white/[0.02] last:border-0">
                {!settings.hiddenColumns.includes('Data') && (
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex flex-col items-center justify-center w-14 h-14 rounded-xl border backdrop-blur-sm",
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-rose-500/10 border-rose-500/20'
                      )}>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        )}>
                          {format(new Date(tx.date), 'MMM', { locale: ptBR })}
                        </span>
                        <span className={cn(
                          "text-lg font-black leading-none",
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        )}>
                          {format(new Date(tx.date), 'dd')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-200">
                          {format(new Date(tx.date), 'EEEE', { locale: ptBR }).split('-')[0]}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(tx.date), 'yyyy')} às {format(new Date(tx.date), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </td>
                )}
                {!settings.hiddenColumns.includes('Descrição') && (
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold">{tx.description || '—'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {tx.category}
                      </p>
                    </div>
                  </td>
                )}
                {!settings.hiddenColumns.includes('Categoria') && (
                  <td className="px-4 py-4">
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-semibold text-slate-300">
                      {tx.category}
                    </span>
                  </td>
                )}
                {!settings.hiddenColumns.includes('Tipo') && (
                  <td className="px-4 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold",
                      tx.type === 'income'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        tx.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
                      )} />
                      {tx.type === 'income' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                )}
                {!settings.hiddenColumns.includes('Valor') && (
                  <td className="px-4 py-4">
                    <span className={cn(
                      "text-sm font-black tracking-tight",
                      tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </td>
                )}
                {!settings.hiddenColumns.includes('Status') && (
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">{tx.status}</span>
                    </div>
                  </td>
                )}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {tx.customerPhone && onWhatsAppReminder && (
                      <button
                        onClick={() => onWhatsAppReminder(tx)}
                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDuplicateTransaction(tx)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                      title="Duplicar"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                      <Search size={32} />
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold">Nenhuma transação encontrada</p>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">Tente ajustar seus filtros de busca</p>
                    </div>
                    <button
                      onClick={() => onAddNewTransaction()}
                      className="mt-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-primary/20"
                    >
                      Nova Transação
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        limit={pagination.limit}
        onPageChange={onPageChange}
      />
    </div>
  );
};
