import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Cpu, HardDrive, Lock, Camera, Trash2, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { SearchableSelect } from '../../ui/SearchableSelect';
import { ServiceOrderFormData } from '../../../schemas/serviceOrderSchema';
import { Brand, Model } from '../../../types';

interface EquipmentSectionProps {
  skipEquipmentValidation: boolean;
  setSkipEquipmentValidation: (val: boolean) => void;
  isSimplified: boolean;
  equipmentTypes: {id: number, name: string}[];
  brands: Brand[];
  models: Model[];
  onAddEquipmentType: (name: string) => void;
  onAddBrand: (name: string, equipmentType: string) => void;
  onAddModel: (brandId: number, name: string) => void;
  setQuickAddModal: (modal: any) => void;
  showToast: (msg: string, type: string) => void;
  watchedArrivalPhotos: Array<{base64: string; timestamp: string}>;
  addPhoto: (file: File) => Promise<void>;
  removePhoto: (idx: number) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  skipEquipmentValidation,
  setSkipEquipmentValidation,
  isSimplified,
  equipmentTypes,
  brands,
  models,
  onAddEquipmentType,
  onAddBrand,
  onAddModel,
  setQuickAddModal,
  showToast,
  watchedArrivalPhotos,
  addPhoto,
  removePhoto
}) => {
  const { register, watch, setValue, clearErrors, formState: { errors } } = useFormContext<ServiceOrderFormData>();

  const watchedEquipmentType = watch('equipmentType');
  const watchedEquipmentBrand = watch('equipmentBrand');

  return (
    <>
      {/* Equipamento */}
      <div className="space-y-4 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 bg-indigo-500 rounded-full" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Dados do Equipamento</h4>
          </div>
        </div>
        
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1 mb-2 block">
              Tipo
            </label>
            <div className="flex gap-2">
              <SearchableSelect
                options={equipmentTypes.map(t => ({ value: t.name, label: t.name }))}
                value={watchedEquipmentType || ''}
                onChange={(val) => {
                  setValue('equipmentType', val as string);
                  setValue('equipmentBrand', '');
                  setValue('equipmentModel', '');
                }}
                placeholder="Selecione o Tipo"
                onAdd={(val) => onAddEquipmentType(val)}
                className="h-12 flex-1"
              />
              <button
                type="button"
                onClick={() => setQuickAddModal({ isOpen: true, type: 'type', title: 'Novo Tipo de Equipamento', placeholder: 'Ex: Notebook, Smartphone...', value: '' })}
                className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5"
                title="Adicionar Novo Tipo"
              >
                <Plus size={18} />
              </button>
            </div>
            {errors.equipmentType && <p className="form-field-error text-rose-500 text-xs mt-1 font-bold">{errors.equipmentType.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1">
                Marca
              </label>
            </div>
            <div className="flex gap-2">
              <SearchableSelect
                options={brands
                  .filter(b => !watchedEquipmentType || b.equipmentType === watchedEquipmentType)
                  .map(b => ({ value: b.name, label: b.name }))}
                value={watchedEquipmentBrand || ''}
                onChange={(val) => {
                  setValue('equipmentBrand', val as string);
                  setValue('equipmentModel', '');
                }}
                placeholder="Selecione a Marca"
                onAdd={(val) => onAddBrand(val, watchedEquipmentType || '')}
                disabled={!watchedEquipmentType}
                className="h-12 flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  if (!watchedEquipmentType) {
                    showToast('Selecione um tipo primeiro!', 'error');
                    return;
                  }
                  setQuickAddModal({ isOpen: true, type: 'brand', title: 'Nova Marca', placeholder: 'Ex: Samsung, Apple...', value: '' });
                }}
                disabled={!watchedEquipmentType}
                className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar Nova Marca"
              >
                <Plus size={18} />
              </button>
            </div>
            {errors.equipmentBrand && <p className="form-field-error text-rose-500 text-xs mt-1 font-bold">{errors.equipmentBrand.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1">
                Modelo
              </label>
            </div>
            <div className="flex gap-2">
              <SearchableSelect
                options={models
                  .filter(m => {
                    const brand = brands.find(b => b.name === watchedEquipmentBrand);
                    return brand ? m.brandId === brand.id : false;
                  })
                  .map(m => ({ value: m.name, label: m.name }))}
                value={watch('equipmentModel') || ''}
                onChange={(val) => setValue('equipmentModel', val as string)}
                placeholder="Selecione o Modelo"
                onAdd={(val) => {
                  const brand = brands.find(b => b.name === watchedEquipmentBrand);
                  if (brand) {
                    onAddModel(brand.id, val);
                  } else {
                    showToast('Selecione uma marca primeiro!', 'error');
                  }
                }}
                disabled={!watchedEquipmentBrand}
                className="h-12 flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  if (!watchedEquipmentBrand) {
                    showToast('Selecione uma marca primeiro!', 'error');
                    return;
                  }
                  setQuickAddModal({ isOpen: true, type: 'model', title: 'Novo Modelo', placeholder: 'Ex: Galaxy S23, iPhone 15...', value: '' });
                }}
                disabled={!watchedEquipmentBrand}
                className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar Novo Modelo"
              >
                <Plus size={18} />
              </button>
            </div>
            {errors.equipmentModel && <p className="form-field-error text-rose-500 text-xs mt-1 font-bold">{errors.equipmentModel.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-purple-400 ml-1">Cor do Equipamento</label>
            <input 
              {...register('equipmentColor')}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 placeholder:text-slate-500 outline-none transition-all"
              placeholder="Ex: Preto, Prata, Azul"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-purple-400 ml-1">Nº de Série</label>
            <input 
              {...register('equipmentSerial')}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 outline-none transition-all"
              placeholder="Opcional"
            />
          </div>
        </div>
      </div>

      {/* Especificações e Senha */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6`}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-pink-400 ml-1 flex items-center gap-2">
            <Cpu size={12} /> RAM
          </label>
          <input 
            {...register('ramInfo')}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 outline-none transition-all"
            placeholder="Ex: 8GB DDR4"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 ml-1 flex items-center gap-2">
            <HardDrive size={12} /> Armazenamento
          </label>
          <input 
            {...register('ssdInfo')}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 outline-none transition-all"
            placeholder="Ex: 256GB SSD"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-rose-400 ml-1 flex items-center gap-2">
            <Lock size={12} /> Senha do Dispositivo
          </label>
          <input 
            {...register('customerPassword')}
            className="w-full h-12 bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 text-slate-200 outline-none transition-all"
            placeholder="Ex: Padrão Z, 123456..."
          />
        </div>
      </div>

      {/* Acessórios */}
      <div className={`space-y-2`}>
        <label className="text-xs font-bold uppercase tracking-widest text-indigo-400 ml-1">Acessórios Deixados</label>
        <textarea 
          {...register('accessories')}
          className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary text-slate-200 outline-none transition-all resize-none"
          placeholder="Ex: Carregador original, Capa de proteção, Cabos..."
        />
      </div>

      {/* Foto de Entrada */}
      <div className={`space-y-2`}>
        <label className="text-xs font-bold uppercase tracking-widest text-sky-400 ml-1 flex items-center gap-2">
          <Camera size={14} /> Fotos na Chegada
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <AnimatePresence>
            {watchedArrivalPhotos.map((photo, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden group border border-white/10"
              >
                <img src={photo.base64} alt="Equipamento" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="p-3 bg-rose-500 text-white rounded-xl hover:scale-110 transition-transform shadow-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {watchedArrivalPhotos.length < 3 && (
            <label className="aspect-square flex flex-col items-center justify-center gap-2 bg-sky-500/10 border-2 border-dashed border-sky-500/30 rounded-2xl text-sky-500 hover:bg-sky-500/20 hover:border-sky-500/50 transition-all cursor-pointer group">
              <div className="h-10 w-10 bg-sky-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Adicionar</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addPhoto(file);
                }}
              />
            </label>
          )}
        </div>
      </div>
    </>
  );
};
