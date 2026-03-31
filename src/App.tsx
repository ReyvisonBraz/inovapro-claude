import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  BarChart3, 
  Settings, 
  Plus, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
  MoreVertical,
  ShoppingBag,
  Briefcase,
  Zap,
  Coffee,
  Car,
  X,
  Download,
  Printer,
  Trash2,
  AlertTriangle,
  Palette,
  Package,
  CreditCard,
  Users,
  Wrench,
  Tag,
  User as UserIcon,
  MessageCircle,
  ImageIcon,
  Edit,
  Copy,
  CheckCircle2,
  LayoutGrid,
  List as ListIcon,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './components/ui/Toast';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { format, parseISO, isSameMonth, isSameDay, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatCurrency, formatMonthYear } from './lib/utils';
import { printBlankForm } from './lib/printUtils';
import { Transaction, Screen, AppSettings, Customer, ClientPayment, Category, User, AuditLog, InventoryItem, ServiceOrder, ServiceOrderStatus, Brand, Model } from './types';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { Login } from './components/Login';
import { ServiceOrders } from './components/ServiceOrders';
import { Inventory } from './components/Inventory';
import { useCustomers } from './hooks/useCustomers';
import { useServiceOrders } from './hooks/useServiceOrders';
import { useTransactions } from './hooks/useTransactions';
import { useAuth } from './hooks/useAuth';
import { useClientPayments } from './hooks/useClientPayments';
import { useInventory } from './hooks/useInventory';
import { useSettings } from './hooks/useSettings';
import { useSettingsStore } from './store/useSettingsStore';
import { useAppStore } from './store/useAppStore';
import { useFilterStore } from './store/useFilterStore';
import { useModalStore } from './store/useModalStore';
import { useFormStore } from './store/useFormStore';
import { useStats } from './hooks/useStats';

import { SidebarItem } from './components/SidebarItem';
import { StatCard } from './components/StatCard';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Reports } from './components/Reports';
import { Customers } from './components/Customers';
import { ClientPayments } from './components/ClientPayments';
import { PasswordModal } from './components/modals/PasswordModal';
import { WarningModal } from './components/modals/WarningModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { CustomerWarningModal } from './components/modals/CustomerWarningModal';
import { CustomerDeleteWarningModal } from './components/modals/CustomerDeleteWarningModal';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { DeleteConfirmationModal } from './components/modals/DeleteConfirmationModal';
import { AddClientPaymentModal } from './components/modals/AddClientPaymentModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { CustomerHistoryModal } from './components/modals/CustomerHistoryModal';

// --- Aplicativo Principal ---

