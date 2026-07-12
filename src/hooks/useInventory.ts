import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { InventoryItem } from '../types';
import { useCrudApi } from './useCrudApi';

export function useInventory(showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void) {

  // Query para buscar itens do estoque
  const { data: inventoryItems, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory'],
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await api.get('/inventory');
      return data;
    },
  });

  const { saveMutation, deleteMutation } = useCrudApi({
    baseKey: 'inventory',
    endpoint: '/inventory',
    saveSuccessMessage: 'Item de estoque salvo com sucesso!',
    deleteSuccessMessage: 'Item excluído com sucesso!',
    showToast,
  });

  return {
    inventoryItems: inventoryItems || [],
    fetchInventoryItems: refetch,
    saveInventoryItemAPI: (item: Partial<InventoryItem>, id?: number) => saveMutation.mutateAsync({ item: item, id }),
    deleteInventoryItemAPI: (id: number) => deleteMutation.mutateAsync(id),
    isLoading,
    isError
  };
}
