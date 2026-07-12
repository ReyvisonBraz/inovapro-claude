import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Tag, Search } from 'lucide-react';
import type { Brand } from '../../types';
import { cn } from '../../lib/utils';

interface BrandsSectionProps {
  brands: Brand[];
  selectedType: string;
  selectedBrandId: number | null;
  editingBrandId: number | null;
  editingBrandName: string;
  onSelectBrand: (id: number) => void;
  onStartEdit: (id: number, name: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onEditNameChange: (name: string) => void;
  onAdd: (name: string) => Promise<void>;
}

export function BrandsSection({
  brands,
  selectedType,
  selectedBrandId,
  editingBrandId,
  editingBrandName,
  onSelectBrand,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditNameChange,
  onAdd,
}: BrandsSectionProps) {
  const [newBrandName, setNewBrandName] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  const filteredBrands = brands
    .filter(b => b.equipmentType === selectedType)
    .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));

  const handleAdd = async () => {
    if (!newBrandName.trim()) return;
    await onAdd(newBrandName.trim());
    setNewBrandName('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="h-1.5 w-8 bg-primary rounded-full" />
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">2. Marcas de {selectedType || 'Equipamento'}</h4>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Nova marca..."
              className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
            <button
              onClick={handleAdd}
              className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Pesquisar marcas..."
              className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-5 pl-12 text-xs font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredBrands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <Tag className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">Nenhuma marca</p>
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => editingBrandId !== brand.id && onSelectBrand(brand.id)}
                className={cn(
                  "flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all duration-300 border",
                  selectedBrandId === brand.id
                    ? "bg-primary/10 border-primary/30 text-primary shadow-inner"
                    : "bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                {editingBrandId === brand.id ? (
                  <div className="flex-1 flex gap-2 mr-4" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      type="text"
                      value={editingBrandName}
                      onChange={(e) => onEditNameChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(brand.id)}
                      className="flex-1 h-8 bg-black/20 border border-primary/50 rounded-lg px-3 text-sm font-bold text-white outline-none"
                    />
                    <button onClick={() => onSaveEdit(brand.id)} className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:scale-105">
                      <Check size={14} />
                    </button>
                    <button onClick={() => onCancelEdit()} className="w-8 h-8 bg-slate-500 text-white rounded-lg flex items-center justify-center hover:scale-105">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm font-bold tracking-tight">{brand.name}</span>
                )}

                {editingBrandId !== brand.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onStartEdit(brand.id, brand.name); }}
                      className="p-2 text-slate-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(brand.id); }}
                      className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}