import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DateFilterMode = 'day' | 'month' | 'range' | 'all';
export type PaymentSortMode = 'date' | 'amount' | 'alphabetical';

interface FilterContextType {
  // Transaction filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
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
  dateFilterMode: DateFilterMode;
  setDateFilterMode: (mode: DateFilterMode) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;

  // Payment filters
  paymentFilterStatus: string;
  setPaymentFilterStatus: (status: string) => void;
  paymentSortMode: PaymentSortMode;
  setPaymentSortMode: (mode: PaymentSortMode) => void;

  // Dashboard/Reports
  dashboardMonth: string;
  setDashboardMonth: (month: string) => void;
  reportMonth: string | null;
  setReportMonth: (month: string | null) => void;
  reportView: 'charts' | 'table';
  setReportView: (view: 'charts' | 'table') => void;

  // Reset functions
  resetTransactionFilters: () => void;
  resetPaymentFilters: () => void;
  resetAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const getDefaultDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const getDefaultMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getStartOfMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const getEndOfMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
};

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Transaction filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('day');
  const [selectedDate, setSelectedDate] = useState(getDefaultDate);
  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth);
  const [startDate, setStartDate] = useState(getStartOfMonth);
  const [endDate, setEndDate] = useState(getEndOfMonth);

  // Payment filters
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('all');
  const [paymentSortMode, setPaymentSortMode] = useState<PaymentSortMode>('date');

  // Dashboard/Reports
  const [dashboardMonth, setDashboardMonth] = useState(getDefaultMonth);
  const [reportMonth, setReportMonth] = useState<string | null>(null);
  const [reportView, setReportView] = useState<'charts' | 'table'>('charts');

  const resetTransactionFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setShowFilters(false);
    setDateFilterMode('day');
    setSelectedDate(getDefaultDate);
    setSelectedMonth(getDefaultMonth);
    setStartDate(getStartOfMonth);
    setEndDate(getEndOfMonth);
  };

  const resetPaymentFilters = () => {
    setPaymentFilterStatus('all');
    setPaymentSortMode('date');
  };

  const resetAllFilters = () => {
    resetTransactionFilters();
    resetPaymentFilters();
    setDashboardMonth(getDefaultMonth);
    setReportMonth(null);
    setReportView('charts');
  };

  return (
    <FilterContext.Provider value={{
      searchTerm,
      setSearchTerm,
      filterType,
      setFilterType,
      filterCategory,
      setFilterCategory,
      filterMinAmount,
      setFilterMinAmount,
      filterMaxAmount,
      setFilterMaxAmount,
      showFilters,
      setShowFilters,
      dateFilterMode,
      setDateFilterMode,
      selectedDate,
      setSelectedDate,
      selectedMonth,
      setSelectedMonth,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      paymentFilterStatus,
      setPaymentFilterStatus,
      paymentSortMode,
      setPaymentSortMode,
      dashboardMonth,
      setDashboardMonth,
      reportMonth,
      setReportMonth,
      reportView,
      setReportView,
      resetTransactionFilters,
      resetPaymentFilters,
      resetAllFilters,
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
