import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AppSettings, Category } from '../types';
import { useSettingsStore } from '../store/useSettingsStore';

export function useSettings(showToast: (message: string, type: 'success' | 'error') => void) {
  const queryClient = useQueryClient();
  const { setSettings, setCategories } = useSettingsStore();

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await axios.get('/api/settings');
      setSettings(data);
      return data as AppSettings;
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axios.get('/api/categories');
      setCategories(data);
      return data as Category[];
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: AppSettings) => {
      const { data } = await axios.post('/api/settings', newSettings);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSettings(data);
      showToast('Configurações salvas com sucesso!', 'success');
    },
    onError: () => {
      showToast('Erro ao salvar configurações.', 'error');
    }
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (category: any) => {
      const { data } = await axios.post('/api/categories', category);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  return {
    settings,
    isLoadingSettings,
    categories,
    saveSettingsAPI: (newSettings: AppSettings) => saveSettingsMutation.mutateAsync(newSettings),
    addCategory: (category: any) => addCategoryMutation.mutateAsync(category),
    deleteCategory: (id: number) => deleteCategoryMutation.mutateAsync(id),
    fetchSettings: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
    fetchCategories: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  };
}
