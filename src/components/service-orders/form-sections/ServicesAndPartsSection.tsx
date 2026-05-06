import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wrench, Plus, X, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { InventoryItem } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { ProductModal } from '../../inventory/modals/ProductModal';
import { useInventory } from '../../../hooks/useInventory';
import { useToast } from '../../ui/Toast';

interface ServicesAndPartsSectionProps {
  inventoryItems: InventoryItem[];
  serviceFields: any[];
  watchedServices: any[];
  appendService: (service: any) => void;
  removeService: (idx: number) => void;
  partFields: any[];
  watchedParts: any[];
  appendPart: (part: any) => void;
  removePart: (idx: number) => void;
  updatePart: (idx: number, part: any) => void;
}

export const ServicesAndPartsSection: React.FC<ServicesAndPartsSectionProps> = ({
  inventoryItems,
  serviceFields,
  watchedServices,
  appendService,
  removeService,
  partFields,
  watchedParts,
  appendPart,
  removePart,
  updatePart,
}) => {
  const [partSearch, setPartSearch] = useState('');
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const { showToast } = useToast();
  const { saveInventoryItemAPI } = useInventory(showToast);

  return (
    <div className="space-y-4 pt-6 border-t border-white/5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Wrench size={12} /> Serviços e Peças
          </h4>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setIsAddingService(!isAddingService);
              setIsAddingPart(false);
            }}
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all"
          >
            {isAddingService ? <X size={14} /> : <Plus size={14} />}
            Serviço
          </button>
          <button 
            onClick={() => {
              setIsAddingPart(!isAddingPart);
              setIsAddingService(false);
            }}
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            {isAddingPart ? <X size={14} /> : <Plus size={14} />}
            Peça
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {serviceFields.map((field, idx) => (
          <div key={field.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/20 transition-all">
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-200">{watchedServices[idx]?.name}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mão de Obra</p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-black text-primary w-24 text-right">{formatCurrency(watchedServices[idx]?.price || 0)}</span>
              <button 
                type="button"
                onClick={() => removeService(idx)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddingService && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl mb-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder="Buscar serviço no catálogo..."
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {inventoryItems
              .filter(item => item.name.toLowerCase().includes(serviceSearch.toLowerCase()) && item.category === 'service')
              .length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-500 mb-2">Nenhum serviço encontrado</p>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(true)}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <Plus size={14} /> Cadastrar "{serviceSearch}"
                  </button>
                </div>
              ) : (
              inventoryItems
                .filter(item => item.name.toLowerCase().includes(serviceSearch.toLowerCase()) && item.category === 'service')
                .map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    appendService({ name: item.name, price: item.unitPrice });
                    setServiceSearch('');
                    setIsAddingService(false);
                  }}
                  className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-white/5 text-left transition-all group border border-transparent hover:border-white/5"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">{item.name}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mão de Obra</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-primary">{formatCurrency(item.unitPrice)}</span>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <Plus size={16} />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      )}

      {isAddingPart && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              value={partSearch}
              onChange={(e) => setPartSearch(e.target.value)}
              placeholder="Buscar no inventário..."
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {inventoryItems
              .filter(item => item.name.toLowerCase().includes(partSearch.toLowerCase()) && item.category === 'product')
              .length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-500 mb-2">Nenhum produto encontrado no inventário</p>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(true)}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <Plus size={14} /> Cadastrar "{partSearch}"
                  </button>
                </div>
              ) : (
              inventoryItems
                .filter(item => item.name.toLowerCase().includes(partSearch.toLowerCase()) && item.category === 'product')
                .map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const existingIdx = watchedParts.findIndex(p => p.id === item.id);
                    if (existingIdx !== -1) {
                      const p = watchedParts[existingIdx];
                      updatePart(existingIdx, {
                        ...p,
                        quantity: p.quantity + 1,
                        subtotal: (p.quantity + 1) * p.unitPrice
                      });
                    } else {
                      appendPart({ 
                        id: item.id, 
                        name: item.name, 
                        quantity: 1, 
                        unitPrice: item.unitPrice, 
                        subtotal: item.unitPrice 
                      });
                    }
                    setPartSearch('');
                  }}
                  className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-white/5 text-left transition-all group border border-transparent hover:border-white/5"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">{item.name}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Estoque: {item.stockLevel}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-primary">{formatCurrency(item.unitPrice)}</span>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <Plus size={16} />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {partFields.map((field, idx) => (
          <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/20 transition-all gap-4 sm:gap-0">
            <div className="flex-1 w-full">
              <p className="text-sm font-bold text-slate-200 truncate">{watchedParts[idx]?.name}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{formatCurrency(watchedParts[idx]?.unitPrice || 0)} x {watchedParts[idx]?.quantity || 0}</p>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
              <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  type="button"
                  onClick={() => {
                    if (watchedParts[idx].quantity > 1) {
                      const p = watchedParts[idx];
                      updatePart(idx, {
                        ...p,
                        quantity: p.quantity - 1,
                        subtotal: (p.quantity - 1) * p.unitPrice
                      });
                    }
                  }}
                  className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronDown size={16} />
                </button>
                <span className="text-sm font-black w-6 text-center">{watchedParts[idx]?.quantity || 0}</span>
                <button 
                  type="button"
                  onClick={() => {
                    const p = watchedParts[idx];
                    updatePart(idx, {
                      ...p,
                      quantity: p.quantity + 1,
                      subtotal: (p.quantity + 1) * p.unitPrice
                    });
                  }}
                  className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
              <span className="text-sm font-black text-slate-300 w-24 text-right">{formatCurrency(watchedParts[idx]?.subtotal || 0)}</span>
              <button 
                type="button"
                onClick={() => removePart(idx)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        editingItem={null}
        onSave={(data) => {
          saveInventoryItemAPI(data as any).then((savedItem) => {
            if (savedItem && savedItem.id) {
              if (savedItem.category === 'product') {
                appendPart({
                  id: savedItem.id,
                  name: savedItem.name,
                  quantity: 1,
                  unitPrice: savedItem.unitPrice,
                  subtotal: savedItem.unitPrice
                });
                setPartSearch('');
                setIsAddingPart(false);
              } else {
                appendService({
                  name: savedItem.name,
                  price: savedItem.unitPrice
                });
                setServiceSearch('');
                setIsAddingService(false);
              }
              setShowProductModal(false);
            }
          });
        }}
      />
    </div>
  );
};
