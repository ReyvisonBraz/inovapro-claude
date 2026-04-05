import { create } from 'zustand';
import { ServiceOrder, ServiceOrderStatus, EquipmentType, Brand, Model } from '../types';

interface ServiceOrderState {
  serviceOrders: { data: ServiceOrder[], meta: any };
  serviceOrdersPage: number;
  serviceOrderStatuses: ServiceOrderStatus[];
  equipmentTypes: EquipmentType[];
  brands: Brand[];
  models: Model[];
  setServiceOrders: (serviceOrders: { data: ServiceOrder[], meta: any }) => void;
  setServiceOrdersPage: (page: number) => void;
  setServiceOrderStatuses: (statuses: ServiceOrderStatus[]) => void;
  setEquipmentTypes: (types: EquipmentType[]) => void;
  setBrands: (brands: Brand[]) => void;
  setModels: (models: Model[]) => void;
}

export const useServiceOrderStore = create<ServiceOrderState>((set) => ({
  serviceOrders: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
  serviceOrdersPage: 1,
  serviceOrderStatuses: [],
  equipmentTypes: [],
  brands: [],
  models: [],
  setServiceOrders: (serviceOrders) => set({ serviceOrders }),
  setServiceOrdersPage: (serviceOrdersPage) => set({ serviceOrdersPage }),
  setServiceOrderStatuses: (serviceOrderStatuses) => set({ serviceOrderStatuses }),
  setEquipmentTypes: (equipmentTypes) => set({ equipmentTypes }),
  setBrands: (brands) => set({ brands }),
  setModels: (models) => set({ models }),
}));
