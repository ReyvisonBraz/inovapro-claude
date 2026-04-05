import { create } from 'zustand';
import { AppSettings, Screen } from '../types';

interface AppState {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  
  fontSize: number;
  setFontSize: (size: number) => void;

  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notificationTab: 'payments' | 'service-orders';
  setNotificationTab: (tab: 'payments' | 'service-orders') => void;

  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  isAddingServiceOrder: boolean;
  setIsAddingServiceOrder: (isAdding: boolean) => void;
  isAddingInventoryItem: boolean;
  setIsAddingInventoryItem: (isAdding: boolean) => void;
  isAddingCustomer: boolean;
  setIsAddingCustomer: (isAdding: boolean) => void;
  customerRegistrationSource: 'customers' | 'service-orders' | 'payments' | null;
  setCustomerRegistrationSource: (source: 'customers' | 'service-orders' | 'payments' | null) => void;
  isAddingClientPayment: boolean;
  setIsAddingClientPayment: (isAdding: boolean) => void;
  
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;

  isSearchingOS: boolean;
  setIsSearchingOS: (isSearching: boolean) => void;

  directOsId: number | null;
  setDirectOsId: (id: number | null) => void;
  directMode: string | null;
  setDirectMode: (mode: string | null) => void;

  expandedPayments: (number | string)[];
  setExpandedPayments: (ids: (number | string)[]) => void;
  togglePaymentExpansion: (id: number | string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeScreen: 'dashboard',
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  
  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: (isCollapsed) => set({ isSidebarCollapsed: isCollapsed }),
  
  fontSize: parseInt(localStorage.getItem('app_font_size') || '16', 10),
  setFontSize: (size) => {
    localStorage.setItem('app_font_size', size.toString());
    document.documentElement.style.fontSize = `${size}px`;
    set({ fontSize: size });
  },

  showNotifications: false,
  setShowNotifications: (show) => set({ showNotifications: show }),
  notificationTab: 'payments',
  setNotificationTab: (tab) => set({ notificationTab: tab }),

  isAdding: false,
  setIsAdding: (isAdding) => set({ isAdding: isAdding }),
  isAddingServiceOrder: false,
  setIsAddingServiceOrder: (isAdding) => set({ isAddingServiceOrder: isAdding }),
  isAddingInventoryItem: false,
  setIsAddingInventoryItem: (isAdding) => set({ isAddingInventoryItem: isAdding }),
  isAddingCustomer: false,
  setIsAddingCustomer: (isAdding) => set({ isAddingCustomer: isAdding }),
  customerRegistrationSource: null,
  setCustomerRegistrationSource: (source) => set({ customerRegistrationSource: source }),
  isAddingClientPayment: false,
  setIsAddingClientPayment: (isAdding) => set({ isAddingClientPayment: isAdding }),

  isSaving: false,
  setIsSaving: (isSaving) => set({ isSaving: isSaving }),

  isSearchingOS: false,
  setIsSearchingOS: (isSearching) => set({ isSearchingOS: isSearching }),

  directOsId: null,
  setDirectOsId: (id) => set({ directOsId: id }),
  directMode: null,
  setDirectMode: (mode) => set({ directMode: mode }),

  expandedPayments: [],
  setExpandedPayments: (ids) => set({ expandedPayments: ids }),
  togglePaymentExpansion: (id) => set((state) => ({
    expandedPayments: state.expandedPayments.includes(id)
      ? state.expandedPayments.filter(pId => pId !== id)
      : [...state.expandedPayments, id]
  })),
}));
