import React, { useEffect } from 'react';
import { Transactions } from '../components/transactions/Transactions';
import { useTransactions } from '../hooks/useTransactions';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFilterStore } from '../store/useFilterStore';
import { useModalStore } from '../store/useModalStore';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/ui/Toast';
import { useDebounce } from '../hooks/useDebounce';
import { sendWhatsAppPaymentReminder } from '../lib/whatsappUtils';

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
    showFilters, setShowFilters,
    resetFilters
  } = useFilterStore();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const { 
    setEditingTransaction,
    setTransactionToDelete
  } = useModalStore();

  const { setIsAdding } = useAppStore();

  const { 
    filteredTransactions, 
    handleDuplicateTransaction, 
    transactions, 
    transactionsPage,
    setTransactionsPage,
    deleteTransactionAPI,
    isLoading,
    isError
  } = useTransactions(showToast);

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
      onEditTransaction={(tx) => {
        setEditingTransaction(tx);
        setIsAdding(true);
      }}
      onDeleteTransaction={setTransactionToDelete}
      onAddNewTransaction={() => {
        setEditingTransaction(null);
        setIsAdding(true);
      }}
      onResetFilters={resetFilters}
      onWhatsAppReminder={(tx) => {
        if (tx.customerPhone) {
          sendWhatsAppPaymentReminder(
            { 
              description: tx.description, 
              totalAmount: tx.amount, 
              paidAmount: tx.amount,
              status: 'paid',
              purchaseDate: tx.date,
              dueDate: tx.date
            },
            { 
              firstName: tx.customerName || 'Cliente', 
              phone: tx.customerPhone 
            },
            settings.appName
          );
        }
      }}
    />
  );
};

export default TransactionsPage;
