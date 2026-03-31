import { useMemo } from 'react';
import { isSameDay, parseISO, format } from 'date-fns';
import { Transaction, ClientPayment, Customer, ServiceOrder, InventoryItem } from '../types';
import { useFilterStore } from '../store/useFilterStore';

export const useFilteredData = (
  transactions: Transaction[],
  clientPayments: ClientPayment[],
  customers: Customer[],
  serviceOrders: ServiceOrder[],
  inventory: InventoryItem[]
) => {
  const {
    searchTerm,
    dateFilterMode,
    selectedDate,
    selectedMonth,
    startDate,
    endDate,
    filterType,
    filterCategory,
    filterMinAmount,
    filterMaxAmount,
    paymentSearchTerm,
    paymentFilterStatus,
    paymentSortMode,
    customerSearchTerm,
    osSearchTerm,
    osStatusFilter,
    osPriorityFilter,
    inventorySearchTerm,
    inventoryCategoryFilter
  } = useFilterStore();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tx.amount.toString().includes(searchTerm);
      const matchesType = filterType === 'all' || tx.type === filterType;
      const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
      const matchesMin = filterMinAmount === '' || tx.amount >= parseFloat(filterMinAmount.toString().replace(',', '.'));
      const matchesMax = filterMaxAmount === '' || tx.amount <= parseFloat(filterMaxAmount.toString().replace(',', '.'));
      
      let matchesDate = true;
      if (dateFilterMode === 'day') {
        matchesDate = isSameDay(parseISO(tx.date), parseISO(selectedDate));
      } else if (dateFilterMode === 'month') {
        matchesDate = format(parseISO(tx.date), 'yyyy-MM-01') === selectedMonth + '-01';
      } else if (dateFilterMode === 'range') {
        const txDate = parseISO(tx.date);
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        matchesDate = txDate >= start && txDate <= end;
      }

      return matchesSearch && matchesType && matchesCategory && matchesMin && matchesMax && matchesDate;
    });
  }, [transactions, searchTerm, filterType, filterCategory, filterMinAmount, filterMaxAmount, dateFilterMode, selectedDate, selectedMonth, startDate, endDate]);

  const filteredClientPayments = useMemo(() => {
    let result = clientPayments.filter(payment => {
      const matchesSearch = payment.customerName.toLowerCase().includes(paymentSearchTerm.toLowerCase()) || 
                           payment.description.toLowerCase().includes(paymentSearchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (paymentFilterStatus === 'paid') matchesStatus = payment.status === 'paid';
      else if (paymentFilterStatus === 'partial') matchesStatus = payment.status === 'partial';
      else if (paymentFilterStatus === 'pending') matchesStatus = payment.status === 'pending';
      else if (paymentFilterStatus === 'overdue') matchesStatus = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    result = [...result].sort((a, b) => {
      if (paymentSortMode === 'date') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (paymentSortMode === 'amount') {
        return b.totalAmount - a.totalAmount;
      } else if (paymentSortMode === 'alphabetical') {
        return a.customerName.localeCompare(b.customerName);
      }
      return 0;
    });

    return result;
  }, [clientPayments, paymentSearchTerm, paymentFilterStatus, paymentSortMode]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      return fullName.includes(customerSearchTerm.toLowerCase()) ||
             customer.nickname?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
             customer.phone.includes(customerSearchTerm) ||
             customer.cpf?.includes(customerSearchTerm);
    });
  }, [customers, customerSearchTerm]);

  const filteredServiceOrders = useMemo(() => {
    return serviceOrders.filter(os => {
      const customerName = `${os.firstName || ''} ${os.lastName || ''}`.toLowerCase();
      const equipment = `${os.equipmentBrand || ''} ${os.equipmentModel || ''}`.toLowerCase();
      const matchesSearch = customerName.includes(osSearchTerm.toLowerCase()) ||
                           os.id.toString().includes(osSearchTerm) ||
                           equipment.includes(osSearchTerm.toLowerCase());
      const matchesStatus = osStatusFilter === 'all' || os.status === osStatusFilter;
      const matchesPriority = osPriorityFilter === 'all' || os.priority === osPriorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [serviceOrders, osSearchTerm, osStatusFilter, osPriorityFilter]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                           item.sku?.toLowerCase().includes(inventorySearchTerm.toLowerCase());
      const matchesCategory = inventoryCategoryFilter === 'all' || item.category === inventoryCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, inventorySearchTerm, inventoryCategoryFilter]);

  return {
    filteredTransactions,
    filteredClientPayments,
    filteredCustomers,
    filteredServiceOrders,
    filteredInventory
  };
};
