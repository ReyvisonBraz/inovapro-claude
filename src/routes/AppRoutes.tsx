import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { useUI } from '../contexts/UIContext';

import { Login } from '../components/Login';
import { Dashboard } from '../components/Dashboard';
import { Transactions } from '../components/Transactions';
import { Reports } from '../components/Reports';
import { Customers } from '../components/Customers';
import { ClientPayments } from '../components/ClientPayments';
import { ServiceOrders } from '../components/ServiceOrders';
import { Inventory } from '../components/Inventory';
import { StatusPage } from '../components/StatusPage';
import { SettingsLayout } from '../components/settings/SettingsLayout';

import { useToast } from '../components/ui/Toast';
import { Transaction, Customer, ClientPayment, AppSettings, Screen, User } from '../types';

export const AppRoutes: React.FC = () => {
  const { login, logout, user, isAuthenticated, token } = useAuth();
  const { 
    customers, customersPage, setCustomersPage, customerSearchTerm, setCustomerSearchTerm,
    transactions, transactionsPage, setTransactionsPage,
    clientPayments, paymentsPage, setPaymentsPage, paymentSearchTerm, setPaymentSearchTerm,
    inventoryItems, serviceOrders, serviceOrdersPage, setServiceOrdersPage, osSearchTerm, setOsSearchTerm,
    serviceOrderStatuses, equipmentTypes, brands, models, categories, users, auditLogs, stats,
    fetchCategories, fetchUsers, fetchAuditLogs, fetchBrands, fetchModels, fetchEquipmentTypes, 
    fetchServiceOrderStatuses, fetchInventoryItems, fetchClientPayments, fetchCustomers,
    fetchTransactions, fetchServiceOrders, fetchStats
  } = useData();
  const { settings, updateSettings, isSettingsUnlocked } = useSettings();
  const { 
    isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed, setIsSidebarCollapsed,
    fontSize, setFontSize, showNotifications, setShowNotifications, notificationTab, setNotificationTab
  } = useUI();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [transactionsPageLocal, setTransactionsPageLocal] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingServiceOrder, setIsAddingServiceOrder] = useState(false);
  const [isAddingInventoryItem, setIsAddingInventoryItem] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '', lastName: '', nickname: '', cpf: '', companyName: '',
    phone: '+55', observation: '', creditLimit: ''
  });

  const [newClientPayment, setNewClientPayment] = useState({
    customerId: 0, description: '', totalAmount: '', paidAmount: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Dinheiro', installmentsCount: 1, installmentInterval: 'monthly', type: 'income' as 'income' | 'expense'
  });
  const [isAddingClientPayment, setIsAddingClientPayment] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState<ClientPayment | null>(null);

  useEffect(() => {
    const osId = searchParams.get('osId');
    if (osId) {
      setActiveScreen('service-orders');
    }
  }, [searchParams]);

  const handleLogin = async (userData: User) => {
    navigate('/dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <h1>App Routes - Em desenvolvimento</h1>
      <p>Esta é uma estrutura inicial. O App.tsx original continua funcionando.</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default AppRoutes;
