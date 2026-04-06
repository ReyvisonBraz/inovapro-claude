import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, Plus, Filter, MoreVertical, Edit, Trash2, 
  Package, ShoppingBag, AlertTriangle, X, Tag
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { ProductModal } from './modals/ProductModal';

interface InventoryProps {
  items: InventoryItem[];
  onAddItem: (item: any) => void;
  onUpdateItem: (id: number, item: any) => void;
  onDeleteItem: (id: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  onOpenConfirm: (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' | 'success') => void;
  editingItem: InventoryItem | null;
  setEditingItem: (item: InventoryItem | null) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  isAdding,
  setIsAdding,
  onOpenConfirm,
  editingItem,
  setEditingItem,
  showToast,
}) => {
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleSave = (data: any) => {
    if (editingItem) {
      onUpdateItem(editingItem.id, data);
    } else {
      onAddItem(data);
    }
    
    setIsAdding(false);
    setEditingItem(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsAdding(true);
  };

  const stats = {
    totalProducts: items.filter(i => i.category === 'product').length,
    totalServices: items.filter(i => i.category === 'service').length,
    lowStock: items.filter(i => i.category === 'product' && i.stockLevel <= 5).length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produtos & Serviços</h2>
          <p className="text-sm text-slate-500">Gerencie seu inventário e catálogo de serviços</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Produtos</p>
              <h3 className="text-3xl font-black mt-1">{stats.totalProducts}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Package size={24} />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Serviços</p>
              <h3 className="text-3xl font-black mt-1">{stats.totalServices}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estoque Baixo</p>
              <h3 className="text-3xl font-black mt-1">{stats.lowStock}</h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value as any)}
          className="h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
        >
          <option value="all">Todos os Itens</option>
          <option value="product">Produtos</option>
          <option value="service">Serviços</option>
        </select>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="glass-card p-5 group hover:border-primary/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  item.category === 'product' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                )}>
                  {item.category === 'product' ? <Package size={20} /> : <ShoppingBag size={20} />}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      onOpenConfirm(
                        'Excluir Item',
                        `Tem certeza que deseja excluir o item "${item.name}"?`,
                        () => onDeleteItem(item.id),
                        'danger'
                      );
                    }}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
                {item.sku && (
                  <p className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-1">
                    <Tag size={12} /> {item.sku}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-end pt-4 border-t border-white/5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Preço</p>
                <p className="font-bold text-primary">{formatCurrency(item.unitPrice)}</p>
              </div>
              {item.category === 'product' && (
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Estoque</p>
                  <p className={cn(
                    "font-bold",
                    item.stockLevel <= 5 ? "text-rose-500" : "text-slate-300"
                  )}>
                    {item.stockLevel} un
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-12 glass-card">
            <Package size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
            <p className="text-slate-400 font-medium">Nenhum item encontrado.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <ProductModal 
        isOpen={isAdding}
        onClose={() => {
          setIsAdding(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSave={handleSave}
      />
    </div>
  );
};
