import React, { useEffect } from 'react';
import { Transactions } from '../components/Transactions';
import { useTransactions } from '../hooks/useTransactions';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFilterStore } from '../store/useFilterStore';
import { useModalStore } from '../store/useModalStore';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/ui/Toast';

export const TransactionsPage: React.FC = () => {
  const { showToast } = useToast();
  const { settings, categories, saveSettingsAPI } = useSettingsStore();
  const { 
    searchTerm, setSearchTerm,
    dateFilterMode, setDateFilterMode,
    selectedDate, setSelectedDate,
    selectedMonth, setSelectedMonth,
    startDate, setStartDate,
    endDate, setEndDate,
    filterType, setFilterType,
    filterCategory, setFilterCategory,
    filterMinAmount, setFilterMinAmount,
    filterMaxAmount, setFilterMaxAmount,
    showFilters, setShowFilters
  } = useFilterStore();
  
  const { 
    setEditingTransaction,
    setTransactionToDelete
  } = useModalStore();

  const { setIsAdding } = useAppStore();

  const { 
    filteredTransactions, 
    handleDuplicateTransaction, 
    transactions, 
    setTransactionsPage,
    fetchTransactions,
    deleteTransactionAPI
  } = useTransactions(showToast);

  useEffect(() => {
    fetchTransactions(transactions.meta.page, searchTerm);
  }, [fetchTransactions, transactions.meta.page, searchTerm, dateFilterMode, selectedDate, selectedMonth, startDate, endDate, filterType, filterCategory, filterMinAmount, filterMaxAmount]);

  return (
    <Transactions 
      categories={categories}
      filteredTransactions={filteredTransactions}
      handleDuplicateTransaction={handleDuplicateTransaction}
      pagination={{
        currentPage: transactions.meta.page,
        totalPages: transactions.meta.totalPages,
        totalItems: transactions.meta.total,
        limit: transactions.meta.limit
      }}
      onPageChange={setTransactionsPage}
      settings={settings}
      onUpdateSettings={saveSettingsAPI}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      dateFilterMode={dateFilterMode}
      onDateFilterModeChange={setDateFilterMode}
      selectedDate={selectedDate}
      onSelectedDateChange={setSelectedDate}
      selectedMonth={selectedMonth}
      onSelectedMonthChange={setSelectedMonth}
      startDate={startDate}
      onStartDateChange={setStartDate}
      endDate={endDate}
      onEndDateChange={setEndDate}
      filterType={filterType}
      onFilterTypeChange={setFilterType}
      filterCategory={filterCategory}
      onFilterCategoryChange={setFilterCategory}
      filterMinAmount={filterMinAmount}
      onFilterMinAmountChange={setFilterMinAmount}
      filterMaxAmount={filterMaxAmount}
      onFilterMaxAmountChange={setFilterMaxAmount}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      onEditTransaction={setEditingTransaction}
      onDeleteTransaction={setTransactionToDelete}
      onAddNewTransaction={() => setIsAdding(true)}
    />
  );
};

export default TransactionsPage;
