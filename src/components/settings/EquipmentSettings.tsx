import React, { useState } from 'react';
import { Plus, Info } from 'lucide-react';
import type { Brand, Model, EquipmentType } from '../../types';
import { useToast } from '../ui/Toast';
import { EquipmentTypeGrid } from './EquipmentTypeGrid';
import { BrandsSection } from './BrandsSection';
import { ModelsSection } from './ModelsSection';
import { AddTypeModal } from './AddTypeModal';

interface EquipmentSettingsProps {
  brands: Brand[];
  models: Model[];
  equipmentTypes: EquipmentType[];
  onAddBrand: (name: string, equipmentType: string) => Promise<void>;
  onUpdateBrand: (id: number, name: string, equipmentType: string) => Promise<void>;
  onDeleteBrand: (id: number) => Promise<void>;
  onAddModel: (brandId: number, name: string) => Promise<void>;
  onUpdateModel: (id: number, brandId: number, name: string) => Promise<void>;
  onDeleteModel: (id: number) => Promise<void>;
  onAddEquipmentType: (name: string, icon?: string) => void;
  onUpdateEquipmentType: (id: number, name: string, icon?: string) => void;
  onDeleteEquipmentType: (id: number) => void;
}

export const EquipmentSettings: React.FC<EquipmentSettingsProps> = ({
  brands, models, equipmentTypes,
  onAddBrand, onUpdateBrand, onDeleteBrand,
  onAddModel, onUpdateModel, onDeleteModel,
  onAddEquipmentType, onUpdateEquipmentType, onDeleteEquipmentType,
}) => {
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [isAddingType, setIsAddingType] = useState(false);

  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [editingTypeName, setEditingTypeName] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [editingBrandName, setEditingBrandName] = useState('');
  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [editingModelName, setEditingModelName] = useState('');

  React.useEffect(() => {
    if (equipmentTypes.length > 0 && !selectedType) {
      setSelectedType(equipmentTypes[0].name);
    }
  }, [equipmentTypes, selectedType]);

  const handleSelectType = (name: string) => {
    setSelectedType(name);
    setSelectedBrandId(null);
  };

  const handleDeleteType = (id: number, isActive: boolean) => {
    onDeleteEquipmentType(id);
    if (isActive) { setSelectedType(''); setSelectedBrandId(null); }
  };

  const saveTypeEdit = async (id: number, currentIcon?: string) => {
    if (!editingTypeName.trim()) return;
    try {
      await onUpdateEquipmentType(id, editingTypeName.trim(), currentIcon);
      setEditingTypeId(null);
      if (selectedType === equipmentTypes.find(t => t.id === id)?.name) {
        setSelectedType(editingTypeName.trim());
      }
    } catch { showToast('Erro ao atualizar tipo de equipamento.', 'error'); }
  };

  const saveBrandEdit = async (id: number) => {
    if (!editingBrandName.trim()) return;
    try {
      await onUpdateBrand(id, editingBrandName.trim(), selectedType);
      setEditingBrandId(null);
    } catch { showToast('Erro ao atualizar marca.', 'error'); }
  };

  const saveModelEdit = async (id: number, brandId: number) => {
    if (!editingModelName.trim()) return;
    try {
      await onUpdateModel(id, brandId, editingModelName.trim());
      setEditingModelId(null);
    } catch { showToast('Erro ao atualizar modelo.', 'error'); }
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Equipamentos, Marcas e Modelos</h3>
            <p className="text-sm text-slate-500 font-medium">Gerencie a hierarquia de equipamentos do sistema</p>
          </div>
          <button
            onClick={() => setIsAddingType(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> Novo Tipo
          </button>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 md:p-6 mb-8 flex flex-col md:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-primary">Como funciona este painel?</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
              A organização funciona em funil: <strong>1. Escolha o Tipo</strong> acima (ex: Smartphone) → <strong>2. Selecione a Marca</strong> abaixo → <strong>3. Gerencie os Modelos</strong> daquela marca ao lado.
            </p>
          </div>
        </div>

        <EquipmentTypeGrid
          equipmentTypes={equipmentTypes}
          selectedType={selectedType}
          editingTypeId={editingTypeId}
          editingTypeName={editingTypeName}
          onSelectType={handleSelectType}
          onStartEdit={(id, name) => { setEditingTypeId(id); setEditingTypeName(name); }}
          onCancelEdit={() => setEditingTypeId(null)}
          onSaveEdit={saveTypeEdit}
          onDelete={handleDeleteType}
          onEditNameChange={setEditingTypeName}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BrandsSection
            brands={brands}
            selectedType={selectedType}
            selectedBrandId={selectedBrandId}
            editingBrandId={editingBrandId}
            editingBrandName={editingBrandName}
            onSelectBrand={setSelectedBrandId}
            onStartEdit={(id, name) => { setEditingBrandId(id); setEditingBrandName(name); }}
            onCancelEdit={() => setEditingBrandId(null)}
            onSaveEdit={saveBrandEdit}
            onDelete={(id) => { try { onDeleteBrand(id); } catch { showToast('Erro ao excluir marca.', 'error'); } }}
            onEditNameChange={setEditingBrandName}
            onAdd={async (name) => { try { await onAddBrand(name, selectedType); } catch { showToast('Erro ao adicionar marca.', 'error'); } }}
          />

          <ModelsSection
            models={models}
            brands={brands}
            selectedBrandId={selectedBrandId}
            editingModelId={editingModelId}
            editingModelName={editingModelName}
            onStartEdit={(id, name) => { setEditingModelId(id); setEditingModelName(name); }}
            onCancelEdit={() => setEditingModelId(null)}
            onSaveEdit={saveModelEdit}
            onDelete={(id) => { try { onDeleteModel(id); } catch { showToast('Erro ao excluir modelo.', 'error'); } }}
            onEditNameChange={setEditingModelName}
            onAdd={async (brandId, name) => { try { await onAddModel(brandId, name); } catch { showToast('Erro ao adicionar modelo.', 'error'); } }}
          />
        </div>
      </div>

      <AddTypeModal
        isOpen={isAddingType}
        onClose={() => setIsAddingType(false)}
        onAdd={(name, icon) => {
          try { onAddEquipmentType(name, icon); } catch { showToast('Erro ao adicionar tipo de equipamento.', 'error'); }
        }}
      />
    </div>
  );
};