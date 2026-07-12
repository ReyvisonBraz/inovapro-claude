import { Edit2, Trash2, Check, X } from 'lucide-react';
import type { EquipmentType } from '../../types';
import { cn } from '../../lib/utils';
import { getIconForType } from './equipmentIcons';

interface EquipmentTypeGridProps {
  equipmentTypes: EquipmentType[];
  selectedType: string;
  editingTypeId: number | null;
  editingTypeName: string;
  onSelectType: (name: string) => void;
  onStartEdit: (id: number, name: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: number, currentIcon?: string) => void;
  onDelete: (id: number, isActive: boolean) => void;
  onEditNameChange: (name: string) => void;
}

export function EquipmentTypeGrid({
  equipmentTypes,
  selectedType,
  editingTypeId,
  editingTypeName,
  onSelectType,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditNameChange,
}: EquipmentTypeGridProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="h-1.5 w-8 bg-blue-500 rounded-full" />
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">1. Selecione o Tipo de Equipamento</h4>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
        {equipmentTypes.map((type) => {
          const Icon = getIconForType(type);
          const isActive = selectedType === type.name;
          return (
            <div key={type.id} className="relative group">
              <button
                onClick={() => onSelectType(type.name)}
                className={cn(
                  "flex flex-col items-center justify-center w-full aspect-square rounded-3xl border-2 transition-all duration-500",
                  isActive
                    ? "bg-primary/10 border-primary text-primary shadow-[0_0_30px_rgba(17,82,212,0.3)] scale-105 z-10"
                    : "bg-white/[0.03] border-white/5 text-slate-500 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-8 h-8 mb-3 transition-all duration-500", isActive ? "scale-110" : "group-hover:scale-110")} />
                {editingTypeId === type.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingTypeName}
                    onChange={(e) => onEditNameChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(type.id, type.icon)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-[80%] text-[10px] font-black uppercase tracking-widest text-center px-2 bg-black/20 rounded border border-primary/50 text-white outline-none"
                  />
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">{type.name}</span>
                )}
              </button>
              {!isActive && editingTypeId !== type.id && (
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <button
                    onClick={(e) => { e.stopPropagation(); onStartEdit(type.id, type.name); }}
                    className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(type.id, isActive); }}
                    className="w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
              {editingTypeId === type.id && (
                <div className="absolute -top-2 -right-2 flex gap-1 z-30">
                  <button onClick={(e) => { e.stopPropagation(); onSaveEdit(type.id, type.icon); }} className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all">
                    <Check size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onCancelEdit(); }} className="w-7 h-7 bg-slate-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}