export default function App() {
  const {
    activeScreen, setActiveScreen,
    isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, setIsSidebarCollapsed,
    fontSize, setFontSize,
    showNotifications, setShowNotifications,
    notificationTab, setNotificationTab,
    isAdding, setIsAdding,
    isAddingServiceOrder, setIsAddingServiceOrder,
    isAddingInventoryItem, setIsAddingInventoryItem,
    isAddingCustomer, setIsAddingCustomer,
    isAddingClientPayment, setIsAddingClientPayment,
    isSaving, setIsSaving,
    directOsId, setDirectOsId,
    directMode, setDirectMode
  } = useAppStore();

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
    paymentSearchTerm, setPaymentSearchTerm,
    paymentFilterStatus, setPaymentFilterStatus,
    paymentSortMode, setPaymentSortMode,
    osSearchTerm, setOsSearchTerm,
    reportMonth, setReportMonth,
    reportView, setReportView,
    dashboardMonth, setDashboardMonth
  } = useFilterStore();

  const {
    confirmModal, openConfirm, closeConfirm,
    showPasswordModal, setShowPasswordModal,
    isSettingsUnlocked, setIsSettingsUnlocked,
    passwordInput, setPasswordInput,
    showWarningModal, setShowWarningModal,
    warningType, setWarningType,
    showCustomerWarningModal, setShowCustomerWarningModal,
    customerWarningType, setCustomerWarningType,
    editingTransaction, setEditingTransaction,
    transactionToDelete, setTransactionToDelete,
    editingCustomer, setEditingCustomer,
    customerToDelete, setCustomerToDelete,
    customerPaymentsWarning, setCustomerPaymentsWarning,
    clientPaymentToDelete, setClientPaymentToDelete,
    isRecordingPayment, setIsRecordingPayment,
    paymentAmount, setPaymentAmount,
    paymentDate, setPaymentDate,
    showHistoryModal, setShowHistoryModal,
    historyCustomer, setHistoryCustomer
  } = useModalStore();

  const {
    newTx, setNewTx,
    newCustomer, setNewCustomer,
    newClientPayment, setNewClientPayment,
  } = useFormStore();

  const { stats, fetchStats } = useStats();
  const { showToast } = useToast();

  const {
    settings,
    setSettings,
    categories,
    setCategories,
    fetchSettings,
    fetchCategories,
    saveSettingsAPI: updateSettings,
    addCategory,
    deleteCategory
  } = useSettings(showToast);

  const {
    transactions,
    transactionsPage,
    setTransactionsPage,
    fetchTransactions,
    saveTransactionAPI,
    deleteTransactionAPI
  } = useTransactions(showToast);

  const {
    customers,
    customersPage,
    setCustomersPage,
    customerSearchTerm,
    setCustomerSearchTerm,
    fetchCustomers,
    saveCustomerAPI,
    deleteCustomerAPI,
    checkCustomerPaymentsAPI
  } = useCustomers();

  const {
    serviceOrders,
    serviceOrdersPage,
    setServiceOrdersPage,
    serviceOrderStatuses,
    equipmentTypes,
    brands,
    models,
    fetchServiceOrders,
    fetchServiceOrderStatuses,
    fetchEquipmentTypes,
    fetchBrands,
    fetchModels,
    saveServiceOrderAPI,
    deleteServiceOrderAPI,
    addServiceOrderStatusAPI,
    deleteServiceOrderStatusAPI,
    addEquipmentTypeAPI,
    deleteEquipmentTypeAPI,
    addBrandAPI,
    deleteBrandAPI,
    addModelAPI,
    deleteModelAPI
  } = useServiceOrders();

  const {
    clientPayments,
    paymentsPage,
    setPaymentsPage,
    fetchClientPayments,
    saveClientPaymentAPI,
    deleteClientPaymentAPI,
    recordPaymentAPI
  } = useClientPayments(showToast);

  const {
    inventoryItems,
    fetchInventoryItems,
    saveInventoryItemAPI,
    deleteInventoryItemAPI
  } = useInventory(showToast);

  const {
    isAuthenticated,
    currentUser,
    users,
    auditLogs,
    login,
    logout,
    hasPermission,
    fetchUsers,
    fetchAuditLogs,
    saveUserAPI,
    deleteUserAPI
  } = useAuth(showToast);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('app_font_size', fontSize.toString());
  }, [fontSize]);

  const handlePrintBlankForm = () => {
    printBlankForm(settings);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDebts = clientPayments.data.filter(p => {
    if (p.status === 'paid') return false;
    const dueDate = parseISO(p.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  });

  const dueTodayDebts = clientPayments.data.filter(p => {
    if (p.status === 'paid') return false;
    const dueDate = parseISO(p.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const overdueDebts = clientPayments.data.filter(p => {
    if (p.status === 'paid') return false;
    const dueDate = parseISO(p.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() < today.getTime();
  });

  const overdueServiceOrders = serviceOrders.data.filter(o => {
    if (o.status === 'Concluído' || o.status === 'Entregue' || o.status === 'Cancelado') return false;
    if (!o.analysisPrediction) return false;
    const predictionDate = parseISO(o.analysisPrediction);
    predictionDate.setHours(0, 0, 0, 0);
    return predictionDate.getTime() < today.getTime();
  });

  const dueTodayServiceOrders = serviceOrders.data.filter(o => {
    if (o.status === 'Concluído' || o.status === 'Entregue' || o.status === 'Cancelado') return false;
    if (!o.analysisPrediction) return false;
    const predictionDate = parseISO(o.analysisPrediction);
    predictionDate.setHours(0, 0, 0, 0);
    return predictionDate.getTime() === today.getTime();
  });

  const upcomingServiceOrders = serviceOrders.data.filter(o => {
    if (o.status === 'Concluído' || o.status === 'Entregue' || o.status === 'Cancelado') return false;
    if (!o.analysisPrediction) return false;
    const predictionDate = parseISO(o.analysisPrediction);
    predictionDate.setHours(0, 0, 0, 0);
    const diffTime = predictionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  });

  const totalPaymentNotifications = upcomingDebts.length + dueTodayDebts.length + overdueDebts.length;
  const totalServiceOrderNotifications = overdueServiceOrders.length + dueTodayServiceOrders.length + upcomingServiceOrders.length;
  const totalNotifications = totalPaymentNotifications + totalServiceOrderNotifications;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const osId = params.get('osId');
    const mode = params.get('mode');
    if (osId) {
      setDirectOsId(parseInt(osId));
      setDirectMode(mode);
      setActiveScreen('service-orders');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchTransactions(transactionsPage, searchTerm);
      fetchSettings();
      fetchCustomers();
      fetchClientPayments(paymentsPage, paymentSearchTerm);
      fetchCategories();
      fetchUsers();
      fetchAuditLogs();
      fetchInventoryItems();
      fetchServiceOrders();
      fetchServiceOrderStatuses();
      fetchEquipmentTypes();
      fetchBrands();
      fetchModels();
    }
  }, [isAuthenticated, transactionsPage, customersPage, paymentsPage, serviceOrdersPage, searchTerm, customerSearchTerm, paymentSearchTerm, osSearchTerm]);

  const handleAddUser = async (user: any) => {
    try {
      await saveUserAPI(user);
      fetchUsers();
      fetchAuditLogs();
      showToast('Usuário criado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to add user", err);
      showToast('Erro ao criar usuário.', 'error');
    }
  };

  const handleUpdateUser = async (id: number, user: any) => {
    try {
      await saveUserAPI(user, id);
      fetchUsers();
      fetchAuditLogs();
      showToast('Usuário atualizado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to update user", err);
      showToast('Erro ao atualizar usuário.', 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    openConfirm(
      'Excluir Usuário',
      'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await deleteUserAPI(id);
          fetchUsers();
          fetchAuditLogs();
          showToast('Usuário excluído com sucesso!', 'success');
        } catch (err) {
          console.error("Failed to delete user", err);
          showToast('Erro de conexão ao excluir usuário.', 'error');
        }
      },
      'danger'
    );
  };

  const handleAddBrand = async (name: string, equipmentType: string) => {
    try {
      await addBrandAPI(name, equipmentType);
      fetchBrands();
      showToast('Marca adicionada com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to add brand", err);
      showToast('Erro ao adicionar marca.', 'error');
    }
  };

  const handleAddEquipmentType = async (name: string, icon?: string) => {
    try {
      await addEquipmentTypeAPI(name, icon);
      fetchEquipmentTypes();
      showToast('Tipo de equipamento adicionado!', 'success');
    } catch (err) {
      console.error("Failed to add equipment type", err);
      showToast('Erro ao adicionar tipo de equipamento.', 'error');
    }
  };

  const handleDeleteEquipmentType = (id: number) => {
    openConfirm(
      'Excluir Tipo de Equipamento',
      'Tem certeza que deseja excluir este tipo? Isso não afetará as marcas e modelos já cadastrados, mas eles não aparecerão mais nesta categoria.',
      async () => {
        try {
          await deleteEquipmentTypeAPI(id);
          fetchEquipmentTypes();
          showToast('Tipo de equipamento removido!', 'info');
        } catch (err) {
          console.error("Failed to delete equipment type", err);
          showToast('Erro ao remover tipo de equipamento.', 'error');
        }
      },
      'danger'
    );
  };

  const handleDeleteBrand = async (id: number) => {
    openConfirm(
      'Excluir Marca',
      'Tem certeza que deseja excluir esta marca? Todos os modelos vinculados também serão excluídos.',
      async () => {
        try {
          await deleteBrandAPI(id);
          fetchBrands();
          fetchModels();
          showToast('Marca excluída com sucesso!', 'success');
        } catch (err) {
          console.error("Failed to delete brand", err);
          showToast('Erro ao excluir marca.', 'error');
        }
      },
      'danger'
    );
  };

  const handleAddModel = async (brandId: number, name: string) => {
    try {
      await addModelAPI(brandId, name);
      fetchModels();
      showToast('Modelo adicionado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to add model", err);
      showToast('Erro ao adicionar modelo.', 'error');
    }
  };

  const handleDeleteModel = async (id: number) => {
    openConfirm(
      'Excluir Modelo',
      'Tem certeza que deseja excluir este modelo?',
      async () => {
        try {
          await deleteModelAPI(id);
          fetchModels();
          showToast('Modelo excluído com sucesso!', 'success');
        } catch (err) {
          console.error("Failed to delete model", err);
          showToast('Erro ao excluir modelo.', 'error');
        }
      },
      'danger'
    );
  };

  const handleAddCustomer = async (force: boolean = false) => {
    if (isSaving) return;
    if (!newCustomer.firstName || !newCustomer.lastName) {
      showToast("Por favor, preencha o nome e sobrenome do cliente.", 'warning');
      return;
    }

    if (!force && settings.showWarnings) {
      const missingCpf = !newCustomer.cpf;
      const missingPhone = !newCustomer.phone || newCustomer.phone === '+55';

      if (missingCpf || missingPhone) {
        setCustomerWarningType(missingCpf && missingPhone ? 'both' : missingCpf ? 'cpf' : 'phone');
        setShowCustomerWarningModal(true);
        return;
      }
    }

    // Verificar similaridade
    const similarity = customers.data?.find(c => 
      (newCustomer.nickname && c.nickname?.toLowerCase() === newCustomer.nickname?.toLowerCase()) ||
      (newCustomer.companyName && c.companyName?.toLowerCase() === newCustomer.companyName?.toLowerCase()) ||
      (c.firstName?.toLowerCase() === newCustomer.firstName?.toLowerCase() && c.lastName?.toLowerCase() === newCustomer.lastName?.toLowerCase())
    );

    const saveCustomer = async () => {
      setIsSaving(true);
      try {
        const data = await saveCustomerAPI({
          ...newCustomer,
          creditLimit: parseFloat(newCustomer.creditLimit.toString().replace(',', '.')) || 0,
          createdBy: !editingCustomer ? currentUser?.id : undefined,
          updatedBy: currentUser?.id
        }, editingCustomer?.id);
        
        setIsAddingCustomer(false);
        setShowCustomerWarningModal(false);
        setEditingCustomer(null);
        setNewCustomer({
          firstName: '',
          lastName: '',
          nickname: '',
          cpf: '',
          companyName: '',
          phone: '+55',
          observation: '',
          creditLimit: ''
        });
        fetchCustomers();
        fetchAuditLogs();

        if (!editingCustomer) {
          // Use a small delay to ensure the modal is closed before showing the confirm
          setTimeout(() => {
            openConfirm(
              'Lançar Pagamento',
              'Cliente cadastrado com sucesso! Deseja lançar um pagamento/parcelamento para este cliente agora?',
              () => {
                setNewClientPayment(prev => ({ ...prev, customerId: data.id }));
                setActiveScreen('client-payments');
                setIsAddingClientPayment(true);
              },
              'info'
            );
          }, 500);
        }
      } catch (err: any) {
        console.error("Failed to add customer", err);
        showToast(err.message || 'Erro ao adicionar cliente.', 'error');
      } finally {
        setIsSaving(false);
      }
    };

    if (similarity && !editingCustomer) {
      openConfirm(
        'Cliente Similar Encontrado',
        `Já existe um cliente similar: ${similarity.firstName} ${similarity.lastName}${similarity.nickname ? ` (${similarity.nickname})` : ''}. Deseja cadastrar assim mesmo?`,
        saveCustomer,
        'warning'
      );
      return;
    }

    if (editingCustomer) {
      const nameChanged = editingCustomer.firstName !== newCustomer.firstName || editingCustomer.lastName !== newCustomer.lastName;
      if (nameChanged) {
        openConfirm(
          'Atenção: Alteração de Nome',
          "Você alterou o nome do cliente. Isso será refletido em todos os lançamentos vinculados. Deseja continuar?",
          saveCustomer,
          'warning'
        );
        return;
      }
    }

    saveCustomer();
  };

  const handleAddClientPayment = async () => {
    if (isSaving) return;
    if (!newClientPayment.customerId || !newClientPayment.totalAmount) return;
    
    setIsSaving(true);
    try {
      const total = parseFloat(newClientPayment.totalAmount.toString().replace(',', '.'));
      const paid = parseFloat((newClientPayment.paidAmount || '0').toString().replace(',', '.'));
      const installmentsCount = newClientPayment.installmentsCount || 1;
      const interval = newClientPayment.installmentInterval || 'monthly';
      const saleId = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const promises = [];

      // 1. Criar a Entrada se houver
      if (paid > 0) {
        promises.push(saveClientPaymentAPI({
          ...newClientPayment,
          description: `ENTRADA: ${newClientPayment.description}`,
          totalAmount: paid,
          paidAmount: paid,
          dueDate: newClientPayment.purchaseDate,
          status: 'paid',
          installmentsCount: 1,
          saleId,
          createdBy: currentUser?.id
        }));
      }

      // 2. Criar as parcelas do saldo restante
      const remainingAmount = total - paid;
      if (remainingAmount > 0) {
        const installmentAmount = remainingAmount / installmentsCount;

        for (let i = 0; i < installmentsCount; i++) {
          let dueDate = new Date(newClientPayment.dueDate + 'T12:00:00');
          if (interval === 'monthly') {
            dueDate.setMonth(dueDate.getMonth() + i);
          } else if (interval === 'biweekly') {
            dueDate.setDate(dueDate.getDate() + (i * 15));
          } else if (interval === 'weekly') {
            dueDate.setDate(dueDate.getDate() + (i * 7));
          } else if (interval === 'daily') {
            dueDate.setDate(dueDate.getDate() + i);
          }

          const description = installmentsCount > 1 
            ? `${newClientPayment.description} (Parcela ${i + 1}/${installmentsCount})`
            : newClientPayment.description;

          promises.push(saveClientPaymentAPI({
            ...newClientPayment,
            description,
            totalAmount: installmentAmount,
            paidAmount: 0,
            dueDate: format(dueDate, 'yyyy-MM-dd'),
            status: 'pending',
            installmentsCount: 1,
            saleId,
            createdBy: currentUser?.id
          }));
        }
      }

      await Promise.all(promises);

      setIsAddingClientPayment(false);
      setNewClientPayment({
        customerId: 0,
        description: '',
        totalAmount: '',
        paidAmount: '',
        purchaseDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'Dinheiro',
        installmentsCount: 1,
        installmentInterval: 'monthly',
        type: 'income'
      });
      fetchClientPayments(paymentsPage, paymentSearchTerm);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to add client payment", err);
      showToast('Erro ao adicionar pagamento de cliente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClientPayment = (payment: ClientPayment) => {
    setClientPaymentToDelete(payment.id);
  };

  const confirmDeleteClientPayment = async () => {
    if (!clientPaymentToDelete) return;
    try {
      await deleteClientPaymentAPI(clientPaymentToDelete);
      fetchClientPayments(paymentsPage, paymentSearchTerm);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to delete client payment", err);
      showToast('Erro ao excluir pagamento de cliente.', 'error');
    } finally {
      setClientPaymentToDelete(null);
    }
  };

  const handleDeleteClientPaymentGroup = async (saleId: string) => {
    openConfirm(
      'Excluir Venda Completa',
      'Deseja excluir todos os lançamentos desta venda agrupada? Esta ação não pode ser desfeita.',
      async () => {
        try {
          // We need a new endpoint or just loop. Let's add a query param to delete by saleId.
          const res = await fetch(`/api/client-payments/group/${saleId}`, { method: 'DELETE' });
          if (res.ok) {
            fetchClientPayments(paymentsPage, paymentSearchTerm);
            fetchAuditLogs();
            showToast('Venda excluída com sucesso.', 'success');
          }
        } catch (err) {
          console.error("Failed to delete client payment group", err);
          showToast('Erro ao excluir venda.', 'error');
        }
      },
      'danger'
    );
  };

  const handleRecordPayment = async () => {
    if (!isRecordingPayment || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount.toString().replace(',', '.'));
    const newPaidAmount = isRecordingPayment.paidAmount + amount;
    const newStatus = newPaidAmount >= isRecordingPayment.totalAmount ? 'paid' : 'partial';

    let currentHistory = [];
    try {
      if (isRecordingPayment.paymentHistory) {
        currentHistory = JSON.parse(isRecordingPayment.paymentHistory);
      }
    } catch (e) {}

    // Convert the selected date to ISO string, keeping the current time
    const [y, m, d] = paymentDate.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const now = new Date();
    dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const newHistory = [...currentHistory, {
      amount: amount,
      date: dateObj.toISOString()
    }];

    try {
      await saveClientPaymentAPI({
        paidAmount: newPaidAmount,
        status: newStatus,
        paymentHistory: JSON.stringify(newHistory),
        updatedBy: currentUser?.id
      }, isRecordingPayment.id);
      setIsRecordingPayment(null);
      setPaymentAmount('');
      fetchClientPayments(paymentsPage, paymentSearchTerm);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to record payment", err);
      showToast('Erro ao registrar pagamento.', 'error');
    }
  };

  const sendWhatsAppReminder = (payment: ClientPayment) => {
    const customer = customers.data.find(c => c.id === payment.customerId);
    if (!customer) return;
    
    const isPaid = payment.status === 'paid';
    const balance = payment.totalAmount - payment.paidAmount;
    
    const message = 
      `*${isPaid ? '✅ COMPROVANTE DE PAGAMENTO' : '⏳ LEMBRETE DE COBRANÇA'}*\n\n` +
      `Olá, *${customer.firstName}*! 👋\n\n` +
      `Segue o resumo da sua conta em *${settings.appName}*:\n\n` +
      `📝 *Descrição:* ${payment.description}\n` +
      `📅 *Data da Compra:* ${format(parseISO(payment.purchaseDate), 'dd/MM/yyyy')}\n` +
      `📌 *Status:* ${payment.status === 'paid' ? 'PAGO' : payment.status === 'partial' ? 'PARCIAL' : 'PENDENTE'}\n\n` +
      `----------------------------------\n` +
      `💰 *Valor Total:* ${formatCurrency(payment.totalAmount)}\n` +
      `💵 *Valor Pago:* ${formatCurrency(payment.paidAmount)}\n` +
      `${balance > 0 ? `🛑 *Saldo Devedor:* ${formatCurrency(balance)}\n` : ''}` +
      `----------------------------------\n\n` +
      `${balance > 0 ? `👉 *Vencimento:* ${format(parseISO(payment.dueDate), 'dd/MM/yyyy')}\n\n` : ''}` +
      `*${isPaid ? 'Agradecemos pela preferência! 🙏' : 'Ficamos no aguardo do seu pagamento. Qualquer dúvida, estamos à disposição! 😊'}*`;
      
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      const payments = await checkCustomerPaymentsAPI(customer.id);
      
      setCustomerToDelete(customer);
      setCustomerPaymentsWarning(payments);
    } catch (err) {
      console.error("Failed to check customer payments", err);
      showToast('Erro ao verificar pagamentos do cliente.', 'error');
    }
  };

  const confirmDeleteCustomerWithPayments = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomerAPI(customerToDelete.id);
      fetchCustomers();
      fetchClientPayments(paymentsPage, paymentSearchTerm);
      setCustomerToDelete(null);
      setCustomerPaymentsWarning([]);
    } catch (err) {
      console.error("Failed to delete customer", err);
      showToast('Erro ao excluir cliente.', 'error');
    }
  };

  const printCustomerStatement = (customer: Customer) => {
    const customerPayments = clientPayments.data.filter(p => p.customerId === customer.id);
    const totalDebt = customerPayments.reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Extrato - ${customer.firstName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20mm; color: #1e293b; }
            .header { border-bottom: 2px solid ${settings.primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 800; text-transform: uppercase; color: ${settings.primaryColor}; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; font-weight: 800; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .total { margin-top: 30px; text-align: right; font-size: 18px; font-weight: bold; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${settings.appName}</div>
            <div>${settings.profileName}</div>
            ${settings.receiptCnpj ? `<div>CNPJ: ${settings.receiptCnpj}</div>` : ''}
            ${settings.receiptAddress ? `<div>${settings.receiptAddress}</div>` : ''}
          </div>
          
          <div class="info">
            <h2 style="margin: 0 0 10px 0;">Extrato do Cliente</h2>
            <div><strong>Cliente:</strong> ${customer.firstName} ${customer.lastName}</div>
            ${customer.cpf ? `<div><strong>CPF:</strong> ${customer.cpf}</div>` : ''}
            <div><strong>Data:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th style="text-align: right;">Valor Total</th>
                <th style="text-align: right;">Pago</th>
                <th style="text-align: right;">Saldo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${customerPayments.map(p => `
                <tr>
                  <td>${format(parseISO(p.purchaseDate), 'dd/MM/yyyy')}</td>
                  <td>${p.description}</td>
                  <td style="text-align: right;">${formatCurrency(p.totalAmount)}</td>
                  <td style="text-align: right;">${formatCurrency(p.paidAmount)}</td>
                  <td style="text-align: right;">${formatCurrency(p.totalAmount - p.paidAmount)}</td>
                  <td>${p.status === 'paid' ? 'PAGO' : p.status === 'partial' ? 'PARCIAL' : 'PENDENTE'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Saldo Devedor Total: <span style="color: ${totalDebt > 0 ? '#ef4444' : '#10b981'};">${formatCurrency(totalDebt)}</span>
          </div>
          
          <script>window.print();</script>
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const generateReceipt = async (payment: ClientPayment, layoutOverride?: 'simple' | 'a4') => {
    const customer = customers.data.find(c => c.id === payment.customerId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const layout = layoutOverride || settings.receiptLayout;

    let historyHtml = '';
    try {
      if (payment.paymentHistory) {
        const history = JSON.parse(payment.paymentHistory);
        if (history.length > 0) {
          historyHtml = layout === 'a4' ? `
            <div class="section" style="margin-top: 30px;">
              <div class="section-title">Histórico de Pagamentos</div>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="border-bottom: 1px solid #eee; text-align: left;">
                    <th style="padding: 8px 0; color: #666;">Data/Hora</th>
                    <th style="padding: 8px 0; color: #666; text-align: right;">Valor Pago</th>
                  </tr>
                </thead>
                <tbody>
                  ${history.map((h: any) => `
                    <tr style="border-bottom: 1px solid #f5f5f5;">
                      <td style="padding: 8px 0;">${format(parseISO(h.date), 'dd/MM/yyyy HH:mm')}</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatCurrency(h.amount)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="divider"></div>
            <p class="center bold">HISTÓRICO DE PAGAMENTOS</p>
            ${history.map((h: any) => `
              <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <span>${format(parseISO(h.date), 'dd/MM/yyyy HH:mm')}</span>
                <span>${formatCurrency(h.amount)}</span>
              </div>
            `).join('')}
          `;
        }
      }
    } catch (e) {}

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Recibo #${payment.id} - ${customer?.firstName} - ${formatCurrency(payment.totalAmount)}`)}`;

    const content = layout === 'a4' ? `
      <html>
        <head>
          <title>Recibo - ${settings.appName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 0; 
              margin: 0; 
              color: #1e293b; 
              background: #f8fafc;
              -webkit-print-color-adjust: exact;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              margin: 10mm auto;
              background: white;
              box-shadow: 0 0 20px rgba(0,0,0,0.05);
              position: relative;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              border-bottom: 4px solid ${settings.primaryColor}; 
              padding-bottom: 30px; 
              margin-bottom: 40px; 
            }
            .company-info { display: flex; align-items: center; gap: 20px; }
            .logo { width: 60px; height: 60px; object-fit: contain; border-radius: 12px; }
            .company-info h1 { 
              margin: 0; 
              font-size: 32px;
              color: ${settings.primaryColor}; 
              text-transform: uppercase;
              letter-spacing: -1px;
            }
            .company-info p { margin: 5px 0 0 0; color: #64748b; font-weight: 500; }
            .receipt-badge {
              background: ${settings.primaryColor};
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: bold;
              font-size: 14px;
              text-transform: uppercase;
              margin-bottom: 10px;
              display: inline-block;
            }
            .receipt-no { font-size: 12px; color: #94a3b8; font-weight: bold; }
            
            .main-title { 
              text-align: center; 
              font-size: 24px;
              font-weight: 800;
              text-transform: uppercase; 
              letter-spacing: 4px; 
              margin-bottom: 50px; 
              color: #0f172a;
            }
            
            .section { margin-bottom: 40px; }
            .section-title { 
              font-size: 12px;
              font-weight: 800; 
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #94a3b8;
              border-bottom: 1px solid #e2e8f0; 
              margin-bottom: 20px; 
              padding-bottom: 8px; 
            }
            
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
            .info-item { margin-bottom: 15px; }
            .label { display: block; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
            .value { display: block; font-weight: 700; font-size: 15px; color: #1e293b; }
            
            .table-container { margin-top: 30px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f1f5f9; padding: 12px 15px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; }
            td { padding: 12px 15px; border-top: 1px solid #e2e8f0; font-size: 13px; }
            
            .summary-card { 
              background: #f8fafc; 
              padding: 30px; 
              border-radius: 20px; 
              margin-top: 50px; 
              border: 1px solid #e2e8f0;
              position: relative;
            }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .summary-label { font-weight: 600; color: #64748b; }
            .summary-value { font-weight: 700; color: #1e293b; }
            .grand-total { 
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px dashed #cbd5e1;
              font-size: 24px; 
              color: ${settings.primaryColor};
            }
            
            .qr-code-container {
              position: absolute;
              right: 30px;
              top: 30px;
              text-align: center;
            }
            .qr-code { width: 80px; height: 80px; border: 4px solid white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .qr-label { font-size: 8px; font-weight: bold; color: #94a3b8; margin-top: 5px; text-transform: uppercase; }

            .footer { 
              margin-top: 80px; 
              text-align: center; 
              font-size: 11px; 
              color: #94a3b8; 
              border-top: 1px solid #e2e8f0;
              padding-top: 30px;
            }
            .signature {
              margin-top: 100px;
              display: flex;
              justify-content: space-around;
            }
            .sig-line {
              width: 200px;
              border-top: 1px solid #1e293b;
              text-align: center;
              padding-top: 10px;
              font-size: 12px;
              font-weight: bold;
            }
            @media print {
              body { background: white; padding: 0; }
              .page { margin: 0; box-shadow: none; width: 100%; height: auto; min-height: 0; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="company-info">
                ${settings.receiptLogo ? `<img src="${settings.receiptLogo}" class="logo" />` : ''}
                <div>
                  <h1>${settings.appName}</h1>
                  <p>${settings.profileName}</p>
                  ${settings.receiptCnpj ? `<p style="font-size: 12px; margin-top: 2px;">CNPJ: ${settings.receiptCnpj}</p>` : ''}
                  ${settings.receiptAddress ? `<p style="font-size: 12px; margin-top: 2px;">${settings.receiptAddress}</p>` : ''}
                </div>
              </div>
              <div style="text-align: right;">
                <div class="receipt-badge">Recibo de Pagamento</div>
                <div class="receipt-no">Nº #${payment.id.toString().padStart(6, '0')}</div>
                <div class="receipt-no" style="margin-top: 5px;">Data: ${format(new Date(), 'dd/MM/yyyy')}</div>
              </div>
            </div>
            
            <h2 class="main-title">Comprovante de Transação</h2>
            
            <div class="section">
              <div class="section-title">Informações do Cliente</div>
              <div class="grid">
                <div class="info-item">
                  <span class="label">Cliente</span>
                  <span class="value">${customer?.firstName} ${customer?.lastName}</span>
                </div>
                <div class="info-item">
                  <span class="label">CPF / CNPJ</span>
                  <span class="value">${customer?.cpf || '---'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Empresa</span>
                  <span class="value">${customer?.companyName || '---'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Contato</span>
                  <span class="value">${customer?.phone}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Detalhes do Lançamento</div>
              <div class="grid">
                <div class="info-item">
                  <span class="label">Descrição</span>
                  <span class="value">${payment.description}</span>
                </div>
                <div class="info-item">
                  <span class="label">Data da Compra</span>
                  <span class="value">${format(parseISO(payment.purchaseDate), 'dd/MM/yyyy')}</span>
                </div>
                <div class="info-item">
                  <span class="label">Vencimento Original</span>
                  <span class="value">${format(parseISO(payment.dueDate), 'dd/MM/yyyy')}</span>
                </div>
                <div class="info-item">
                  <span class="label">Meio de Pagamento</span>
                  <span class="value">${payment.paymentMethod}</span>
                </div>
              </div>
            </div>
            
            ${historyHtml ? `
              <div class="section">
                <div class="section-title">Histórico de Amortização</div>
                <div class="table-container">
                  ${historyHtml}
                </div>
              </div>
            ` : ''}
            
            <div class="summary-card">
              <div class="qr-code-container">
                <img src="${settings.receiptQrCode || qrCodeUrl}" class="qr-code" />
                <div class="qr-label">Validar Recibo</div>
              </div>
              <div class="summary-row" style="width: 70%;">
                <span class="summary-label">Valor Total do Débito</span>
                <span class="summary-value">${formatCurrency(payment.totalAmount)}</span>
              </div>
              <div class="summary-row" style="width: 70%;">
                <span class="summary-label">Total Amortizado</span>
                <span class="summary-value" style="color: #10b981;">- ${formatCurrency(payment.paidAmount)}</span>
              </div>
              <div class="summary-row grand-total" style="width: 70%;">
                <span class="summary-label" style="color: #1e293b;">Saldo Devedor Atual</span>
                <span class="summary-value">${formatCurrency(payment.totalAmount - payment.paidAmount)}</span>
              </div>
              ${settings.receiptPixKey ? `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #cbd5e1; width: 70%;">
                  <span class="summary-label" style="font-size: 10px; display: block;">CHAVE PIX PARA PAGAMENTO</span>
                  <span style="font-weight: bold; color: #1e293b; font-size: 14px;">${settings.receiptPixKey}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="signature">
              <div class="sig-line">Assinatura do Responsável</div>
              <div class="sig-line">Assinatura do Cliente</div>
            </div>
            
            <div class="footer">
              <p>Este documento é um comprovante oficial de transação financeira.</p>
              <p>Gerado eletronicamente por <strong>${settings.appName}</strong> em ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    ` : `
      <html>
        <head>
          <title>Recibo Térmico</title>
          <style>
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 80mm; 
              margin: 0; 
              padding: 5mm; 
              font-size: 12px;
              color: #000;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 5mm 0; }
            .logo { width: 40mm; height: auto; margin-bottom: 3mm; }
            .row { display: flex; justify-content: space-between; margin-bottom: 1mm; }
            .qr-code { width: 30mm; height: 30mm; margin: 5mm auto; display: block; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          <div class="center">
            ${settings.receiptLogo ? `<img src="${settings.receiptLogo}" class="logo" />` : ''}
            <div class="bold" style="font-size: 16px;">${settings.appName}</div>
            <div>${settings.profileName}</div>
            ${settings.receiptCnpj ? `<div>CNPJ: ${settings.receiptCnpj}</div>` : ''}
            ${settings.receiptAddress ? `<div>${settings.receiptAddress}</div>` : ''}
            <div class="divider"></div>
            <div class="bold">RECIBO DE PAGAMENTO</div>
            <div>Nº #${payment.id.toString().padStart(6, '0')}</div>
            <div>Data: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="bold">CLIENTE:</div>
          <div>${customer?.firstName} ${customer?.lastName}</div>
          ${customer?.cpf ? `<div>CPF: ${customer?.cpf}</div>` : ''}
          
          <div class="divider"></div>
          
          <div class="bold">DESCRIÇÃO:</div>
          <div>${payment.description}</div>
          <div class="row" style="margin-top: 2mm;">
            <span>Data Compra:</span>
            <span>${format(parseISO(payment.purchaseDate), 'dd/MM/yyyy')}</span>
          </div>
          <div class="row">
            <span>Vencimento:</span>
            <span>${format(parseISO(payment.dueDate), 'dd/MM/yyyy')}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="row bold">
            <span>VALOR TOTAL:</span>
            <span>${formatCurrency(payment.totalAmount)}</span>
          </div>
          <div class="row">
            <span>VALOR PAGO:</span>
            <span>${formatCurrency(payment.paidAmount)}</span>
          </div>
          <div class="row bold" style="font-size: 14px; margin-top: 2mm;">
            <span>SALDO DEVEDOR:</span>
            <span>${formatCurrency(payment.totalAmount - payment.paidAmount)}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="center">
            ${settings.receiptPixKey ? `
              <div class="bold" style="margin-bottom: 2mm;">CHAVE PIX:</div>
              <div style="margin-bottom: 3mm; word-break: break-all;">${settings.receiptPixKey}</div>
            ` : ''}
            <img src="${settings.receiptQrCode || qrCodeUrl}" class="qr-code" />
            <div style="font-size: 10px;">Obrigado pela preferência!</div>
            <div style="font-size: 8px; margin-top: 2mm;">Gerado por ${settings.appName}</div>
          </div>
          
          <script>window.print();</script>
        </body>
      </html>
    `;

    // Salvar recibo no banco de dados
    try {
      await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          content: content
        })
      });
    } catch (err) {
      console.error("Failed to save receipt", err);
      showToast('Erro ao salvar recibo.', 'error');
    }

    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Removed redundant fetchCategories definition

  // Removed redundant addCategory definition

  // Removed redundant deleteCategory definition

  const getAllMovements = () => {
    const movements: any[] = [...transactions.data.map(t => ({...t, source: 'transaction', clientName: '-'}))];
    
    clientPayments.data.forEach(cp => {
      if (cp.paymentHistory) {
        try {
          const history = JSON.parse(cp.paymentHistory);
          history.forEach((h: any) => {
            movements.push({
              id: `cp-${cp.id}-${h.date}`,
              date: h.date,
              description: `Pagamento - ${cp.description}`,
              category: 'Recebimento',
              type: 'income',
              amount: h.amount,
              status: 'Concluído',
              clientName: cp.customerName || 'Cliente',
              source: 'client_payment'
            });
          });
        } catch (e) {}
      }
    });
    
    return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const allMovements = getAllMovements();

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransactionAPI(id);
      setTransactionToDelete(null);
      fetchTransactions(transactionsPage, searchTerm);
    } catch (err) {
      console.error("Failed to delete", err);
      showToast('Erro ao excluir transação.', 'error');
    }
  };

  const handleAddTransaction = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();

    // Validação de avisos
    if (!force && settings.showWarnings) {
      const missingCategory = !newTx.category;
      const missingDescription = !newTx.description;

      if (missingCategory || missingDescription) {
        setWarningType(missingCategory && missingDescription ? 'both' : missingCategory ? 'category' : 'description');
        setShowWarningModal(true);
        return;
      }
    }

    try {
      await saveTransactionAPI({
        ...newTx,
        amount: parseFloat(newTx.amount.toString().replace(',', '.')) || 0,
        category: newTx.category || 'Outros',
        description: newTx.description || 'Sem descrição',
        createdBy: !editingTransaction ? currentUser?.id : undefined,
        updatedBy: currentUser?.id
      }, editingTransaction?.id);
      
      setIsAdding(false);
      setShowWarningModal(false);
      setEditingTransaction(null);
      setNewTx({
        description: '',
        category: '',
        type: 'expense',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      fetchTransactions(transactionsPage, searchTerm);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to save", err);
      showToast('Erro ao salvar transação.', 'error');
    }
  };

  const handleDuplicateTransaction = async (tx: Transaction) => {
    try {
      await saveTransactionAPI({
        description: `${tx.description} (Cópia)`,
        category: tx.category,
        type: tx.type,
        amount: tx.amount,
        date: format(new Date(), 'yyyy-MM-dd'),
        createdBy: currentUser?.id
      });
      fetchTransactions(transactionsPage, searchTerm);
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to duplicate", err);
      showToast('Erro ao duplicar transação.', 'error');
    }
  };

  const downloadCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    const headers = ["Descrição", "Categoria", "Tipo", "Valor", "Data", "Status"];
    const rows = transactions.data.map(t => [
      t.description,
      t.category,
      t.type,
      t.amount,
      t.date,
      t.status
    ]);
    downloadCSV(headers, rows, `relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportServiceOrdersToCSV = () => {
    const headers = ["ID", "Cliente", "Equipamento", "Status", "Prioridade", "Data Entrada", "Total"];
    const rows = serviceOrders.data.map(o => {
      const customer = customers.data.find(c => c.id === o.customerId);
      return [
        `#OS-${o.id}`,
        `${customer?.firstName} ${customer?.lastName}`,
        `${o.equipmentBrand} ${o.equipmentModel}`,
        o.status,
        o.priority,
        o.entryDate || format(parseISO(o.createdAt), 'yyyy-MM-dd'),
        o.totalAmount
      ];
    });
    downloadCSV(headers, rows, `ordens_de_servico_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportCustomersToCSV = () => {
    const headers = ["Nome", "Apelido", "CPF", "Empresa", "Telefone", "Limite de Crédito"];
    const rows = customers.data.map(c => [
      `${c.firstName} ${c.lastName}`,
      c.nickname || '-',
      c.cpf || '-',
      c.companyName || '-',
      c.phone || '-',
      c.creditLimit || '0'
    ]);
    downloadCSV(headers, rows, `clientes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportInventoryToCSV = () => {
    const headers = ["Nome", "Categoria", "SKU", "Preço Unitário", "Estoque"];
    const rows = inventoryItems.map(i => [
      i.name,
      i.category === 'product' ? 'Produto' : 'Serviço',
      i.sku || '-',
      i.unitPrice,
      i.stockLevel || '0'
    ]);
    downloadCSV(headers, rows, `estoque_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportPaymentsToCSV = () => {
    const headers = ["Cliente", "Descrição", "Valor Total", "Valor Pago", "Saldo Devedor", "Vencimento", "Status"];
    const rows = clientPayments.data.map(p => [
      p.customerName,
      p.description,
      p.totalAmount,
      p.paidAmount,
      p.totalAmount - p.paidAmount,
      p.dueDate,
      p.status
    ]);
    downloadCSV(headers, rows, `pagamentos_clientes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const printReport = () => {
    window.print();
  };

  const handleUnlockSettings = () => {
    if (passwordInput === settings.settingsPassword) {
      setIsSettingsUnlocked(true);
      setShowPasswordModal(false);
      setActiveScreen('settings');
      setPasswordInput('');
      showToast('Acesso autorizado!', 'success');
    } else {
      showToast('Senha incorreta!', 'error');
    }
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedData = data.activePayload[0].payload;
      const monthStr = format(clickedData.date, 'yyyy-MM');
      
      setSelectedMonth(monthStr);
      setDateFilterMode('month');
      setActiveScreen('transactions');
    }
  };

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedDate(tx.date);
    setDateFilterMode('day');
    setActiveScreen('transactions');
    // Opcional: Adicionar um pequeno delay para scroll ou highlight
  };

  const totalIncome = stats.totalIncome;
  const totalExpenses = stats.totalExpense;
  const netBalance = settings.initialBalance + stats.balance;

  // Rankings do Dashboard
  const dashboardTransactions = transactions.data.filter(t => format(parseISO(t.date), 'yyyy-MM') === dashboardMonth);
  
  const incomeByCategory = dashboardTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseByCategory = dashboardTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedIncomeRanking = Object.entries(incomeByCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number)) as [string, number][];

  const sortedExpenseRanking = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number)) as [string, number][];

  // Transações Filtradas
  const filteredTransactions = transactions.data.filter(tx => {
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
      matchesDate = format(parseISO(tx.date), 'yyyy-MM') === selectedMonth;
    } else if (dateFilterMode === 'range') {
      const txDate = parseISO(tx.date);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      matchesDate = txDate >= start && txDate <= end;
    }

    return matchesSearch && matchesType && matchesCategory && matchesMin && matchesMax && matchesDate;
  });

  const filteredClientPayments = clientPayments.data.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(paymentSearchTerm.toLowerCase()) || 
                          payment.description.toLowerCase().includes(paymentSearchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

    switch (paymentFilterStatus) {
      case 'paid': return payment.status === 'paid';
      case 'partial': return payment.status === 'partial';
      case 'pending': return payment.status === 'pending' && !isOverdue;
      case 'overdue': return isOverdue;
      default: return true;
    }
  }).sort((a, b) => {
    if (paymentSortMode === 'amount') {
      return b.totalAmount - a.totalAmount;
    } else if (paymentSortMode === 'alphabetical') {
      return a.customerName.localeCompare(b.customerName);
    } else {
      // Default: date (newest first)
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
  });

  // Gerar dados dinâmicos para o gráfico com base nos últimos 6 meses
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const chartData = last6Months.map(month => {
    const monthName = format(month, 'MMM', { locale: ptBR });
    const monthTransactions = transactions.data.filter(t => isSameMonth(parseISO(t.date), month));
    
    return {
      name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      fullName: format(month, 'MMMM yyyy', { locale: ptBR }),
      renda: monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
      despesa: monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
      date: month
    };
  });

  const handleLogin = (user: User) => {
    login(user);
    setActiveScreen('dashboard');
  };

  const handleLogout = () => {
    logout();
    setActiveScreen('dashboard');
  };

  const handleAddInventoryItem = async (item: any) => {
    try {
      await saveInventoryItemAPI({ ...item, createdBy: currentUser?.id });
      fetchInventoryItems();
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to add inventory item", err);
      showToast('Erro ao adicionar item ao estoque.', 'error');
    }
  };

  const handleUpdateInventoryItem = async (id: number, item: any) => {
    try {
      await saveInventoryItemAPI({ ...item, updatedBy: currentUser?.id }, id);
      fetchInventoryItems();
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to update inventory item", err);
      showToast('Erro ao atualizar item do estoque.', 'error');
    }
  };

  const handleDeleteInventoryItem = async (id: number) => {
    try {
      await deleteInventoryItemAPI(id);
      fetchInventoryItems();
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to delete inventory item", err);
      showToast('Erro ao excluir item do estoque.', 'error');
    }
  };

  const handleAddServiceOrder = async (order: any) => {
    try {
      const data = await saveServiceOrderAPI({ ...order, createdBy: currentUser?.id });
      fetchServiceOrders();
      fetchAuditLogs();
      showToast('Ordem de serviço adicionada com sucesso!', 'success');
      return data.id;
    } catch (err: any) {
      console.error("Failed to add service order", err);
      showToast(`Erro ao adicionar: ${err.message || 'Erro desconhecido'}`, 'error');
      return null;
    }
  };

  const handleUpdateServiceOrder = async (id: number, order: any) => {
    try {
      await saveServiceOrderAPI({ ...order, updatedBy: currentUser?.id }, id);
      fetchServiceOrders();
      fetchInventoryItems(); // Refresh inventory as stock might have changed
      fetchAuditLogs();
      showToast('Ordem de serviço atualizada com sucesso!', 'success');
      return true;
    } catch (err: any) {
      console.error("Failed to update service order", err);
      showToast(`Erro ao atualizar: ${err.message || 'Erro desconhecido'}`, 'error');
      return false;
    }
  };

  const handleAddServiceOrderStatus = async (status: any) => {
    try {
      await addServiceOrderStatusAPI(status);
      fetchServiceOrderStatuses();
    } catch (err) {
      console.error("Failed to add service order status", err);
      showToast('Erro ao adicionar status da OS.', 'error');
    }
  };

  const handleDeleteServiceOrderStatus = async (id: number) => {
    try {
      await deleteServiceOrderStatusAPI(id);
      fetchServiceOrderStatuses();
    } catch (err) {
      console.error("Failed to delete service order status", err);
      showToast('Erro ao excluir status da OS.', 'error');
    }
  };

  const handleDeleteServiceOrder = async (id: number) => {
    try {
      await deleteServiceOrderAPI(id);
      fetchServiceOrders();
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to delete service order", err);
      showToast('Erro ao excluir ordem de serviço.', 'error');
    }
  };

  const getHeaderConfig = () => {
    switch (activeScreen) {
      case 'dashboard':
        return { title: 'Painel de Controle' };
      case 'transactions':
        return { 
          title: 'Transações Diárias',
          export: { label: 'Exportar CSV', icon: Download, onClick: exportToCSV },
          newButton: { label: 'Nova Entrada', icon: Plus, onClick: () => setIsAdding(true) }
        };
      case 'service-orders':
        return { 
          title: 'Ordens de Serviço',
          export: { label: 'Exportar CSV', icon: Download, onClick: exportServiceOrdersToCSV },
          newButton: { label: 'Nova Ordem', icon: Plus, onClick: () => setIsAddingServiceOrder(true) }
        };
      case 'customers':
        return { 
          title: 'Gestão de Clientes',
          export: { label: 'Exportar CSV', icon: Download, onClick: exportCustomersToCSV },
          newButton: { 
            label: 'Novo Cliente', 
            icon: Users, 
            onClick: () => {
              setEditingCustomer(null);
              setNewCustomer({
                firstName: '',
                lastName: '',
                nickname: '',
                cpf: '',
                companyName: '',
                phone: '',
                observation: '',
                creditLimit: ''
              });
              setIsAddingCustomer(true);
            } 
          }
        };
      case 'inventory':
        return { 
          title: 'Produtos & Serviços',
          export: { label: 'Exportar CSV', icon: Download, onClick: exportInventoryToCSV },
          newButton: { label: 'Novo Item', icon: Package, onClick: () => setIsAddingInventoryItem(true) }
        };
      case 'client-payments':
        return { 
          title: 'Vendas e Pagamentos',
          export: { label: 'Exportar CSV', icon: Download, onClick: exportPaymentsToCSV },
          newButton: { label: 'Novo Pagamento', icon: CreditCard, onClick: () => setIsAddingClientPayment(true) }
        };
      case 'reports':
        return { 
          title: 'Relatórios e Análises',
          export: { label: 'Imprimir', icon: Printer, onClick: printReport }
        };
      case 'settings':
        return { title: 'Configurações do Sistema' };
      default:
        return { title: 'FinanceFlow' };
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-bg-dark text-slate-100 selection:bg-primary/30">
      <div className="flex flex-1 app-main-wrapper">
        {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-50 bg-bg-dark/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Global Notification Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-bg-dark/40 backdrop-blur-sm" 
            onClick={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "border-r border-white/5 flex flex-col bg-slate-900/50 backdrop-blur-xl fixed lg:sticky top-0 h-screen z-50 transition-all duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isSidebarCollapsed ? "w-20 overflow-visible" : "w-72"
        )}
      >
        <div className={cn(
          "flex items-center transition-all duration-300",
          isSidebarCollapsed ? "p-4 justify-center" : "p-8 justify-between"
        )}>
          <div className={cn(
            "flex items-center gap-4 transition-all duration-300",
            isSidebarCollapsed ? "gap-0" : "gap-4"
          )}>
            <div className={cn(
              "h-12 w-12 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-white shadow-[0_0_20px_rgba(17,82,212,0.3)] transition-all duration-300",
              isSidebarCollapsed && "scale-90"
            )}>
              <Wallet size={24} />
            </div>
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0, x: -10 }}
                  animate={{ opacity: 1, width: "auto", x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -10 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  <h1 className="font-bold text-xl tracking-tight">{settings.appName}</h1>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-70">{settings.appVersion}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSidebarCollapsed(true)} 
                className="hidden lg:flex p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title="Recolher Menu"
              >
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500">
                <X size={20} />
              </button>
            </div>
          )}
          
          {isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(false)}
              className="absolute -right-3 top-10 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border border-white/10 hover:scale-110 transition-all z-[60]"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        <nav className={cn(
          "flex-1 transition-all duration-300",
          isSidebarCollapsed ? "px-2 py-2 space-y-0.5 overflow-visible" : "px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar"
        )}>
          {hasPermission('view_dashboard') && (
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Painel" 
              active={activeScreen === 'dashboard'} 
              collapsed={isSidebarCollapsed}
              onClick={() => { setActiveScreen('dashboard'); setIsSidebarOpen(false); }} 
            />
          )}

          <div className={cn(
            "px-4 overflow-hidden transition-all duration-300",
            isSidebarCollapsed ? "pt-4 pb-2" : "pt-8 pb-4"
          )}>
            {isSidebarCollapsed ? (
              <div className="h-px bg-white/5 w-full" />
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Operacional</p>
            )}
          </div>

          <SidebarItem 
            icon={Briefcase} 
            label="Ordens de Serviço" 
            active={activeScreen === 'service-orders'} 
            collapsed={isSidebarCollapsed}
            onClick={() => { setActiveScreen('service-orders'); setIsSidebarOpen(false); }} 
          />

          <SidebarItem 
            icon={ShoppingBag} 
            label="Produtos & Serviços" 
            active={activeScreen === 'inventory'} 
            collapsed={isSidebarCollapsed}
            onClick={() => { setActiveScreen('inventory'); setIsSidebarOpen(false); }} 
          />

          <div className={cn(
            "px-4 overflow-hidden transition-all duration-300",
            isSidebarCollapsed ? "pt-4 pb-2" : "pt-8 pb-4"
          )}>
            {isSidebarCollapsed ? (
              <div className="h-px bg-white/5 w-full" />
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Financeiro</p>
            )}
          </div>

          {hasPermission('manage_transactions') && (
            <SidebarItem 
              icon={ReceiptText} 
              label="Transações Diárias" 
              active={activeScreen === 'transactions'} 
              collapsed={isSidebarCollapsed}
              onClick={() => { setActiveScreen('transactions'); setIsSidebarOpen(false); }} 
            />
          )}

          {hasPermission('view_reports') && (
            <SidebarItem 
              icon={BarChart3} 
              label="Relatórios" 
              active={activeScreen === 'reports'} 
              collapsed={isSidebarCollapsed}
              onClick={() => { setActiveScreen('reports'); setIsSidebarOpen(false); }} 
            />
          )}
          
          {(hasPermission('manage_customers') || hasPermission('manage_payments')) && (
            <div className={cn(
              "px-4 overflow-hidden transition-all duration-300",
              isSidebarCollapsed ? "pt-4 pb-2" : "pt-8 pb-4"
            )}>
              {isSidebarCollapsed ? (
                <div className="h-px bg-white/5 w-full" />
              ) : (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Clientes</p>
              )}
            </div>
          )}

          {hasPermission('manage_customers') && (
            <SidebarItem 
              icon={Users} 
              label="Gestão de Clientes" 
              active={activeScreen === 'customers'} 
              collapsed={isSidebarCollapsed}
              onClick={() => { setActiveScreen('customers'); setIsSidebarOpen(false); }} 
            />
          )}

          {hasPermission('manage_payments') && (
            <SidebarItem 
              icon={CreditCard} 
              label="Vendas e Pagamentos" 
              active={activeScreen === 'client-payments'} 
              collapsed={isSidebarCollapsed}
              onClick={() => { setActiveScreen('client-payments'); setIsSidebarOpen(false); }} 
            />
          )}
          
          <div className={cn(
            "px-4 overflow-hidden transition-all duration-300",
            isSidebarCollapsed ? "pt-4 pb-2" : "pt-8 pb-4"
          )}>
            {isSidebarCollapsed ? (
              <div className="h-px bg-white/5 w-full" />
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Sistema</p>
            )}
          </div>
          
          {hasPermission('manage_settings') && (
            <SidebarItem 
              icon={Settings} 
              label="Configurações" 
              active={activeScreen === 'settings'} 
              collapsed={isSidebarCollapsed}
              onClick={() => { 
                if (isSettingsUnlocked) {
                  setActiveScreen('settings'); 
                } else {
                  setShowPasswordModal(true);
                }
                setIsSidebarOpen(false); 
              }} 
            />
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all duration-300 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 group relative",
              isSidebarCollapsed && "justify-center px-0 py-2.5"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
                Sair
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
              </div>
            )}
          </button>
        </nav>

        <div className={cn(
          "border-t border-white/5 transition-all duration-300",
          isSidebarCollapsed ? "p-2" : "p-6"
        )}>
          <div className={cn(
            "flex items-center gap-4 rounded-2xl bg-white/5 border border-white/5 relative group hover:bg-white/10 transition-all",
            isSidebarCollapsed ? "justify-center p-1.5" : "p-3"
          )}>
            <div className={cn(
              "shrink-0 rounded-full bg-slate-700 overflow-hidden border-2 border-primary/20 transition-all",
              isSidebarCollapsed ? "h-9 w-9" : "h-10 w-10"
            )}>
              <img 
                src={settings.profileAvatar} 
                alt="Perfil" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-sm font-bold truncate">{currentUser?.name || settings.profileName}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    {currentUser?.role === 'owner' ? 'Admin' : currentUser?.role === 'manager' ? 'Gerente' : 'Funcionário'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
                {currentUser?.name || settings.profileName}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className={cn(
          "h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-bg-dark/80 backdrop-blur-md sticky top-0 transition-all",
          showNotifications ? "z-[60]" : "z-30"
        )}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:bg-white/5 rounded-xl transition-colors"
            >
              <LayoutDashboard size={20} />
            </button>
            <h2 className="text-xl font-bold tracking-tight">
              {getHeaderConfig().title}
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Ano Fiscal {settings.fiscalYear}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setFontSize(Math.max(fontSize - 2, 12))}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Diminuir fonte"
              >
                <span className="text-sm font-bold">A-</span>
              </button>
              <button
                onClick={() => setFontSize(16)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Tamanho original"
              >
                <span className="text-sm font-bold">A</span>
              </button>
              <button
                onClick={() => setFontSize(Math.min(fontSize + 2, 24))}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Aumentar fonte"
              >
                <span className="text-sm font-bold">A+</span>
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-slate-400 hover:bg-white/5 rounded-xl transition-colors relative z-50"
              >
                <Bell size={20} />
                {totalNotifications > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-bg-dark"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 glass-card border border-white/10 shadow-2xl z-50 overflow-hidden"
                  >
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="font-bold text-sm tracking-tight mb-3">Notificações</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setNotificationTab('payments')}
                            className={cn(
                              "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors relative",
                              notificationTab === 'payments' ? "bg-primary/20 text-primary" : "text-slate-400 hover:bg-white/5"
                            )}
                          >
                            Pagamentos
                            {totalPaymentNotifications > 0 && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                            )}
                          </button>
                          <button
                            onClick={() => setNotificationTab('service-orders')}
                            className={cn(
                              "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors relative",
                              notificationTab === 'service-orders' ? "bg-primary/20 text-primary" : "text-slate-400 hover:bg-white/5"
                            )}
                          >
                            Ordens de Serviço
                            {totalServiceOrderNotifications > 0 && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                        {notificationTab === 'payments' ? (
                          totalPaymentNotifications === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                <Bell size={20} />
                              </div>
                              <p className="text-slate-500 text-sm font-medium">Nenhuma notificação</p>
                              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Tudo em dia!</p>
                            </div>
                          ) : (
                            <>
                              {overdueDebts.map(p => (
                                <div key={p.id} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-1 cursor-pointer hover:bg-rose-500/20 transition-colors" onClick={() => { setActiveScreen('client-payments'); setShowNotifications(false); }}>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Vencido</span>
                                    <span className="text-[10px] text-slate-400">{format(parseISO(p.dueDate), 'dd/MM')}</span>
                                  </div>
                                  <p className="text-sm font-bold truncate">{p.customerName}</p>
                                  <p className="text-xs text-slate-300 truncate">{p.description}</p>
                                  <p className="text-sm font-black text-rose-500">{formatCurrency(p.totalAmount - p.paidAmount)}</p>
                                </div>
                              ))}
                              {dueTodayDebts.map(p => (
                                <div key={p.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1 cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => { setActiveScreen('client-payments'); setShowNotifications(false); }}>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Vence Hoje</span>
                                    <span className="text-[10px] text-slate-400">{format(parseISO(p.dueDate), 'dd/MM')}</span>
                                  </div>
                                  <p className="text-sm font-bold truncate">{p.customerName}</p>
                                  <p className="text-xs text-slate-300 truncate">{p.description}</p>
                                  <p className="text-sm font-black text-amber-500">{formatCurrency(p.totalAmount - p.paidAmount)}</p>
                                </div>
                              ))}
                              {upcomingDebts.map(p => (
                                <div key={p.id} className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col gap-1 cursor-pointer hover:bg-yellow-500/20 transition-colors" onClick={() => { setActiveScreen('client-payments'); setShowNotifications(false); }}>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Vence em Breve</span>
                                    <span className="text-[10px] text-slate-400">{format(parseISO(p.dueDate), 'dd/MM')}</span>
                                  </div>
                                  <p className="text-sm font-bold truncate">{p.customerName}</p>
                                  <p className="text-xs text-slate-300 truncate">{p.description}</p>
                                  <p className="text-sm font-black text-yellow-500">{formatCurrency(p.totalAmount - p.paidAmount)}</p>
                                </div>
                              ))}
                            </>
                          )
                        ) : (
                          totalServiceOrderNotifications === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                <Bell size={20} />
                              </div>
                              <p className="text-slate-500 text-sm font-medium">Nenhuma notificação</p>
                              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Tudo em dia!</p>
                            </div>
                          ) : (
                            <>
                              {overdueServiceOrders.map(o => (
                                <div key={o.id} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-1 cursor-pointer hover:bg-rose-500/20 transition-colors" onClick={() => { setActiveScreen('service-orders'); setShowNotifications(false); }}>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Atrasado</span>
                                    <span className="text-[10px] text-slate-400">{o.analysisPrediction && format(parseISO(o.analysisPrediction), 'dd/MM')}</span>
                                  </div>
                                  <p className="text-sm font-bold truncate">OS #{o.id.toString().padStart(4, '0')} - {o.firstName} {o.lastName}</p>
                                  <p className="text-xs text-slate-300 truncate">{o.equipmentBrand} {o.equipmentModel}</p>
                                  <p className="text-xs font-bold text-slate-400">{o.status}</p>
                                </div>
                              ))}
                              {dueTodayServiceOrders.map(o => (
                                <div key={o.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1 cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => { setActiveScreen('service-orders'); setShowNotifications(false); }}>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Previsão Hoje</span>
                                    <span className="text-[10px] text-slate-400">{o.analysisPrediction && format(parseISO(o.analysisPrediction), 'dd/MM')}</span>
                                  </div>
                                  <p className="text-sm font-bold truncate">OS #{o.id.toString().padStart(4, '0')} - {o.firstName} {o.lastName}</p>
                                  <p className="text-xs text-slate-300 truncate">{o.equipmentBrand} {o.equipmentModel}</p>
                                  <p className="text-xs font-bold text-slate-400">{o.status}</p>
                                </div>
                              ))}
                              {upcomingServiceOrders.map(o => (
                                <div key={o.id} className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col gap-1 cursor-pointer hover:bg-yellow-500/20 transition-colors" onClick={() => { setActiveScreen('service-orders'); setShowNotifications(false); }}>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Previsão em Breve</span>
                                    <span className="text-[10px] text-slate-400">{o.analysisPrediction && format(parseISO(o.analysisPrediction), 'dd/MM')}</span>
                                  </div>
                                  <p className="text-sm font-bold truncate">OS #{o.id.toString().padStart(4, '0')} - {o.firstName} {o.lastName}</p>
                                  <p className="text-xs text-slate-300 truncate">{o.equipmentBrand} {o.equipmentModel}</p>
                                  <p className="text-xs font-bold text-slate-400">{o.status}</p>
                                </div>
                              ))}
                            </>
                          )
                        )}
                      </div>
                      <div className="p-3 border-t border-white/5 bg-white/5">
                        {notificationTab === 'payments' ? (
                          <button 
                            onClick={() => { setActiveScreen('client-payments'); setShowNotifications(false); }}
                            className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                          >
                            Ver Todos os Pagamentos
                          </button>
                        ) : (
                          <button 
                            onClick={() => { setActiveScreen('service-orders'); setShowNotifications(false); }}
                            className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                          >
                            Ver Todas as Ordens de Serviço
                          </button>
                        )}
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>
            <div className="flex gap-2">
               {getHeaderConfig().export && (
                 <button 
                  onClick={getHeaderConfig().export?.onClick}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-white/10 transition-all hover:border-white/20"
                >
                  {React.createElement(getHeaderConfig().export?.icon || Download, { size: 16 })}
                  {getHeaderConfig().export?.label || 'Exportar'}
                </button>
               )}
               {getHeaderConfig().newButton && (
                <button 
                  onClick={getHeaderConfig().newButton?.onClick}
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_10px_20px_-5px_rgba(17,82,212,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(17,82,212,0.5)] hover:scale-[1.02] active:scale-95"
                >
                  {React.createElement(getHeaderConfig().newButton?.icon || Plus, { size: 18 })}
                  {getHeaderConfig().newButton?.label}
                </button>
               )}
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
          {activeScreen === 'dashboard' ? (
            <Dashboard 
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              netBalance={netBalance}
              chartData={chartData}
              handleChartClick={handleChartClick}
              sortedIncomeRanking={sortedIncomeRanking}
              sortedExpenseRanking={sortedExpenseRanking}
            />
          ) : activeScreen === 'transactions' ? (
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
            />
          ) : activeScreen === 'reports' ? (
            <Reports 
              chartData={chartData}
              handleChartClick={handleChartClick}
              categories={categories}
              transactions={transactions.data}
            />
          ) : activeScreen === 'customers' ? (
            <Customers 
              customers={customers}
              clientPayments={clientPayments}
              onDelete={(id) => {
                const customer = customers.data.find(c => c.id === id);
                if (customer) handleDeleteCustomer(customer);
              }}
              onAddPayment={(customer) => {
                setNewClientPayment({ ...newClientPayment, customerId: customer.id });
                setActiveScreen('client-payments');
                setIsAddingClientPayment(true);
              }}
              onViewHistory={(customer) => {
                setHistoryCustomer(customer);
                setShowHistoryModal(true);
              }}
              onPageChange={setCustomersPage}
            />
          ) : activeScreen === 'client-payments' ? (
            <ClientPayments 
              filteredClientPayments={filteredClientPayments}
              generateReceipt={generateReceipt}
              sendWhatsAppReminder={sendWhatsAppReminder}
              handleDeleteClientPayment={handleDeleteClientPayment}
              handleDeleteClientPaymentGroup={handleDeleteClientPaymentGroup}
              handleRecordPayment={handleRecordPayment}
              customers={customers.data}
              handleAddClientPayment={handleAddClientPayment}
              isSaving={isSaving}
              pagination={{
                currentPage: clientPayments.meta.page,
                totalPages: clientPayments.meta.totalPages,
                totalItems: clientPayments.meta.total,
                limit: clientPayments.meta.limit
              }}
              onPageChange={setPaymentsPage}
            />
          ) : activeScreen === 'service-orders' ? (
            <ServiceOrders 
              orders={serviceOrders}
              customers={customers}
              inventoryItems={inventoryItems}
              statuses={serviceOrderStatuses}
              equipmentTypes={equipmentTypes}
              brands={brands}
              models={models}
              clientPayments={clientPayments}
              onAddOrder={handleAddServiceOrder}
              onUpdateOrder={handleUpdateServiceOrder}
              onDeleteOrder={handleDeleteServiceOrder}
              onAddStatus={handleAddServiceOrderStatus}
              onDeleteStatus={handleDeleteServiceOrderStatus}
              onAddEquipmentType={handleAddEquipmentType}
              onAddBrand={handleAddBrand}
              onAddModel={handleAddModel}
              onPrintBlankForm={handlePrintBlankForm}
              onTriggerAddCustomer={() => {
                setEditingCustomer(null);
                setNewCustomer({
                  firstName: '',
                  lastName: '',
                  nickname: '',
                  cpf: '',
                  companyName: '',
                  phone: '',
                  observation: '',
                  creditLimit: ''
                });
                setIsAddingCustomer(true);
              }}
              pagination={{
                currentPage: serviceOrders.meta.page,
                totalPages: serviceOrders.meta.totalPages,
                totalItems: serviceOrders.meta.total,
                limit: serviceOrders.meta.limit
              }}
              onPageChange={setServiceOrdersPage}
            />
          ) : activeScreen === 'inventory' ? (
            <Inventory
              items={inventoryItems}
              onAddItem={handleAddInventoryItem}
              onUpdateItem={handleUpdateInventoryItem}
              onDeleteItem={handleDeleteInventoryItem}
            />
          ) : (
            /* Settings Screen */
            <SettingsLayout 
              categories={categories}
              addCategory={addCategory}
              deleteCategory={deleteCategory}
              addUser={handleAddUser}
              updateUser={handleUpdateUser}
              deleteUser={handleDeleteUser}
              transactions={transactions.data}
              customers={customers.data}
              clientPayments={clientPayments.data}
              brands={brands}
              models={models}
              addBrand={handleAddBrand}
              deleteBrand={handleDeleteBrand}
              addModel={handleAddModel}
              deleteModel={handleDeleteModel}
              equipmentTypes={equipmentTypes}
              addEquipmentType={handleAddEquipmentType}
              deleteEquipmentType={handleDeleteEquipmentType}
            />
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-dark/80 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around pb-safe">
          <button 
            onClick={() => setActiveScreen('dashboard')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeScreen === 'dashboard' ? "text-primary" : "text-slate-500"
            )}
          >
            <LayoutDashboard size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Início</span>
          </button>
          <button 
            onClick={() => setActiveScreen('service-orders')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeScreen === 'service-orders' ? "text-primary" : "text-slate-500"
            )}
          >
            <Briefcase size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Ordens</span>
          </button>
          <button 
            onClick={() => setActiveScreen('client-payments')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeScreen === 'client-payments' ? "text-primary" : "text-slate-500"
            )}
          >
            <CreditCard size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Vendas</span>
          </button>
          <button 
            onClick={() => setActiveScreen('customers')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeScreen === 'customers' ? "text-primary" : "text-slate-500"
            )}
          >
            <Users size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Clientes</span>
          </button>
          <button 
            onClick={() => setActiveScreen('inventory')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeScreen === 'inventory' ? "text-primary" : "text-slate-500"
            )}
          >
            <Package size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Estoque</span>
          </button>
        </div>

        <footer className="py-10 px-10 text-center border-t border-white/5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">© 2024 FinanceFlow Inc. Todos os direitos reservados.</p>
        </footer>
      </main>

      {/* Global Customer Modals */}
      <CustomerModal 
        isOpen={isAddingCustomer}
        onClose={() => {
          setIsAddingCustomer(false);
          setEditingCustomer(null);
        }}
        editingCustomer={editingCustomer}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        onSave={handleAddCustomer}
      />

      <CustomerWarningModal 
        isOpen={showCustomerWarningModal}
        onClose={() => setShowCustomerWarningModal(false)}
        type={customerWarningType}
        onConfirm={() => handleAddCustomer(true)}
      />

      <CustomerDeleteWarningModal 
        customer={customerToDelete}
        paymentsWarning={customerPaymentsWarning}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={confirmDeleteCustomerWithPayments}
        onGoToPayments={() => {
          setCustomerToDelete(null);
          setActiveScreen('client-payments');
        }}
        formatCurrency={formatCurrency}
      />

      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
        onUnlock={handleUnlockSettings}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
      />

      <WarningModal 
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        type={warningType}
        onConfirm={() => handleAddTransaction(undefined, true)}
        showWarnings={settings.showWarnings}
        setShowWarnings={(val: boolean) => updateSettings({ ...settings, showWarnings: val })}
      />

      <AddTransactionModal 
        isOpen={isAdding}
        onClose={() => {
          setIsAdding(false);
          setEditingTransaction(null);
          setNewTx({
            description: '',
            category: '',
            type: 'expense',
            amount: '',
            date: format(new Date(), 'yyyy-MM-dd')
          });
        }}
        editingTransaction={editingTransaction}
        newTx={newTx}
        setNewTx={setNewTx}
        categories={categories}
        onSubmit={handleAddTransaction}
      />

      <DeleteConfirmationModal 
        isOpen={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => {
          if (transactionToDelete !== null) {
            handleDeleteTransaction(transactionToDelete);
            setTransactionToDelete(null);
          }
        }}
      />

      <DeleteConfirmationModal 
        isOpen={clientPaymentToDelete !== null}
        onClose={() => setClientPaymentToDelete(null)}
        onConfirm={confirmDeleteClientPayment}
        title="Excluir Venda/Pagamento"
        message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita e afetará o saldo do cliente."
      />
      </div>



      {/* Print styles and Dynamic Theme */}
      <style>{`
        :root {
          --color-primary: ${settings.primaryColor};
        }
      `}</style>
      <CustomerHistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        customer={historyCustomer}
        clientPayments={clientPayments.data}
        serviceOrders={serviceOrders.data}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
