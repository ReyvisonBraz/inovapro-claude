import { useState, useCallback } from 'react';
import { InventoryItem, ServiceOrder, ServiceOrderStatus, Brand, Model } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [serviceOrderStatuses, setServiceOrderStatuses] = useState<ServiceOrderStatus[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const { showToast } = useToast();

  const fetchInventory = useCallback(async () => {
    try {
      const data = await api.get('/api/inventory');
      setInventory(data);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
      showToast("Erro ao carregar inventário.", "error");
    }
  }, [showToast]);

  const fetchServiceOrders = useCallback(async () => {
    try {
      const data = await api.get('/api/service-orders');
      setServiceOrders(data);
    } catch (err) {
      console.error("Failed to fetch service orders", err);
      showToast("Erro ao carregar ordens de serviço.", "error");
    }
  }, [showToast]);

  const fetchServiceOrderStatuses = useCallback(async () => {
    try {
      const data = await api.get('/api/service-order-statuses');
      setServiceOrderStatuses(data);
    } catch (err) {
      console.error("Failed to fetch service order statuses", err);
      showToast("Erro ao carregar status de ordens de serviço.", "error");
    }
  }, [showToast]);

  const fetchBrands = useCallback(async () => {
    try {
      const data = await api.get('/api/brands');
      setBrands(data);
    } catch (err) {
      console.error("Failed to fetch brands", err);
      showToast("Erro ao carregar marcas.", "error");
    }
  }, [showToast]);

  const fetchModels = useCallback(async () => {
    try {
      const data = await api.get('/api/models');
      setModels(data);
    } catch (err) {
      console.error("Failed to fetch models", err);
      showToast("Erro ao carregar modelos.", "error");
    }
  }, [showToast]);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    try {
      await api.post('/api/inventory', item);
      fetchInventory();
      return true;
    } catch (err) {
      console.error("Failed to add inventory item", err);
      showToast("Erro ao adicionar item ao inventário.", "error");
      return false;
    }
  }, [fetchInventory, showToast]);

  const updateInventoryItem = useCallback(async (id: number, item: Partial<InventoryItem>) => {
    try {
      await api.put(`/api/inventory/${id}`, item);
      fetchInventory();
      return true;
    } catch (err) {
      console.error("Failed to update inventory item", err);
      showToast("Erro ao atualizar item do inventário.", "error");
      return false;
    }
  }, [fetchInventory, showToast]);

  const deleteInventoryItem = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/inventory/${id}`);
      fetchInventory();
      return true;
    } catch (err) {
      console.error("Failed to delete inventory item", err);
      showToast("Erro ao excluir item do inventário.", "error");
      return false;
    }
  }, [fetchInventory, showToast]);

  const addServiceOrder = useCallback(async (so: Omit<ServiceOrder, 'id'>) => {
    try {
      await api.post('/api/service-orders', so);
      fetchServiceOrders();
      return true;
    } catch (err) {
      console.error("Failed to add service order", err);
      showToast("Erro ao adicionar ordem de serviço.", "error");
      return false;
    }
  }, [fetchServiceOrders, showToast]);

  const updateServiceOrder = useCallback(async (id: number, so: Partial<ServiceOrder>) => {
    try {
      await api.put(`/api/service-orders/${id}`, so);
      fetchServiceOrders();
      return true;
    } catch (err) {
      console.error("Failed to update service order", err);
      showToast("Erro ao atualizar ordem de serviço.", "error");
      return false;
    }
  }, [fetchServiceOrders, showToast]);

  const deleteServiceOrder = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/service-orders/${id}`);
      fetchServiceOrders();
      return true;
    } catch (err) {
      console.error("Failed to delete service order", err);
      showToast("Erro ao excluir ordem de serviço.", "error");
      return false;
    }
  }, [fetchServiceOrders, showToast]);

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
