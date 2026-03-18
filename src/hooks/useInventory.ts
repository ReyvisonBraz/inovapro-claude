import { useState, useCallback } from 'react';
import { InventoryItem, ServiceOrder, ServiceOrderStatus, Brand, Model } from '../types';
import { api } from '../services/api';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [serviceOrderStatuses, setServiceOrderStatuses] = useState<ServiceOrderStatus[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const fetchInventory = useCallback(async () => {
    try {
      const data = await api.get('/api/inventory');
      setInventory(data);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    }
  }, []);

  const fetchServiceOrders = useCallback(async () => {
    try {
      const data = await api.get('/api/service-orders');
      setServiceOrders(data);
    } catch (err) {
      console.error("Failed to fetch service orders", err);
    }
  }, []);

  const fetchServiceOrderStatuses = useCallback(async () => {
    try {
      const data = await api.get('/api/service-order-statuses');
      setServiceOrderStatuses(data);
    } catch (err) {
      console.error("Failed to fetch service order statuses", err);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const data = await api.get('/api/brands');
      setBrands(data);
    } catch (err) {
      console.error("Failed to fetch brands", err);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const data = await api.get('/api/models');
      setModels(data);
    } catch (err) {
      console.error("Failed to fetch models", err);
    }
  }, []);

  const addInventoryItem = useCallback(async (item: any) => {
    try {
      await api.post('/api/inventory', item);
      fetchInventory();
      return true;
    } catch (err) {
      console.error("Failed to add inventory item", err);
      return false;
    }
  }, [fetchInventory]);

  const updateInventoryItem = useCallback(async (id: number, item: any) => {
    try {
      await api.put(`/api/inventory/${id}`, item);
      fetchInventory();
      return true;
    } catch (err) {
      console.error("Failed to update inventory item", err);
      return false;
    }
  }, [fetchInventory]);

  const deleteInventoryItem = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/inventory/${id}`);
      fetchInventory();
      return true;
    } catch (err) {
      console.error("Failed to delete inventory item", err);
      return false;
    }
  }, [fetchInventory]);

  const addServiceOrder = useCallback(async (so: any) => {
    try {
      await api.post('/api/service-orders', so);
      fetchServiceOrders();
      return true;
    } catch (err) {
      console.error("Failed to add service order", err);
      return false;
    }
  }, [fetchServiceOrders]);

  const updateServiceOrder = useCallback(async (id: number, so: any) => {
    try {
      await api.put(`/api/service-orders/${id}`, so);
      fetchServiceOrders();
      return true;
    } catch (err) {
      console.error("Failed to update service order", err);
      return false;
    }
  }, [fetchServiceOrders]);

  const deleteServiceOrder = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/service-orders/${id}`);
      fetchServiceOrders();
      return true;
    } catch (err) {
      console.error("Failed to delete service order", err);
      return false;
    }
  }, [fetchServiceOrders]);

  return { 
    inventory, 
    serviceOrders, 
    serviceOrderStatuses, 
    brands, 
    models,
    fetchInventory,
    fetchServiceOrders,
    fetchServiceOrderStatuses,
    fetchBrands,
    fetchModels,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addServiceOrder,
    updateServiceOrder,
    deleteServiceOrder
  };
};
