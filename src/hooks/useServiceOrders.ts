import { useCallback } from 'react';
import { ServiceOrder, ServiceOrderStatus, Brand, Model } from '../types';
import { useServiceOrderStore } from '../store/useServiceOrderStore';
import { useFilterStore } from '../store/useFilterStore';

export const useServiceOrders = () => {
  const {
    serviceOrders, setServiceOrders,
    serviceOrdersPage, setServiceOrdersPage,
    serviceOrderStatuses, setServiceOrderStatuses,
    equipmentTypes, setEquipmentTypes,
    brands, setBrands,
    models, setModels
  } = useServiceOrderStore();

  const { 
    osSearchTerm,
    osStatusFilter,
    osPriorityFilter,
    osSortBy,
    osDateFilter
  } = useFilterStore();

  const fetchServiceOrders = useCallback(async (page?: number, search?: string, status?: string, priority?: string, sortBy?: string, dateFilter?: string) => {
    // Use provided values or fall back to store values
    const targetPage = page !== undefined ? page : serviceOrdersPage;
    const targetSearch = search !== undefined ? search : osSearchTerm;
    const targetStatus = status !== undefined ? status : osStatusFilter;
    const targetPriority = priority !== undefined ? priority : osPriorityFilter;
    const targetSortBy = sortBy !== undefined ? sortBy : osSortBy;
    const targetDateFilter = dateFilter !== undefined ? dateFilter : osDateFilter;

    try {
      const query = new URLSearchParams({
        page: targetPage.toString(),
        limit: '20',
        search: targetSearch,
        status: targetStatus,
        priority: targetPriority,
        sortBy: targetSortBy,
        dateFilter: targetDateFilter
      });

      const res = await fetch(`/api/service-orders?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setServiceOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch service orders", err);
      throw err;
    }
  }, [serviceOrdersPage, osSearchTerm, osStatusFilter, osPriorityFilter, osSortBy, setServiceOrders]);

  // Auto-fetch when page or search term changes
  // Note: We only do this if we are authenticated, but the hook doesn't know about auth.
  // So we'll rely on the caller or just let it fetch (server will return 401 if not auth).
  // Actually, it's better to keep the fetch in App.tsx or the page component to have more control.
  // But let's add it here to ensure it's always up to date when used.
  // React.useEffect(() => {
  //   fetchServiceOrders();
  // }, [fetchServiceOrders]);
  // Wait, I'll use the one in App.tsx and ServiceOrdersPage.tsx for now.

  const fetchServiceOrderStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/service-order-statuses');
      if (res.ok) {
        const data = await res.json();
        setServiceOrderStatuses(data);
      }
    } catch (err) {
      console.error("Failed to fetch service order statuses", err);
      throw err;
    }
  }, [setServiceOrderStatuses]);

  const fetchEquipmentTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/equipment-types');
      if (res.ok) {
        const data = await res.json();
        setEquipmentTypes(data);
      }
    } catch (err) {
      console.error("Failed to fetch equipment types", err);
      throw err;
    }
  }, [setEquipmentTypes]);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/brands');
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      }
    } catch (err) {
      console.error("Failed to fetch brands", err);
      throw err;
    }
  }, [setBrands]);

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        setModels(data);
      }
    } catch (err) {
      console.error("Failed to fetch models", err);
      throw err;
    }
  }, [setModels]);

  const saveServiceOrderAPI = useCallback(async (order: any, id?: number) => {
    const url = id ? `/api/service-orders/${id}` : '/api/service-orders';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to save service order');
    }
    
    return await res.json();
  }, []);

  const deleteServiceOrderAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/service-orders/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete service order');
  }, []);

  const addServiceOrderStatusAPI = useCallback(async (status: any) => {
    const res = await fetch('/api/service-order-statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status)
    });
    if (!res.ok) throw new Error('Failed to add status');
  }, []);

  const deleteServiceOrderStatusAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/service-order-statuses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete status');
  }, []);

  const addEquipmentTypeAPI = useCallback(async (name: string, icon?: string) => {
    const res = await fetch('/api/equipment-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon })
    });
    if (!res.ok) throw new Error('Failed to add equipment type');
  }, []);

  const deleteEquipmentTypeAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/equipment-types/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete equipment type');
  }, []);

  const addBrandAPI = useCallback(async (name: string, equipmentType: string) => {
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, equipmentType })
    });
    if (!res.ok) throw new Error('Failed to add brand');
  }, []);

  const deleteBrandAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete brand');
  }, []);

  const addModelAPI = useCallback(async (brandId: number, name: string) => {
    const res = await fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandId, name })
    });
    if (!res.ok) throw new Error('Failed to add model');
  }, []);

  const deleteModelAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/models/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete model');
  }, []);

  return {
    serviceOrders,
    serviceOrdersPage,
    setServiceOrdersPage,
    serviceOrderStatuses,
    equipmentTypes,
    brands,
    models,
    fetchServiceOrders,
    fetchServiceOrderStatuses,
    fetchEquipmentTypes,
    fetchBrands,
    fetchModels,
    saveServiceOrderAPI,
    deleteServiceOrderAPI,
    addServiceOrderStatusAPI,
    deleteServiceOrderStatusAPI,
    addEquipmentTypeAPI,
    deleteEquipmentTypeAPI,
    addBrandAPI,
    deleteBrandAPI,
    addModelAPI,
    deleteModelAPI
  };
};
