import React, { useState } from 'react';
import { Inventory } from '../components/Inventory';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../components/ui/Toast';
import { useFilterStore } from '../store/useFilterStore';
import { useAppStore } from '../store/useAppStore';
import { useModalStore } from '../store/useModalStore';
import { InventoryItem } from '../types';

export const InventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const { 
    inventorySearchTerm, setInventorySearchTerm,
    inventoryCategoryFilter, setInventoryCategoryFilter
  } = useFilterStore();
  const { isAddingInventoryItem, setIsAddingInventoryItem } = useAppStore();
  const { openConfirm } = useModalStore();

  const { 
    inventoryItems, 
    saveInventoryItemAPI, 
    deleteInventoryItemAPI 
  } = useInventory(showToast);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'product' as 'product' | 'service',
    sku: '',
    unitPrice: '',
    stockLevel: ''
  });

  return (
    <Inventory 
      items={inventoryItems}
      onAddItem={(item) => saveInventoryItemAPI(item)}
      onUpdateItem={(id, item) => saveInventoryItemAPI(item, id)}
      onDeleteItem={deleteInventoryItemAPI}
      searchTerm={inventorySearchTerm}
      onSearchChange={setInventorySearchTerm}
      categoryFilter={inventoryCategoryFilter}
      onCategoryFilterChange={setInventoryCategoryFilter}
      isAdding={isAddingInventoryItem}
      setIsAdding={setIsAddingInventoryItem}
      onOpenConfirm={openConfirm}
      editingItem={editingItem}
      setEditingItem={setEditingItem}
      newItem={newItem}
      setNewItem={setNewItem}
      showToast={showToast}
    />
  );
};

export default InventoryPage;
