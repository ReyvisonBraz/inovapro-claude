import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormData } from '../../../schemas/productSchema';
import { cn } from '../../../lib/utils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: any;
  onSave: (data: ProductFormData) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: 'product',
      sku: '',
      unitPrice: 0 as any,
      stockLevel: '0' as any
    }
  });

  const categoryValue = watch('category');

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        reset({
          name: editingItem.name,
          category: editingItem.category,
          sku: editingItem.sku || '',
          unitPrice: editingItem.unitPrice.toString(),
          stockLevel: editingItem.stockLevel.toString()
        });
      } else {
        reset({
          name: '',
          category: 'product',
          sku: '',
          unitPrice: '' as any,
          stockLevel: '0' as any
        });
      }
    }
  }, [isOpen, editingItem, reset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-modal p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingItem ? 'Editar Item' : 'Novo Item'}</h3>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSave)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('category', 'product')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all border",
                      categoryValue === 'product' 
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                        : "bg-white/5 text-slate-400 border-transparent hover:bg-white/10"
                    )}
                  >
                    Produto
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('category', 'service')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all border",
                      categoryValue === 'service' 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : "bg-white/5 text-slate-400 border-transparent hover:bg-white/10"
                    )}
                  >
                    Serviço
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex justify-between">
                  <span>Nome</span>
                  {errors.name && <span className="text-[8px] text-red-500 italic">{errors.name.message}</span>}
                </label>
                <input 
                  {...register('name')}
                  className={cn(
                    "w-full h-12 bg-white/5 border rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none",
                    errors.name ? "border-red-500/50" : "border-white/10"
                  )}
                  placeholder="Ex: Formatação de PC, Memória RAM 8GB..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">SKU / Código</label>
                  <input 
                    {...register('sku')}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex justify-between">
                    <span>Preço (R$)</span>
                    {errors.unitPrice && <span className="text-[8px] text-red-500 italic">{errors.unitPrice.message}</span>}
                  </label>
                  <input 
                    type="text"
                    {...register('unitPrice')}
                    className={cn(
                      "w-full h-12 bg-white/5 border rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none",
                      errors.unitPrice ? "border-red-500/50" : "border-white/10"
                    )}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {categoryValue === 'product' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Quantidade em Estoque</label>
                  <input 
                    type="number"
                    {...register('stockLevel')}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="0"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : (editingItem ? 'Salvar Alterações' : 'Adicionar Item')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
