import React, { useState } from 'react';
import { Category } from '../../types';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface CategorySettingsProps {
  categories: Category[];
  addCategory: (name: string, type: 'income' | 'expense') => void;
  deleteCategory: (id: number) => void;
}

export const CategorySettings: React.FC<CategorySettingsProps> = ({ categories, addCategory, deleteCategory }) => {
  const [categoryTab, setCategoryTab] = useState<'income' | 'expense'>('income');
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h4 className="text-xl font-bold">Categorias de Lançamentos</h4>
          <p className="text-xs text-slate-500 font-medium">Gerencie as categorias para organizar suas finanças</p>
        </div>
      </div>

      <div className="space-y-4 col-span-full">
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-4">
          <button 
            onClick={() => setCategoryTab('income')}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
              categoryTab === 'income' ? "bg-emerald-500/20 text-emerald-500" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Entradas
          </button>
          <button 
            onClick={() => setCategoryTab('expense')}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
              categoryTab === 'expense' ? "bg-rose-500/20 text-rose-500" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Saídas
          </button>
        </div>

        {categoryTab === 'income' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                value={newIncomeCategory}
                onChange={(e) => setNewIncomeCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newIncomeCategory.trim()) {
                    addCategory(newIncomeCategory.trim(), 'income');
                    setNewIncomeCategory('');
                  }
                }}
                placeholder="Nova categoria de entrada..."
                className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
              <button 
                onClick={() => {
                  if (newIncomeCategory.trim()) {
                    addCategory(newIncomeCategory.trim(), 'income');
                    setNewIncomeCategory('');
                  }
                }}
                className="h-12 px-6 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-500/20 transition-all"
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => c.type === 'income').map(cat => (
                <div key={cat.id} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-slate-300">
                  {cat.name}
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className="text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newExpenseCategory.trim()) {
                    addCategory(newExpenseCategory.trim(), 'expense');
                    setNewExpenseCategory('');
                  }
                }}
                placeholder="Nova categoria de saída..."
                className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-rose-500 outline-none transition-all"
              />
              <button 
                onClick={() => {
                  if (newExpenseCategory.trim()) {
                    addCategory(newExpenseCategory.trim(), 'expense');
                    setNewExpenseCategory('');
                  }
                }}
                className="h-12 px-6 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-bold hover:bg-rose-500/20 transition-all"
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => c.type === 'expense').map(cat => (
                <div key={cat.id} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-slate-300">
                  {cat.name}
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className="text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
