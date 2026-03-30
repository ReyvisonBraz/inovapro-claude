import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Transaction, Customer, ClientPayment, Category, User, AuditLog, InventoryItem, ServiceOrder, ServiceOrderStatus, Brand, Model } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingPayments: number;
  activeOS: number;
}

interface DataContextType {
  customers: PaginatedResponse<Customer>;
  customersPage: number;
  setCustomersPage: (page: number) => void;
  customerSearchTerm: string;
  setCustomerSearchTerm: (term: string) => void;
  
  transactions: PaginatedResponse<Transaction>;
  transactionsPage: number;
  setTransactionsPage: (page: number) => void;
  
  clientPayments: PaginatedResponse<ClientPayment>;
  paymentsPage: number;
  setPaymentsPage: (page: number) => void;
  paymentSearchTerm: string;
  setPaymentSearchTerm: (term: string) => void;
  
  inventoryItems: InventoryItem[];
  
  serviceOrders: PaginatedResponse<ServiceOrder>;
  serviceOrdersPage: number;
  setServiceOrdersPage: (page: number) => void;
  osSearchTerm: string;
  setOsSearchTerm: (term: string) => void;
  
  serviceOrderStatuses: ServiceOrderStatus[];
  equipmentTypes: { id: number; name: string }[];
  brands: Brand[];
  models: Model[];
  categories: Category[];
  users: User[];
  auditLogs: AuditLog[];
  stats: Stats;
  
  fetchCustomers: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchClientPayments: () => Promise<void>;
  fetchInventoryItems: () => Promise<void>;
  fetchServiceOrders: () => Promise<void>;
  fetchServiceOrderStatuses: () => Promise<void>;
  fetchEquipmentTypes: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  fetchModels: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function createEmptyPaginatedResponse<T>(): PaginatedResponse<T> {
  return {
    data: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 0 }
  };
}

const initialStats: Stats = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  pendingPayments: 0,
  activeOS: 0
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [customers, setCustomers] = useState<PaginatedResponse<Customer>>(createEmptyPaginatedResponse<Customer>());
  const [customersPage, setCustomersPage] = useState(1);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  
  const [transactions, setTransactions] = useState<PaginatedResponse<Transaction>>(createEmptyPaginatedResponse<Transaction>());
  const [transactionsPage, setTransactionsPage] = useState(1);
  
  const [clientPayments, setClientPayments] = useState<PaginatedResponse<ClientPayment>>(createEmptyPaginatedResponse<ClientPayment>());
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  const [serviceOrders, setServiceOrders] = useState<PaginatedResponse<ServiceOrder>>(createEmptyPaginatedResponse<ServiceOrder>());
  const [serviceOrdersPage, setServiceOrdersPage] = useState(1);
  const [osSearchTerm, setOsSearchTerm] = useState('');
  
  const [serviceOrderStatuses, setServiceOrderStatuses] = useState<ServiceOrderStatus[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get('/api/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await api.get(`/api/customers?page=${customersPage}&limit=20&search=${customerSearchTerm}`);
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  }, [customersPage, customerSearchTerm]);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await api.get(`/api/transactions?page=${transactionsPage}&limit=20`);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    }
  }, [transactionsPage]);

  const fetchClientPayments = useCallback(async () => {
    try {
      const data = await api.get(`/api/client-payments?page=${paymentsPage}&limit=20&search=${paymentSearchTerm}`);
      setClientPayments(data);
    } catch (err) {
      console.error('Failed to fetch client payments', err);
    }
  }, [paymentsPage, paymentSearchTerm]);

  const fetchInventoryItems = useCallback(async () => {
    try {
      const data = await api.get('/api/inventory');
      setInventoryItems(data);
    } catch (err) {
      console.error('Failed to fetch inventory items', err);
    }
  }, []);

  const fetchServiceOrders = useCallback(async () => {
    try {
      const data = await api.get(`/api/service-orders?page=${serviceOrdersPage}&limit=20&search=${osSearchTerm}`);
      setServiceOrders(data);
    } catch (err) {
      console.error('Failed to fetch service orders', err);
    }
  }, [serviceOrdersPage, osSearchTerm]);

  const fetchServiceOrderStatuses = useCallback(async () => {
    try {
      const data = await api.get('/api/service-order-statuses');
      setServiceOrderStatuses(data);
    } catch (err) {
      console.error('Failed to fetch service order statuses', err);
    }
  }, []);

  const fetchEquipmentTypes = useCallback(async () => {
    try {
      const data = await api.get('/api/equipment-types');
      setEquipmentTypes(data);
    } catch (err) {
      console.error('Failed to fetch equipment types', err);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const data = await api.get('/api/brands');
      setBrands(data);
    } catch (err) {
      console.error('Failed to fetch brands', err);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const data = await api.get('/api/models');
      setModels(data);
    } catch (err) {
      console.error('Failed to fetch models', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get('/api/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const data = await api.get('/api/audit-logs');
      setAuditLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchTransactions(),
      fetchCustomers(),
      fetchClientPayments(),
      fetchCategories(),
      fetchUsers(),
      fetchAuditLogs(),
      fetchInventoryItems(),
      fetchServiceOrders(),
      fetchServiceOrderStatuses(),
      fetchEquipmentTypes(),
      fetchBrands(),
      fetchModels(),
    ]);
  }, [
    fetchStats, fetchTransactions, fetchCustomers, fetchClientPayments,
    fetchCategories, fetchUsers, fetchAuditLogs, fetchInventoryItems,
    fetchServiceOrders, fetchServiceOrderStatuses, fetchEquipmentTypes,
    fetchBrands, fetchModels
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAll();
    }
  }, [isAuthenticated, fetchAll]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomers();
    }
  }, [isAuthenticated, customersPage, customerSearchTerm, fetchCustomers]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, transactionsPage, fetchTransactions]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClientPayments();
    }
  }, [isAuthenticated, paymentsPage, paymentSearchTerm, fetchClientPayments]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServiceOrders();
    }
  }, [isAuthenticated, serviceOrdersPage, osSearchTerm, fetchServiceOrders]);

  return (
    <DataContext.Provider value={{
      customers,
      customersPage,
      setCustomersPage,
      customerSearchTerm,
      setCustomerSearchTerm,
      transactions,
      transactionsPage,
      setTransactionsPage,
      clientPayments,
      paymentsPage,
      setPaymentsPage,
      paymentSearchTerm,
      setPaymentSearchTerm,
      inventoryItems,
      serviceOrders,
      serviceOrdersPage,
      setServiceOrdersPage,
      osSearchTerm,
      setOsSearchTerm,
      serviceOrderStatuses,
      equipmentTypes,
      brands,
      models,
      categories,
      users,
      auditLogs,
      stats,
      fetchCustomers,
      fetchTransactions,
      fetchClientPayments,
      fetchInventoryItems,
      fetchServiceOrders,
      fetchServiceOrderStatuses,
      fetchEquipmentTypes,
      fetchBrands,
      fetchModels,
      fetchCategories,
      fetchUsers,
      fetchAuditLogs,
      fetchStats,
      fetchAll,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
