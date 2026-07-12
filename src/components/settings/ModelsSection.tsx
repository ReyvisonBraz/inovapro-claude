import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Cpu, HardDrive, Search } from 'lucide-react';
import type { Brand, Model } from '../../types';
import { cn } from '../../lib/utils';

interface ModelsSectionProps {
  models: Model[];
  brands: Brand[];
  selectedBrandId: number | null;
  editingModelId: number | null;
  editingModelName: string;
  onStartEdit: (id: number, name: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: number, brandId: number) => void;
  onDelete: (id: number) => void;
  onEditNameChange: (name: string) => void;
  onAdd: (brandId: number, name: string) => Promise<void>;
}

export function ModelsSection({
  models,
  brands,
  selectedBrandId,
  editingModelId,
  editingModelName,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditNameChange,
  onAdd,
}: ModelsSectionProps) {
  const [newModelName, setNewModelName] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const selectedBrandName = brands.find(b => b.id === selectedBrandId)?.name;

  const filteredModels = selectedBrandId
    ? models
        .filter(m => m.brandId === selectedBrandId)
        .filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
    : [];

  const handleAdd = async () => {
    if (!newModelName.trim() || !selectedBrandId) return;
    await onAdd(selectedBrandId, newModelName.trim());
    setNewModelName('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="h-1.5 w-8 bg-emerald-500 rounded-full" />
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          3. {selectedBrandId ? `Modelos de ${selectedBrandName}` : 'Modelos'}
        </h4>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-6">
        {selectedBrandId ? (
          <>
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Novo modelo..."
                  className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                />
                <button
                  onClick={handleAdd}
                  className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder="Pesquisar modelos..."
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-5 pl-12 text-xs font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredModels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                  <Cpu className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">Nenhum modelo</p>
                </div>
              ) : (
                filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-300"
                  >
                    {editingModelId === model.id ? (
                      <div className="flex-1 flex gap-2 mr-4" onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          type="text"
                          value={editingModelName}
                          onChange={(e) => onEditNameChange(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(model.id, model.brandId)}
                          className="flex-1 h-8 bg-black/20 border border-emerald-500/50 rounded-lg px-3 text-sm font-bold text-white outline-none"
                        />
                        <button onClick={() => onSaveEdit(model.id, model.brandId)} className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:scale-105">
                          <Check size={14} />
                        </button>
                        <button onClick={() => onCancelEdit()} className="w-8 h-8 bg-slate-500 text-white rounded-lg flex items-center justify-center hover:scale-105">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-bold tracking-tight">{model.name}</span>
                    )}

                    {editingModelId !== model.id && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => onStartEdit(model.id, model.name)}
                          className="p-2 text-slate-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(model.id)}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-700">
            <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6">
              <HardDrive className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-center max-w-[200px] leading-relaxed">Selecione uma marca ao lado para gerenciar modelos</p>
          </div>
        )}
      </div>
    </div>
  );
}