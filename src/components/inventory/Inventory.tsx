import React from 'react';
import { motion } from 'motion/react';
import { 
  Package, Search, Plus, Filter, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Edit2, Trash2, 
  MoreVertical, ChevronRight 
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { InventoryItem } from '../../types';

interface InventoryProps {
  inventory: InventoryItem[];
  onAdd: (item: Omit<InventoryItem, 'id'>) => Promise<boolean>;
  onUpdate: (id: number, item: Partial<InventoryItem>) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

const Inventory: React.FC<InventoryProps> = ({
  inventory,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddingInventoryItem, setIsAddingInventoryItem] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);

  const handleEditInventoryItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsAddingInventoryItem(true);
  };

  const handleDeleteInventoryItem = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este item do estoque?')) {
      await onDelete(id);
    }
  };

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.quantity <= (item.minQuantity || 5));

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
        <div className="relative w-full lg:max-w-md">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
          <input 
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
            placeholder="Pesquisar estoque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-4 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <AlertTriangle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{lowStockItems.length} Itens com estoque baixo</span>
          </div>
          <button 
            onClick={() => setIsAddingInventoryItem(true)}
            className="flex items-center gap-2 px-8 h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-all flex-1 lg:flex-none"
          >
            <Plus size={18} />
            Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card group overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                  <Package size={24} />
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEditInventoryItem(item)}
                    className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteInventoryItem(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold truncate">{item.name}</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                  SKU: {item.sku || 'N/A'} • {item.category || 'Geral'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Quantidade</p>
                  <p className={cn(
                    "text-lg font-black",
                    item.quantity <= (item.minQuantity || 5) ? "text-rose-500" : "text-slate-200"
                  )}>
                    {item.quantity}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Preço Venda</p>
                  <p className="text-lg font-black text-emerald-500">{formatCurrency(item.salePrice)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Custo</span>
                  <span className="text-xs font-bold">{formatCurrency(item.costPrice)}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Margem</span>
                  <span className="text-xs font-bold text-emerald-500">
                    {(((item.salePrice - item.costPrice) / item.costPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <Package size={64} />
              <p className="text-lg font-bold uppercase tracking-widest">Nenhum item no estoque</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
