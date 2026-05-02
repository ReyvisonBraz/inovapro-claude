import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ServiceOrder } from '../types';
import { useServiceOrderStore } from '../store/useServiceOrderStore';
import { useFilterStore } from '../store/useFilterStore';

export const useServiceOrders = (showToast?: (message: string, type: 'success' | 'error') => void) => {
  const queryClient = useQueryClient();
  const {
    serviceOrdersPage, setServiceOrdersPage,
  } = useServiceOrderStore();

  const { 
    osSearchTerm,
    osStatusFilter,
    osPriorityFilter,
    osSortBy,
    osDateFilter
  } = useFilterStore();

  // Query para buscar ordens de serviço
  const { data: serviceOrdersData, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'service-orders', 
      serviceOrdersPage, 
      osSearchTerm, 
      osStatusFilter, 
      osPriorityFilter, 
      osSortBy, 
      osDateFilter
    ],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: serviceOrdersPage.toString(),
        limit: '20',
        search: osSearchTerm,
        status: osStatusFilter,
        priority: osPriorityFilter,
        sortBy: osSortBy,
        dateFilter: osDateFilter
      });

      const { data } = await api.get(`/service-orders?${query.toString()}`);
      return data;
    },
  });

  // Queries para dados de configuração (caching automático)
  const { data: serviceOrderStatuses } = useQuery({
    queryKey: ['service-order-statuses'],
    queryFn: async () => {
      const { data } = await api.get('/service-order-statuses');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const { data: equipmentTypes } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: async () => {
      const { data } = await api.get('/equipment-types');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const { data } = await api.get('/models');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Mutações
  const saveMutation = useMutation({
    mutationFn: async ({ order, id }: { order: any; id?: number }) => {
      if (id) {
        const { data } = await api.put(`/service-orders/${id}`, order);
        return data;
      } else {
        const { data } = await api.post('/service-orders', order);
        return data;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      if (!variables.id && showToast) {
        showToast('Ordem de serviço salva com sucesso!', 'success');
      }
    },
    onError: (error: any) => {
      console.error('Failed to save service order', error);
      if (showToast) showToast(error.response?.data?.error || 'Erro ao salvar ordem de serviço.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/service-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      if (showToast) showToast('Ordem de serviço excluída com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete service order', error);
      if (showToast) showToast(error.response?.data?.error || 'Erro ao excluir ordem de serviço.', 'error');
    },
  });

  // Mutações para configurações
  const addStatusMutation = useMutation({
    mutationFn: (status: any) => api.post('/service-order-statuses', status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-order-statuses'] }),
  });

  const deleteStatusMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/service-order-statuses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-order-statuses'] }),
  });

  const addEquipmentTypeMutation = useMutation({
    mutationFn: (type: any) => api.post('/equipment-types', type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment-types'] }),
  });

  const deleteEquipmentTypeMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/equipment-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment-types'] }),
  });

  const addBrandMutation = useMutation({
    mutationFn: (brand: any) => api.post('/brands', brand),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/brands/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  const addModelMutation = useMutation({
    mutationFn: (model: any) => api.post('/models', model),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['models'] }),
  });

  const updateModelMutation = useMutation({
    mutationFn: ({ id, model }: { id: number; model: any }) => api.put(`/models/${id}`, model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/models/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['models'] }),
  });

  const updateEquipmentTypeMutation = useMutation({
    mutationFn: ({ id, type }: { id: number; type: any }) => api.put(`/equipment-types/${id}`, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-types'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, brand }: { id: number; brand: any }) => api.put(`/brands/${id}`, brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    },
  });

  // API wrappers que retornam void (para compatibilidade com Settings)
  const addBrandAPI = async (name: string, equipmentType: string): Promise<void> => {
    await addBrandMutation.mutateAsync({ name, equipmentType });
  };
  const updateBrandAPI = async (id: number, name: string, equipmentType: string): Promise<void> => {
    await updateBrandMutation.mutateAsync({ id, brand: { name, equipmentType } });
  };
  const deleteBrandAPI = async (id: number): Promise<void> => {
    await deleteBrandMutation.mutateAsync(id);
  };
  const addModelAPI = async (brandId: number, name: string): Promise<void> => {
    await addModelMutation.mutateAsync({ brandId, name });
  };
  const updateModelAPI = async (id: number, brandId: number, name: string): Promise<void> => {
    await updateModelMutation.mutateAsync({ id, model: { brandId, name } });
  };
  const deleteModelAPI = async (id: number): Promise<void> => {
    await deleteModelMutation.mutateAsync(id);
  };
  const addEquipmentTypeAPI = async (name: string, icon?: string): Promise<void> => {
    await addEquipmentTypeMutation.mutateAsync({ name, icon });
  };
  const updateEquipmentTypeAPI = async (id: number, name: string, icon?: string): Promise<void> => {
    await updateEquipmentTypeMutation.mutateAsync({ id, type: { name, icon } });
  };
  const deleteEquipmentTypeAPI = async (id: number): Promise<void> => {
    await deleteEquipmentTypeMutation.mutateAsync(id);
  };

  return {
    serviceOrders: serviceOrdersData || { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } },
    serviceOrdersPage,
    setServiceOrdersPage,
    serviceOrderStatuses: serviceOrderStatuses || [],
    equipmentTypes: equipmentTypes || [],
    brands: brands || [],
    models: models || [],
    fetchServiceOrders: refetch,
    saveServiceOrderAPI: (order: any, id?: number) => saveMutation.mutateAsync({ order, id }),
    deleteServiceOrderAPI: (id: number) => deleteMutation.mutateAsync(id),
    addServiceOrderStatusAPI: (status: any) => addStatusMutation.mutateAsync(status),
    deleteServiceOrderStatusAPI: (id: number) => deleteStatusMutation.mutateAsync(id),
    addBrandAPI,
    updateBrandAPI,
    deleteBrandAPI,
    addModelAPI,
    updateModelAPI,
    deleteModelAPI,
    addEquipmentTypeAPI,
    updateEquipmentTypeAPI,
    deleteEquipmentTypeAPI,
    isLoading,
    isError
  };
};
