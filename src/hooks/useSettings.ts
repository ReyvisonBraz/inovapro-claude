import { useCallback } from 'react';
import { AppSettings } from '../types';
import { useSettingsStore } from '../store/useSettingsStore';

export function useSettings(showToast: (message: string, type: 'success' | 'error') => void) {
  const { 
    settings, setSettings, 
    categories, setCategories,
    fetchSettings: fetchSettingsStore,
    fetchCategories: fetchCategoriesStore,
    saveSettingsAPI: saveSettingsStore
  } = useSettingsStore();

  const fetchSettings = useCallback(async () => {
    await fetchSettingsStore();
  }, [fetchSettingsStore]);

  const fetchCategories = useCallback(async () => {
    await fetchCategoriesStore();
  }, [fetchCategoriesStore]);

  const saveSettingsAPI = useCallback(async (newSettings: AppSettings) => {
    try {
      await saveSettingsStore(newSettings);
      showToast('Configurações salvas com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao salvar configurações.', 'error');
    }
  }, [saveSettingsStore, showToast]);

  const addCategory = useCallback(async (category: any) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!res.ok) throw new Error('Failed to add category');
      fetchCategoriesStore();
    } catch (err) {
      console.error("Failed to add category", err);
    }
  }, [fetchCategoriesStore]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete category');
      fetchCategoriesStore();
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  }, [fetchCategoriesStore]);

  return {
    settings,
    setSettings,
    categories,
    setCategories,
    fetchSettings,
    fetchCategories,
    saveSettingsAPI,
    addCategory,
    deleteCategory
  };
}
