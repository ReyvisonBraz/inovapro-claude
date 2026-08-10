import { createContext, useContext } from 'react';
import {
  ServiceOrder, Customer, InventoryItem,
  ServiceOrderStatus, Brand, Model, User, ChecklistTemplate,
} from '../types';

interface ServiceOrderFormContextValue {
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  editingOrder: ServiceOrder | null;
  setEditingOrder: (order: ServiceOrder | null) => void;
  customers: Customer[];
  inventoryItems: InventoryItem[];
  statuses: ServiceOrderStatus[];
  equipmentTypes: { id: number; name: string }[];
  brands: Brand[];
  models: Model[];
  checklistTemplate: ChecklistTemplate;
  deductStockStatuses: string[];
  currentUser: User | null;
  onAddOrder: (order: any) => Promise<number | null>;
  onUpdateOrder: (id: number, order: any, version?: number) => Promise<boolean>;
  onAddEquipmentType: (name: string) => Promise<void>;
  onAddBrand: (name: string, equipmentType: string) => Promise<void>;
  onAddModel: (brandId: number, name: string) => Promise<void>;
  onTriggerAddCustomer: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onOpenConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  setSelectedOrder: (order: ServiceOrder | null) => void;
  setShowWhatsAppModal: (show: boolean) => void;
  setShowQRCodeModal: (show: boolean) => void;
  onGeneratePayment?: (order: any) => void;
}

export const ServiceOrderFormContext = createContext<ServiceOrderFormContextValue | null>(null);

export function useServiceOrderFormContext(): ServiceOrderFormContextValue {
  const ctx = useContext(ServiceOrderFormContext);
  if (!ctx) {
    throw new Error('useServiceOrderFormContext deve ser usado dentro de ServiceOrderFormContext.Provider');
  }
  return ctx;
}
