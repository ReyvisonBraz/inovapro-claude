import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface CrudApiOptions {
  baseKey: string;
  endpoint: string;
  saveSuccessMessage?: string;
  deleteSuccessMessage?: string;
  extraInvalidations?: string[][];
  onSaveSuccess?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useCrudApi({
  baseKey,
  endpoint,
  saveSuccessMessage = 'Salvo com sucesso!',
  deleteSuccessMessage = 'Excluído com sucesso!',
  extraInvalidations,
  onSaveSuccess,
  showToast,
}: CrudApiOptions) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({ item, id }: { item: unknown; id?: number }) => {
      const { data } = id
        ? await api.put(`${endpoint}/${id}`, item)
        : await api.post(endpoint, item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [baseKey] });
      extraInvalidations?.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      showToast(saveSuccessMessage, 'success');
      onSaveSuccess?.();
    },
    onError: (error: any) => {
      if (error.response?.status === 409) return;
      showToast(error.response?.data?.error ?? 'Erro ao salvar.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [baseKey] });
      extraInvalidations?.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      showToast(deleteSuccessMessage, 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error ?? 'Erro ao excluir.', 'error');
    },
  });

  return { saveMutation, deleteMutation };
}
