import { useState, useCallback } from 'react';
import { InventoryItem } from '../types';

export function useInventory(showToast: (message: string, type: 'success' | 'error') => void) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const fetchInventoryItems = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setInventoryItems(data);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
      showToast('Erro ao carregar estoque.', 'error');
    }
  }, [showToast]);

  const saveInventoryItemAPI = useCallback(async (item: Partial<InventoryItem>, id?: number) => {
    const url = id ? `/api/inventory/${id}` : '/api/inventory';
    const method = id ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to save inventory item');
    }
    
    return await res.json();
  }, []);

  const deleteInventoryItemAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete inventory item');
  }, []);

  return {
    inventoryItems,
    fetchInventoryItems,
    saveInventoryItemAPI,
    deleteInventoryItemAPI
  };
}
