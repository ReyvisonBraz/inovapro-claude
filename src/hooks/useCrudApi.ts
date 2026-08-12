import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { mergeSavedRecord, upsertCachedRecord } from '../lib/query-cache';

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
    onSuccess: (data, variables) => {
      const saved = mergeSavedRecord(variables.item, data, variables.id);
      queryClient.setQueriesData(
        { queryKey: [baseKey] },
        current => upsertCachedRecord(current, saved),
      );
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
    onSuccess: (_data, id) => {
      queryClient.setQueriesData({ queryKey: [baseKey] }, current => {
        if (current == null) return current;
        if (Array.isArray(current)) return current.filter((record: any) => record.id !== id);
        if (typeof current === 'object' && Array.isArray((current as any).data)) {
          const { data, meta } = current as { data: any[]; meta?: any };
          return {
            ...current,
            data: data.filter(record => record.id !== id),
            meta: meta ? { ...meta, total: Math.max(0, Number(meta.total ?? data.length) - 1) } : meta,
          };
        }
        return current;
      });
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
