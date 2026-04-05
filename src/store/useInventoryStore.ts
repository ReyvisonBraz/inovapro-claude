import { create } from 'zustand';
import { InventoryItem } from '../types';

interface InventoryState {
  inventoryItems: InventoryItem[];
  setInventoryItems: (items: InventoryItem[]) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  inventoryItems: [],
  setInventoryItems: (inventoryItems) => set({ inventoryItems }),
}));
