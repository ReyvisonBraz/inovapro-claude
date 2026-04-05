import React from 'react';
import { Transaction, Category, AppSettings } from '../../types';
import { TransactionFilters } from './TransactionFilters';
import { TransactionList } from './TransactionList';

interface TransactionsProps {
  categories: Category[];
  filteredTransactions: Transaction[];
  handleDuplicateTransaction: (tx: Transaction) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  dateFilterMode: 'day' | 'month' | 'range' | 'all';
  onDateFilterModeChange: (mode: 'day' | 'month' | 'range' | 'all') => void;
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  selectedMonth: string;
  onSelectedMonthChange: (month: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  filterType: 'all' | 'income' | 'expense';
  onFilterTypeChange: (type: 'all' | 'income' | 'expense') => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  filterMinAmount: string;
  onFilterMinAmountChange: (amount: string) => void;
  filterMaxAmount: string;
  onFilterMaxAmountChange: (amount: string) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
  onAddNewTransaction: () => void;
  onResetFilters: () => void;
  onWhatsAppReminder?: (tx: Transaction) => void;
}

export const Transactions = (props: TransactionsProps) => {
  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-10">
      <TransactionFilters 
        categories={props.categories}
        settings={props.settings}
        onUpdateSettings={props.onUpdateSettings}
        searchTerm={props.searchTerm}
        onSearchChange={props.onSearchChange}
        dateFilterMode={props.dateFilterMode}
        onDateFilterModeChange={props.onDateFilterModeChange}
        selectedDate={props.selectedDate}
        onSelectedDateChange={props.onSelectedDateChange}
        selectedMonth={props.selectedMonth}
        onSelectedMonthChange={props.onSelectedMonthChange}
        startDate={props.startDate}
        onStartDateChange={props.onStartDateChange}
        endDate={props.endDate}
        onEndDateChange={props.onEndDateChange}
        filterType={props.filterType}
        onFilterTypeChange={props.onFilterTypeChange}
        filterCategory={props.filterCategory}
        onFilterCategoryChange={props.onFilterCategoryChange}
        filterMinAmount={props.filterMinAmount}
        onFilterMinAmountChange={props.onFilterMinAmountChange}
        filterMaxAmount={props.filterMaxAmount}
        onFilterMaxAmountChange={props.onFilterMaxAmountChange}
        showFilters={props.showFilters}
        onShowFiltersChange={props.onShowFiltersChange}
        onResetFilters={props.onResetFilters}
      />

      <TransactionList 
        filteredTransactions={props.filteredTransactions}
        handleDuplicateTransaction={props.handleDuplicateTransaction}
        pagination={props.pagination}
        onPageChange={props.onPageChange}
        settings={props.settings}
        onEditTransaction={props.onEditTransaction}
        onDeleteTransaction={props.onDeleteTransaction}
        onAddNewTransaction={props.onAddNewTransaction}
        onWhatsAppReminder={props.onWhatsAppReminder}
      />
    </div>
  );
};
