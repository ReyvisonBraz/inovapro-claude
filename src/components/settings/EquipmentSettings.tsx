import React, { useState } from 'react';
import { 
  Plus, Trash2, Smartphone, Monitor, Printer, Laptop, Cpu, 
  Gamepad2, Tablet, MonitorCheck, HardDrive, Tag, X,
  Watch, Camera, Speaker, Headphones, Tv, MousePointer2, Keyboard,
  Radio, Mic, Battery, Wifi, Settings as SettingsIcon,
  Box, Layers, Layout, Grid, List as ListIcon, Search
} from 'lucide-react';
import { Brand, Model, EquipmentType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface EquipmentSettingsProps {
  brands: Brand[];
  models: Model[];
  equipmentTypes: EquipmentType[];
  onAddBrand: (name: string, equipmentType: string) => Promise<void>;
  onDeleteBrand: (id: number) => Promise<void>;
  onAddModel: (brandId: number, name: string) => Promise<void>;
  onDeleteModel: (id: number) => Promise<void>;
  onAddEquipmentType: (name: string, icon?: string) => void;
  onDeleteEquipmentType: (id: number) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Tablet', icon: Tablet },
  { name: 'Laptop', icon: Laptop },
  { name: 'Monitor', icon: Monitor },
  { name: 'Cpu', icon: Cpu },
  { name: 'Printer', icon: Printer },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Watch', icon: Watch },
  { name: 'Camera', icon: Camera },
  { name: 'Speaker', icon: Speaker },
  { name: 'Headphones', icon: Headphones },
  { name: 'Tv', icon: Tv },
  { name: 'MousePointer2', icon: MousePointer2 },
  { name: 'Keyboard', icon: Keyboard },
  { name: 'Radio', icon: Radio },
  { name: 'Mic', icon: Mic },
  { name: 'Battery', icon: Battery },
  { name: 'Wifi', icon: Wifi },
  { name: 'MonitorCheck', icon: MonitorCheck },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Box', icon: Box },
  { name: 'Layers', icon: Layers },
  { name: 'Layout', icon: Layout },
  { name: 'Grid', icon: Grid },
  { name: 'List', icon: ListIcon }
];

const getIconForType = (type: EquipmentType) => {
  if (type.icon) {
    const found = AVAILABLE_ICONS.find(i => i.name === type.icon);
    if (found) return found.icon;
  }

  const name = type.name.toLowerCase();
  if (name.includes('notebook') || name.includes('laptop')) return Laptop;
  if (name.includes('desktop') || name.includes('pc')) return Cpu;
  if (name.includes('gamer')) return Gamepad2;
  if (name.includes('impressora')) return Printer;
  if (name.includes('monitor')) return Monitor;
  if (name.includes('smartphone') || name.includes('celular')) return Smartphone;
  if (name.includes('tablet')) return Tablet;
  if (name.includes('console') || name.includes('video game')) return Gamepad2;
  return MonitorCheck;
};

export const EquipmentSettings: React.FC<EquipmentSettingsProps> = ({
  brands,
  models,
  equipmentTypes,
  onAddBrand,
  onDeleteBrand,
  onAddModel,
  onDeleteModel,
  onAddEquipmentType,
  onDeleteEquipmentType,
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('MonitorCheck');

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  React.useEffect(() => {
    if (equipmentTypes.length > 0 && !selectedType) {
      setSelectedType(equipmentTypes[0].name);
    }
  }, [equipmentTypes, selectedType]);

  const filteredBrands = brands
    .filter(b => b.equipmentType === selectedType)
    .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));

  const filteredModels = selectedBrandId 
    ? models
        .filter(m => m.brandId === selectedBrandId)
        .filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
    : [];

  const handleAddBrand = async () => {
    if (!newBrandName.trim() || !selectedType) return;
    await onAddBrand(newBrandName.trim(), selectedType);
    setNewBrandName('');
  };

  const handleAddModel = async () => {
    if (!newModelName.trim() || !selectedBrandId) return;
    await onAddModel(selectedBrandId, newModelName.trim());
    setNewModelName('');
  };

  const handleAddType = () => {
    if (!newTypeName.trim()) return;
    onAddEquipmentType(newTypeName.trim(), selectedIconName);
    setNewTypeName('');
    setSelectedIconName('MonitorCheck');
    setIsAddingType(false);
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Equipamentos, Marcas e Modelos</h3>
            <p className="text-sm text-slate-500 font-medium">Gerencie a estrutura de equipamentos do sistema</p>
          </div>
          <button 
            onClick={() => setIsAddingType(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            Novo Tipo
          </button>
        </div>
        
        {/* Equipment Type Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
          {equipmentTypes.map((type) => {
            const Icon = getIconForType(type);
            const isActive = selectedType === type.name;
            return (
              <div key={type.id} className="relative group">
                <button
                  onClick={() => {
                    setSelectedType(type.name);
                    setSelectedBrandId(null);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center w-full aspect-square rounded-3xl border-2 transition-all duration-500",
                    isActive
                      ? "bg-primary/10 border-primary text-primary shadow-[0_0_30px_rgba(17,82,212,0.3)] scale-105 z-10"
                      : "bg-white/[0.03] border-white/5 text-slate-500 hover:border-white/20 hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-8 h-8 mb-3 transition-all duration-500", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">{type.name}</span>
                </button>
                {!isActive && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEquipmentType(type.id);
                      if (isActive) {
                        setSelectedType('');
                        setSelectedBrandId(null);
                      }
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 z-20"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Brands Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-1.5 w-8 bg-primary rounded-full" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Marcas para {selectedType}</h4>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Nova marca..."
                    className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  />
                  <button
                    onClick={handleAddBrand}
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
                      onClick={() => setSelectedBrandId(brand.id)}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all duration-300 border",
                        selectedBrandId === brand.id 
                          ? "bg-primary/10 border-primary/30 text-primary shadow-inner" 
                          : "bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                    >
                      <span className="text-sm font-bold tracking-tight">{brand.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBrand(brand.id);
                        }}
                        className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Models Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-1.5 w-8 bg-emerald-500 rounded-full" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {selectedBrandId 
                  ? `Modelos de ${brands.find(b => b.id === selectedBrandId)?.name}`
                  : 'Selecione uma marca'}
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
                        placeholder="Novo modelo..."
                        className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                      />
                      <button
                        onClick={handleAddModel}
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
                          <span className="text-sm font-bold tracking-tight">{model.name}</span>
                          <button
                            onClick={() => onDeleteModel(model.id)}
                            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
        </div>
      </div>

      {/* Add Type Modal */}
      <AnimatePresence>
        {isAddingType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="w-full max-w-2xl glass-modal p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-500 to-emerald-500" />
              
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">Novo Tipo</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Categoria de Equipamento</p>
                </div>
                <button onClick={() => setIsAddingType(false)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nome do Tipo</label>
                  <input 
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.25rem] px-6 text-lg font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Ex: Console, Tablet, Drone..."
                    autoFocus
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Selecione um Ícone</label>
                  <div className="grid grid-cols-5 sm:grid-cols-7 gap-3 max-h-[240px] overflow-y-auto p-2 custom-scrollbar bg-white/[0.02] rounded-[1.5rem] border border-white/5">
                    {AVAILABLE_ICONS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedIconName === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={() => setSelectedIconName(item.name)}
                          className={cn(
                            "flex flex-col items-center justify-center aspect-square rounded-2xl border-2 transition-all duration-300",
                            isSelected
                              ? "bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(17,82,212,0.2)]"
                              : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-slate-300"
                          )}
                          title={item.name}
                        >
                          <Icon size={24} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsAddingType(false)}
                    className="flex-1 h-16 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-[1.25rem] hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddType}
                    className="flex-[2] h-16 bg-primary text-white font-black uppercase tracking-widest rounded-[1.25rem] shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Plus size={20} /> Adicionar Tipo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
