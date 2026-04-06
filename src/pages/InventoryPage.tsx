import React, { useState, useEffect } from 'react';
import { Inventory } from '../components/inventory/Inventory';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../components/ui/Toast';
import { useFilterStore } from '../store/useFilterStore';
import { useAppStore } from '../store/useAppStore';
import { useModalStore } from '../store/useModalStore';
import { useDebounce } from '../hooks/useDebounce';
import { InventoryItem } from '../types';

export const InventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const { 
    inventorySearchTerm, setInventorySearchTerm,
    inventoryCategoryFilter, setInventoryCategoryFilter
  } = useFilterStore();
  const [localSearchTerm, setLocalSearchTerm] = useState(inventorySearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  useEffect(() => {
    setInventorySearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setInventorySearchTerm]);

  const { isAddingInventoryItem, setIsAddingInventoryItem } = useAppStore();
  const { openConfirm } = useModalStore();

  const { 
    inventoryItems, 
    saveInventoryItemAPI, 
    deleteInventoryItemAPI
  } = useInventory(showToast);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  return (
    <Inventory 
      items={inventoryItems}
      onAddItem={(item) => saveInventoryItemAPI(item)}
      onUpdateItem={(id, item) => saveInventoryItemAPI(item, id)}
      onDeleteItem={deleteInventoryItemAPI}
      searchTerm={localSearchTerm}
      onSearchChange={setLocalSearchTerm}
      categoryFilter={inventoryCategoryFilter}
      onCategoryFilterChange={setInventoryCategoryFilter}
      isAdding={isAddingInventoryItem}
      setIsAdding={setIsAddingInventoryItem}
      onOpenConfirm={openConfirm}
      editingItem={editingItem}
      setEditingItem={setEditingItem}
      showToast={showToast}
    />
  );
};

export default InventoryPage;
