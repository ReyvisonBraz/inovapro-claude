import { useState, useCallback } from 'react';
import { ServiceOrder, ServiceOrderStatus, Brand, Model } from '../types';

export const useServiceOrders = () => {
  const [serviceOrders, setServiceOrders] = useState<{ data: ServiceOrder[], meta: any }>({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  const [serviceOrdersPage, setServiceOrdersPage] = useState(1);
  const [serviceOrderStatuses, setServiceOrderStatuses] = useState<ServiceOrderStatus[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<{id: number, name: string}[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const fetchServiceOrders = useCallback(async (page: number = 1, search: string = '') => {
    try {
      const res = await fetch(`/api/service-orders?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setServiceOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch service orders", err);
      throw err;
    }
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

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
