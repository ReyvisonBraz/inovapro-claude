import { create } from 'zustand';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface FilterState {
  // Transactions Filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFilterMode: 'day' | 'month' | 'range' | 'all';
  setDateFilterMode: (mode: 'day' | 'month' | 'range' | 'all') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  filterType: 'all' | 'income' | 'expense';
  setFilterType: (type: 'all' | 'income' | 'expense') => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterMinAmount: string;
  setFilterMinAmount: (amount: string) => void;
  filterMaxAmount: string;
  setFilterMaxAmount: (amount: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  // Client Payments Filters
  paymentSearchTerm: string;
  setPaymentSearchTerm: (term: string) => void;
  paymentFilterStatus: string;
  setPaymentFilterStatus: (status: string) => void;
  paymentSortMode: 'date' | 'amount' | 'alphabetical';
  setPaymentSortMode: (mode: 'date' | 'amount' | 'alphabetical') => void;

  // Service Orders Filters
  osSearchTerm: string;
  setOsSearchTerm: (term: string) => void;
  osStatusFilter: string;
  setOsStatusFilter: (status: string) => void;
  osPriorityFilter: string;
  setOsPriorityFilter: (priority: string) => void;
  osSortBy: string;
  setOsSortBy: (sortBy: string) => void;
  osDateFilter: string;
  setOsDateFilter: (dateFilter: string) => void;

  // Customer Filters
  customerSearchTerm: string;
  setCustomerSearchTerm: (term: string) => void;

  // Inventory Filters
  inventorySearchTerm: string;
  setInventorySearchTerm: (term: string) => void;
  inventoryCategoryFilter: string;
  setInventoryCategoryFilter: (category: string) => void;

  // Reports Filters
  reportMonth: string | null;
  setReportMonth: (month: string | null) => void;
  reportView: 'charts' | 'table';
  setReportView: (view: 'charts' | 'table') => void;

  // Dashboard Filters
  dashboardMonth: string;
  setDashboardMonth: (month: string) => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  dateFilterMode: 'day',
  setDateFilterMode: (mode) => set({ dateFilterMode: mode }),
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  setSelectedDate: (date) => set({ selectedDate: date }),
  selectedMonth: format(new Date(), 'yyyy-MM'),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  setStartDate: (date) => set({ startDate: date }),
  endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  setEndDate: (date) => set({ endDate: date }),
  filterType: 'all',
  setFilterType: (type) => set({ filterType: type }),
  filterCategory: 'all',
  setFilterCategory: (category) => set({ filterCategory: category }),
  filterMinAmount: '',
  setFilterMinAmount: (amount) => set({ filterMinAmount: amount }),
  filterMaxAmount: '',
  setFilterMaxAmount: (amount) => set({ filterMaxAmount: amount }),
  showFilters: false,
  setShowFilters: (show) => set({ showFilters: show }),

  paymentSearchTerm: '',
  setPaymentSearchTerm: (term) => set({ paymentSearchTerm: term }),
  paymentFilterStatus: 'all',
  setPaymentFilterStatus: (status) => set({ paymentFilterStatus: status }),
  paymentSortMode: 'date',
  setPaymentSortMode: (mode) => set({ paymentSortMode: mode }),

  osSearchTerm: '',
  setOsSearchTerm: (term) => set({ osSearchTerm: term }),
  osStatusFilter: 'all',
  setOsStatusFilter: (status) => set({ osStatusFilter: status }),
  osPriorityFilter: 'all',
  setOsPriorityFilter: (priority) => set({ osPriorityFilter: priority }),
  osSortBy: 'newest',
  setOsSortBy: (sortBy) => set({ osSortBy: sortBy }),
  osDateFilter: 'all',
  setOsDateFilter: (dateFilter) => set({ osDateFilter: dateFilter }),

  customerSearchTerm: '',
  setCustomerSearchTerm: (term) => set({ customerSearchTerm: term }),

  inventorySearchTerm: '',
  setInventorySearchTerm: (term) => set({ inventorySearchTerm: term }),
  inventoryCategoryFilter: 'all',
  setInventoryCategoryFilter: (category) => set({ inventoryCategoryFilter: category }),

  reportMonth: null,
  setReportMonth: (month) => set({ reportMonth: month }),
  reportView: 'charts',
  setReportView: (view) => set({ reportView: view }),

  dashboardMonth: format(new Date(), 'yyyy-MM'),
  setDashboardMonth: (month) => set({ dashboardMonth: month }),
  handlePrevMonth: () => set((state) => {
    const [year, month] = state.dashboardMonth.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    d.setMonth(d.getMonth() - 1);
    return { dashboardMonth: format(d, 'yyyy-MM') };
  }),
  handleNextMonth: () => set((state) => {
    const [year, month] = state.dashboardMonth.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    d.setMonth(d.getMonth() + 1);
    return { dashboardMonth: format(d, 'yyyy-MM') };
  }),
  resetFilters: () => set({
    searchTerm: '',
    dateFilterMode: 'all',
    selectedDate: format(new Date(), 'yyyy-MM-dd'),
    selectedMonth: format(new Date(), 'yyyy-MM'),
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    filterType: 'all',
    filterCategory: 'all',
    filterMinAmount: '',
    filterMaxAmount: '',
  }),
}));
