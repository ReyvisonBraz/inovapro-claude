import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { InventoryItem } from '../types';

export function useInventory(showToast: (message: string, type: 'success' | 'error') => void) {
  const queryClient = useQueryClient();

  // Query para buscar itens do estoque
  const { data: inventoryItems, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data } = await api.get('/inventory');
      return data;
    },
  });

  // Mutação para salvar/editar item
  const saveMutation = useMutation({
    mutationFn: async ({ item, id }: { item: Partial<InventoryItem>; id?: number }) => {
      if (id) {
        const { data } = await api.put(`/inventory/${id}`, item);
        return data;
      } else {
        const { data } = await api.post('/inventory', item);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      showToast('Item de estoque salvo com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save inventory item', error);
      showToast(error.response?.data?.error || 'Erro ao salvar item de estoque.', 'error');
    },
  });

  // Mutação para excluir item
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      showToast('Item excluído com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete inventory item', error);
      showToast(error.response?.data?.error || 'Erro ao excluir item.', 'error');
    },
  });

  return {
    inventoryItems: inventoryItems || [],
    fetchInventoryItems: refetch,
    saveInventoryItemAPI: (item: Partial<InventoryItem>, id?: number) => saveMutation.mutateAsync({ item, id }),
    deleteInventoryItemAPI: (id: number) => deleteMutation.mutateAsync(id),
    isLoading,
    isError
  };
}
