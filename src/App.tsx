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
import { Transaction, Screen, AppSettings, Customer, ClientPayment, Category, User, AuditLog, InventoryItem, ServiceOrder, ServiceOrderStatus, Brand, Model } from './types';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { Login } from './components/Login';
import { ServiceOrders } from './components/ServiceOrders';
import { Inventory } from './components/Inventory';
import { CustomerSearchSelect } from './components/CustomerSearchSelect';

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
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handlePrintBlankForm = () => {
    console.log("Directly triggering print via new window...");
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Ficha em Branco - ${settings.appName || 'FinanceFlow'}</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 0; 
              color: #000; 
              background: #fff; 
              margin: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              height: 100vh;
            }
            .form-container { 
              width: 210mm; 
              height: 148mm; 
              border-bottom: 2px dashed #000; 
              padding: 30px 40px; 
              box-sizing: border-box;
              background: #fff;
              overflow: hidden;
            }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
            .header-left { display: flex; align-items: center; gap: 20px; }
            .logo { max-height: 60px; max-width: 120px; object-fit: contain; }
            .title h1 { margin: 0; font-size: 32px; font-weight: 900; text-transform: uppercase; line-height: 1; }
            .title p { margin: 5px 0 0 0; font-size: 13px; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 1.5px; }
            .entry-date { text-align: right; }
            .entry-date p { margin: 0; font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; }
            .date-line { width: 130px; height: 26px; border-bottom: 2px solid #000; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
            .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 12px; }
            .field { margin-bottom: 12px; }
            .field label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #374151; margin-bottom: 3px; }
            .field-line { width: 100%; height: 22px; border-bottom: 1px solid #9ca3af; }
            .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .problem-section { margin-bottom: 25px; }
            .problem-box { width: 100%; height: 70px; border: 2px solid #e5e7eb; border-radius: 8px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 45px; }
            .sig-box { border-top: 2px solid #000; text-align: center; padding-top: 6px; }
            .sig-box p { margin: 0; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .footer-note { margin-top: 20px; text-align: center; font-size: 9px; color: #6b7280; font-style: italic; text-transform: uppercase; letter-spacing: 1.2px; }
          </style>
        </head>
        <body>
          <div class="form-container">
            <div class="header">
              <div class="header-left">
                ${settings.receiptLogo ? `<img src="${settings.receiptLogo}" class="logo" />` : ''}
                <div class="title">
                  <h1>${settings.appName || 'FinanceFlow Inc.'}</h1>
                  <p>Ficha de Entrada de Equipamento</p>
                </div>
              </div>
              <div class="entry-date">
                <p>Data de Entrada</p>
                <div class="date-line"></div>
              </div>
            </div>
            <div class="grid">
              <div class="section">
                <div class="section-title">Dados do Cliente</div>
                <div class="field">
                  <label>Nome Completo</label>
                  <div class="field-line"></div>
                </div>
                <div class="field-grid">
                  <div class="field">
                    <label>Telefone / WhatsApp</label>
                    <div class="field-line"></div>
                  </div>
                  <div class="field">
                    <label>CPF / CNPJ</label>
                    <div class="field-line"></div>
                  </div>
                </div>
                <div class="field">
                  <label>Endereço</label>
                  <div class="field-line"></div>
                </div>
              </div>
              <div class="section">
                <div class="section-title">Dados do Equipamento</div>
                <div class="field-grid">
                  <div class="field">
                    <label>Marca</label>
                    <div class="field-line"></div>
                  </div>
                  <div class="field">
                    <label>Modelo</label>
                    <div class="field-line"></div>
                  </div>
                </div>
                <div class="field-grid">
                  <div class="field">
                    <label>Nº de Série</label>
                    <div class="field-line"></div>
                  </div>
                  <div class="field">
                    <label>Cor / Acessórios</label>
                    <div class="field-line"></div>
                  </div>
                </div>
                <div class="field">
                  <label>Senha do Equipamento</label>
                  <div class="field-line"></div>
                </div>
              </div>
            </div>
            <div class="problem-section">
              <div class="section-title">Relato do Problema / Defeito</div>
              <div class="problem-box"></div>
            </div>
            <div class="signatures">
              <div class="sig-box">
                <p>Assinatura do Cliente</p>
              </div>
              <div class="sig-box">
                <p>Responsável pelo Recebimento</p>
              </div>
            </div>
            <div class="footer-note">
              Esta ficha deve ser grampeada ou fixada ao equipamento para identificação interna.
            </div>
          </div>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };
  const [expandedPayments, setExpandedPayments] = useState<number[]>([]);
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>('all');
  const [paymentSearchTerm, setPaymentSearchTerm] = useState<string>('');
  const [paymentSortMode, setPaymentSortMode] = useState<'date' | 'amount' | 'alphabetical'>('date');

  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerPaymentsWarning, setCustomerPaymentsWarning] = useState<any[]>([]);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [dateFilterMode, setDateFilterMode] = useState<'day' | 'month' | 'range' | 'all'>('day');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [reportMonth, setReportMonth] = useState<string | null>(null);
  const [reportView, setReportView] = useState<'charts' | 'table'>('charts');

  // Filtros e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Segurança
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Avisos
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningType, setWarningType] = useState<'category' | 'description' | 'both'>('both');

  const [showCustomerWarningModal, setShowCustomerWarningModal] = useState(false);
  const [customerWarningType, setCustomerWarningType] = useState<'cpf' | 'phone' | 'both'>('both');

  // Configurações do App
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'Financeiro Pro',
    fiscalYear: '2024',
    primaryColor: '#1152d4',
    categories: 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
    incomeCategories: 'Salário,Vendas,Serviços,Investimentos,Outros',
    expenseCategories: 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
    profileName: 'Inova Informática',
    profileAvatar: 'https://picsum.photos/seed/inova/100/100',
    appVersion: 'Versão Empresarial',
    initialBalance: 0,
    showWarnings: true,
    hiddenColumns: [],
    settingsPassword: '1234',
    receiptLayout: 'a4',
    receiptLogo: '',
    receiptCnpj: '',
    receiptAddress: '',
    receiptPixKey: '',
    receiptQrCode: ''
  });

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [dashboardMonth, setDashboardMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  
  // Estado do formulário de nova transação
  const [newTx, setNewTx] = useState({
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // Clientes e Pagamentos
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [serviceOrderStatuses, setServiceOrderStatuses] = useState<ServiceOrderStatus[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingClientPayment, setIsAddingClientPayment] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState<ClientPayment | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [directOsId, setDirectOsId] = useState<number | null>(null);
  const [directMode, setDirectMode] = useState<string | null>(null);
  
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    cpf: '',
    companyName: '',
    phone: '',
    observation: '',
    creditLimit: ''
  });

  const [newClientPayment, setNewClientPayment] = useState({
    customerId: 0,
    description: '',
    totalAmount: '',
    paidAmount: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'Dinheiro',
    installmentsCount: 1,
    type: 'income' as 'income' | 'expense'
  });

  const togglePaymentExpansion = (id: number) => {
    setExpandedPayments(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handlePrevMonth = () => {
    const [year, month] = dashboardMonth.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    d.setMonth(d.getMonth() - 1);
    setDashboardMonth(format(d, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const [year, month] = dashboardMonth.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    d.setMonth(d.getMonth() + 1);
    setDashboardMonth(format(d, 'yyyy-MM'));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDebts = clientPayments.filter(p => {
    if (p.status === 'paid') return false;
    const dueDate = parseISO(p.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  });

  const dueTodayDebts = clientPayments.filter(p => {
    if (p.status === 'paid') return false;
    const dueDate = parseISO(p.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const overdueDebts = clientPayments.filter(p => {
    if (p.status === 'paid') return false;
    const dueDate = parseISO(p.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() < today.getTime();
  });

  const totalNotifications = upcomingDebts.length + dueTodayDebts.length + overdueDebts.length;

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
      fetchTransactions();
      fetchSettings();
      fetchCustomers();
      fetchClientPayments();
      fetchCategories();
      fetchUsers();
      fetchAuditLogs();
      fetchInventoryItems();
      fetchServiceOrders();
      fetchServiceOrderStatuses();
      fetchBrands();
      fetchModels();
    }
  }, [isAuthenticated]);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      console.error("Failed to fetch brands", err);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data);
    } catch (err) {
      console.error("Failed to fetch models", err);
    }
  };

  const fetchServiceOrderStatuses = async () => {
    try {
      const res = await fetch('/api/service-order-statuses');
      const data = await res.json();
      setServiceOrderStatuses(data);
    } catch (err) {
      console.error("Failed to fetch service order statuses", err);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventoryItems(data);
    } catch (err) {
      console.error("Failed to fetch inventory items", err);
    }
  };

  const fetchServiceOrders = async () => {
    try {
      const res = await fetch('/api/service-orders');
      const data = await res.json();
      setServiceOrders(data);
    } catch (err) {
      console.error("Failed to fetch service orders", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      setAuditLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  const handleAddUser = async (user: any) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (res.ok) {
        fetchUsers();
        fetchAuditLogs();
        alert('Usuário criado com sucesso!');
      } else {
        alert('Erro ao criar usuário.');
      }
    } catch (err) {
      console.error("Failed to add user", err);
    }
  };

  const handleUpdateUser = async (id: number, user: any) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (res.ok) {
        fetchUsers();
        fetchAuditLogs();
        alert('Usuário atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar usuário.');
      }
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUsers();
        fetchAuditLogs();
      } else {
        alert('Erro ao excluir usuário.');
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const fetchClientPayments = async () => {
    try {
      const res = await fetch('/api/client-payments');
      const data = await res.json();
      setClientPayments(data);
    } catch (err) {
      console.error("Failed to fetch client payments", err);
    }
  };

  const handleAddCustomer = async (force: boolean = false) => {
    if (isSaving) return;
    if (!newCustomer.firstName) {
      alert("Por favor, preencha o nome do cliente.");
      return;
    }

    if (!force && settings.showWarnings) {
      const missingCpf = !newCustomer.cpf;
      const missingPhone = !newCustomer.phone;

      if (missingCpf || missingPhone) {
        setCustomerWarningType(missingCpf && missingPhone ? 'both' : missingCpf ? 'cpf' : 'phone');
        setShowCustomerWarningModal(true);
        return;
      }
    }

    // Verificar similaridade
    const similarity = customers.find(c => 
      (newCustomer.nickname && c.nickname?.toLowerCase() === newCustomer.nickname.toLowerCase()) ||
      (newCustomer.companyName && c.companyName?.toLowerCase() === newCustomer.companyName.toLowerCase()) ||
      (c.firstName.toLowerCase() === newCustomer.firstName.toLowerCase() && c.lastName.toLowerCase() === newCustomer.lastName.toLowerCase())
    );

    if (similarity && !editingCustomer) {
      const confirmAdd = window.confirm(`Já existe um cliente similar: ${similarity.firstName} ${similarity.lastName}${similarity.nickname ? ` (${similarity.nickname})` : ''}. Deseja cadastrar assim mesmo?`);
      if (!confirmAdd) return;
    }

    setIsSaving(true);
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      
      if (editingCustomer) {
        const nameChanged = editingCustomer.firstName !== newCustomer.firstName || editingCustomer.lastName !== newCustomer.lastName;
        if (nameChanged) {
          const confirmNameChange = window.confirm("Você alterou o nome do cliente. Isso será refletido em todos os lançamentos vinculados. Deseja continuar?");
          if (!confirmNameChange) {
            setIsSaving(false);
            return;
          }
        }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCustomer,
          creditLimit: parseFloat(newCustomer.creditLimit) || 0,
          createdBy: !editingCustomer ? currentUser?.id : undefined,
          updatedBy: currentUser?.id
        })
      });
      const data = await res.json();
      
      setIsAddingCustomer(false);
      setShowCustomerWarningModal(false);
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
      fetchCustomers();
      fetchAuditLogs();

      if (method === 'POST') {
        // Use a small delay to ensure the modal is closed before showing the confirm
        setTimeout(() => {
          const launchPayment = window.confirm("Cliente cadastrado com sucesso! Deseja lançar um pagamento/parcelamento para este cliente agora?");
          if (launchPayment) {
            setNewClientPayment(prev => ({ ...prev, customerId: data.id }));
            setActiveScreen('client-payments');
            setIsAddingClientPayment(true);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Failed to add customer", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClientPayment = async () => {
    if (isSaving) return;
    if (!newClientPayment.customerId || !newClientPayment.totalAmount) return;
    
    setIsSaving(true);
    try {
      const total = parseFloat(newClientPayment.totalAmount);
      const paid = parseFloat(newClientPayment.paidAmount || '0');
      const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'pending';

      await fetch('/api/client-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newClientPayment,
          totalAmount: total,
          paidAmount: paid,
          status,
          createdBy: currentUser?.id
        })
      });
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
        type: 'income'
      });
      fetchClientPayments();
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to add client payment", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClientPayment = async (payment: ClientPayment) => {
    if (confirm('Deseja excluir este registro?')) {
      try {
        const res = await fetch(`/api/client-payments/${payment.id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchClientPayments();
          fetchAuditLogs();
        }
      } catch (err) {
        console.error("Failed to delete client payment", err);
      }
    }
  };

  const handleRecordPayment = async () => {
    if (!isRecordingPayment || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    const newPaidAmount = isRecordingPayment.paidAmount + amount;
    const newStatus = newPaidAmount >= isRecordingPayment.totalAmount ? 'paid' : 'partial';

    let currentHistory = [];
    try {
      if (isRecordingPayment.paymentHistory) {
        currentHistory = JSON.parse(isRecordingPayment.paymentHistory);
      }
    } catch (e) {}

    const newHistory = [...currentHistory, {
      amount: amount,
      date: new Date().toISOString()
    }];

    try {
      await fetch(`/api/client-payments/${isRecordingPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidAmount: newPaidAmount,
          status: newStatus,
          paymentHistory: newHistory,
          updatedBy: currentUser?.id
        })
      });
      setIsRecordingPayment(null);
      setPaymentAmount('');
      fetchClientPayments();
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to record payment", err);
    }
  };

  const sendWhatsAppReminder = (payment: ClientPayment) => {
    const customer = customers.find(c => c.id === payment.customerId);
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
      const res = await fetch(`/api/customers/${customer.id}/payments`);
      const payments = await res.json();
      
      setCustomerToDelete(customer);
      setCustomerPaymentsWarning(payments);
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  };

  const confirmDeleteCustomerWithPayments = async () => {
    if (!customerToDelete) return;
    try {
      await fetch(`/api/customers/${customerToDelete.id}`, { method: 'DELETE' });
      fetchCustomers();
      fetchClientPayments();
      setCustomerToDelete(null);
      setCustomerPaymentsWarning([]);
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  };

  const printCustomerStatement = (customer: Customer) => {
    const customerPayments = clientPayments.filter(p => p.customerId === customer.id);
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
    const customer = customers.find(c => c.id === payment.customerId);
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
    }

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const addCategory = async (name: string, type: 'income' | 'expense') => {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      });
      fetchCategories();
    } catch (err) {
      console.error("Failed to add category", err);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data) {
        setSettings(prev => ({
          ...prev,
          ...data,
          // Garantir que hiddenColumns seja sempre um array
          hiddenColumns: Array.isArray(data.hiddenColumns) ? data.hiddenColumns : []
        }));
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const updateSettings = async (newSettings: AppSettings) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      setSettings(newSettings);
    } catch (err) {
      console.error("Failed to update settings", err);
    }
  };

  const getAllMovements = () => {
    const movements: any[] = [...transactions.map(t => ({...t, source: 'transaction', clientName: '-'}))];
    
    clientPayments.forEach(cp => {
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
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      setTransactionToDelete(null);
      fetchTransactions();
    } catch (err) {
      console.error("Failed to delete", err);
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
      const url = editingTransaction ? `/api/transactions/${editingTransaction.id}` : '/api/transactions';
      const method = editingTransaction ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTx,
          amount: parseFloat(newTx.amount) || 0,
          category: newTx.category || 'Outros',
          description: newTx.description || 'Sem descrição',
          createdBy: !editingTransaction ? currentUser?.id : undefined,
          updatedBy: currentUser?.id
        })
      });
      
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
      fetchTransactions();
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const handleDuplicateTransaction = async (tx: Transaction) => {
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `${tx.description} (Cópia)`,
          category: tx.category,
          type: tx.type,
          amount: tx.amount,
          date: format(new Date(), 'yyyy-MM-dd'),
          createdBy: currentUser?.id
        })
      });
      fetchTransactions();
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to duplicate", err);
    }
  };

  const exportToCSV = () => {
    const headers = ["Descrição", "Categoria", "Tipo", "Valor", "Data", "Status"];
    const rows = transactions.map(t => [
      t.description,
      t.category,
      t.type,
      t.amount,
      t.date,
      t.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    } else {
      alert('Senha incorreta!');
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

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = settings.initialBalance + totalIncome - totalExpenses;

  // Rankings do Dashboard
  const dashboardTransactions = transactions.filter(t => format(parseISO(t.date), 'yyyy-MM') === dashboardMonth);
  
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
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.amount.toString().includes(searchTerm);
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
    const matchesMin = filterMinAmount === '' || tx.amount >= parseFloat(filterMinAmount);
    const matchesMax = filterMaxAmount === '' || tx.amount <= parseFloat(filterMaxAmount);
    
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

  const filteredClientPayments = clientPayments.filter(payment => {
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
    const monthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), month));
    
    return {
      name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      fullName: format(month, 'MMMM yyyy', { locale: ptBR }),
      renda: monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
      despesa: monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
      date: month
    };
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveScreen('dashboard');
  };

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'owner') return true;
    return currentUser.permissions?.includes(permission);
  };

  const handleAddInventoryItem = async (item: any) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, createdBy: currentUser?.id })
      });
      if (res.ok) {
        fetchInventoryItems();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Failed to add inventory item", err);
    }
  };

  const handleUpdateInventoryItem = async (id: number, item: any) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, updatedBy: currentUser?.id })
      });
      if (res.ok) {
        fetchInventoryItems();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Failed to update inventory item", err);
    }
  };

  const handleDeleteInventoryItem = async (id: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInventoryItems();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Failed to delete inventory item", err);
    }
  };

  const handleAddServiceOrder = async (order: any) => {
    try {
      const res = await fetch('/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, createdBy: currentUser?.id })
      });
      if (res.ok) {
        fetchServiceOrders();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Failed to add service order", err);
    }
  };

  const handleAddBrand = async (name: string) => {
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) fetchBrands();
    } catch (err) {
      console.error("Failed to add brand", err);
    }
  };

  const handleAddModel = async (brandId: number, name: string) => {
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, name })
      });
      if (res.ok) fetchModels();
    } catch (err) {
      console.error("Failed to add model", err);
    }
  };

  const handleUpdateServiceOrder = async (id: number, order: any) => {
    try {
      const res = await fetch(`/api/service-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, updatedBy: currentUser?.id })
      });
      if (res.ok) {
        fetchServiceOrders();
        fetchInventoryItems(); // Refresh inventory as stock might have changed
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Failed to update service order", err);
    }
  };

  const handleAddServiceOrderStatus = async (status: any) => {
    try {
      const res = await fetch('/api/service-order-statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status)
      });
      if (res.ok) {
        fetchServiceOrderStatuses();
      }
    } catch (err) {
      console.error("Failed to add service order status", err);
    }
  };

  const handleDeleteServiceOrderStatus = async (id: number) => {
    try {
      const res = await fetch(`/api/service-order-statuses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchServiceOrderStatuses();
      }
    } catch (err) {
      console.error("Failed to delete service order status", err);
    }
  };

  const handleDeleteServiceOrder = async (id: number) => {
    try {
      const res = await fetch(`/api/service-orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServiceOrders();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Failed to delete service order", err);
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
      <aside className={cn(
        "w-72 border-r border-white/5 flex flex-col bg-slate-900/50 backdrop-blur-xl fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-[0_0_20px_rgba(17,82,212,0.3)]">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">{settings.appName}</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-70">{settings.appVersion}</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {hasPermission('view_dashboard') && (
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Painel" 
              active={activeScreen === 'dashboard'} 
              onClick={() => { setActiveScreen('dashboard'); setIsSidebarOpen(false); }} 
            />
          )}
          
          {hasPermission('manage_transactions') && (
            <SidebarItem 
              icon={ReceiptText} 
              label="Transações Diárias" 
              active={activeScreen === 'transactions'} 
              onClick={() => { setActiveScreen('transactions'); setIsSidebarOpen(false); }} 
            />
          )}

          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Assistência Técnica</p>
          </div>

          <SidebarItem 
            icon={Briefcase} 
            label="Ordens de Serviço" 
            active={activeScreen === 'service-orders'} 
            onClick={() => { setActiveScreen('service-orders'); setIsSidebarOpen(false); }} 
          />

          <SidebarItem 
            icon={ShoppingBag} 
            label="Produtos & Serviços" 
            active={activeScreen === 'inventory'} 
            onClick={() => { setActiveScreen('inventory'); setIsSidebarOpen(false); }} 
          />

          {hasPermission('view_reports') && (
            <div className="pt-8 pb-4 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Análises</p>
            </div>
          )}

          {hasPermission('view_reports') && (
            <SidebarItem 
              icon={BarChart3} 
              label="Relatórios" 
              active={activeScreen === 'reports'} 
              onClick={() => { setActiveScreen('reports'); setIsSidebarOpen(false); }} 
            />
          )}
          
          {(hasPermission('manage_customers') || hasPermission('manage_payments')) && (
            <div className="pt-8 pb-4 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Gestão de Clientes</p>
            </div>
          )}

          {hasPermission('manage_customers') && (
            <SidebarItem 
              icon={Users} 
              label="Clientes" 
              active={activeScreen === 'customers'} 
              onClick={() => { setActiveScreen('customers'); setIsSidebarOpen(false); }} 
            />
          )}

          {hasPermission('manage_payments') && (
            <SidebarItem 
              icon={CreditCard} 
              label="Pagamentos Clientes" 
              active={activeScreen === 'client-payments'} 
              onClick={() => { setActiveScreen('client-payments'); setIsSidebarOpen(false); }} 
            />
          )}
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Conta</p>
          </div>
          
          {hasPermission('manage_settings') && (
            <SidebarItem 
              icon={Settings} 
              label="Configurações" 
              active={activeScreen === 'settings'} 
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
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm tracking-tight">Sair</span>
          </button>
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 relative group hover:bg-white/10 transition-all">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-700 overflow-hidden border-2 border-primary/20">
              <img 
                src={settings.profileAvatar} 
                alt="Perfil" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{currentUser?.name || settings.profileName}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {currentUser?.role === 'owner' ? 'Admin' : currentUser?.role === 'manager' ? 'Gerente' : 'Funcionário'}
              </p>
            </div>
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
              {activeScreen === 'dashboard' ? 'Visão Geral Anual' : 
               activeScreen === 'transactions' ? 'Transações Diárias' :
               activeScreen === 'reports' ? 'Relatórios Financeiros' : 
               activeScreen === 'customers' ? 'Gestão de Clientes' :
               activeScreen === 'client-payments' ? 'Pagamentos e Parcelamentos' :
               activeScreen === 'service-orders' ? 'Ordens de Serviço' :
               activeScreen === 'inventory' ? 'Produtos & Serviços' :
               'Configurações do Sistema'}
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Ano Fiscal {settings.fiscalYear}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
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
                        <h3 className="font-bold text-sm tracking-tight">Notificações</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                        {totalNotifications === 0 ? (
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
                        )}
                      </div>
                      {totalNotifications > 0 && (
                        <div className="p-3 border-t border-white/5 bg-white/5">
                          <button 
                            onClick={() => { setActiveScreen('client-payments'); setShowNotifications(false); }}
                            className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                          >
                            Ver Todos os Pagamentos
                          </button>
                        </div>
                      )}
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>
            <div className="flex gap-2">
               <button 
                onClick={exportToCSV}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-white/10 transition-all hover:border-white/20"
              >
                <Download size={16} />
                Exportar
              </button>
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_10px_20px_-5px_rgba(17,82,212,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(17,82,212,0.5)] hover:scale-[1.02] active:scale-95"
              >
                <Plus size={18} />
                Nova Entrada
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
          {activeScreen === 'dashboard' ? (
            <Dashboard 
              settings={settings}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              netBalance={netBalance}
              chartData={chartData}
              handleChartClick={handleChartClick}
              dashboardMonth={dashboardMonth}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              sortedIncomeRanking={sortedIncomeRanking}
              sortedExpenseRanking={sortedExpenseRanking}
            />
          ) : activeScreen === 'transactions' ? (
            <Transactions 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              dateFilterMode={dateFilterMode}
              setDateFilterMode={setDateFilterMode}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              filterType={filterType}
              setFilterType={setFilterType}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterMinAmount={filterMinAmount}
              setFilterMinAmount={setFilterMinAmount}
              filterMaxAmount={filterMaxAmount}
              setFilterMaxAmount={setFilterMaxAmount}
              categories={categories}
              settings={settings}
              updateSettings={updateSettings}
              filteredTransactions={filteredTransactions}
              setEditingTransaction={setEditingTransaction}
              setIsAdding={setIsAdding}
              setTransactionToDelete={setTransactionToDelete}
              handleDuplicateTransaction={handleDuplicateTransaction}
            />
          ) : activeScreen === 'reports' ? (
            <Reports 
              settings={settings}
              reportView={reportView}
              setReportView={setReportView}
              categories={categories}
              transactions={transactions}
              chartData={chartData}
              handleChartClick={handleChartClick}
              reportMonth={reportMonth}
              setReportMonth={setReportMonth}
            />
          ) : activeScreen === 'customers' ? (
            <Customers 
              customers={customers}
              clientPayments={clientPayments}
              setEditingCustomer={setEditingCustomer}
              setNewCustomer={setNewCustomer}
              setIsAddingCustomer={setIsAddingCustomer}
              onDelete={(id) => {
                const customer = customers.find(c => c.id === id);
                if (customer) handleDeleteCustomer(customer);
              }}
              onAddPayment={(customer) => {
                setNewClientPayment(prev => ({ ...prev, customerId: customer.id }));
                setActiveScreen('client-payments');
                setIsAddingClientPayment(true);
              }}
              onViewHistory={(customer) => {
                setHistoryCustomer(customer);
                setShowHistoryModal(true);
              }}
            />
          ) : activeScreen === 'client-payments' ? (
            <ClientPayments 
              filteredClientPayments={filteredClientPayments}
              setIsAddingClientPayment={setIsAddingClientPayment}
              isAddingClientPayment={isAddingClientPayment}
              paymentSearchTerm={paymentSearchTerm}
              setPaymentSearchTerm={setPaymentSearchTerm}
              paymentFilterStatus={paymentFilterStatus}
              setPaymentFilterStatus={setPaymentFilterStatus}
              paymentSortMode={paymentSortMode}
              setPaymentSortMode={setPaymentSortMode}
              togglePaymentExpansion={togglePaymentExpansion}
              expandedPayments={expandedPayments}
              isRecordingPayment={isRecordingPayment}
              setIsRecordingPayment={setIsRecordingPayment}
              generateReceipt={generateReceipt}
              sendWhatsAppReminder={sendWhatsAppReminder}
              handleDeleteClientPayment={handleDeleteClientPayment}
              handleRecordPayment={handleRecordPayment}
              paymentAmount={paymentAmount}
              setPaymentAmount={setPaymentAmount}
              customers={customers}
              newClientPayment={newClientPayment}
              setNewClientPayment={setNewClientPayment}
              handleAddClientPayment={handleAddClientPayment}
              isSaving={isSaving}
            />
          ) : activeScreen === 'service-orders' ? (
            <ServiceOrders 
              orders={serviceOrders}
              customers={customers}
              inventoryItems={inventoryItems}
              statuses={serviceOrderStatuses}
              brands={brands}
              models={models}
              clientPayments={clientPayments}
              onAddOrder={handleAddServiceOrder}
              onUpdateOrder={handleUpdateServiceOrder}
              onDeleteOrder={handleDeleteServiceOrder}
              onAddStatus={handleAddServiceOrderStatus}
              onDeleteStatus={handleDeleteServiceOrderStatus}
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
              directOsId={directOsId}
              directMode={directMode}
              onClearDirectOsId={() => setDirectOsId(null)}
              currentUser={currentUser}
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
              settings={settings}
              updateSettings={updateSettings}
              categories={categories}
              addCategory={addCategory}
              deleteCategory={deleteCategory}
              users={users}
              addUser={handleAddUser}
              updateUser={handleUpdateUser}
              deleteUser={handleDeleteUser}
              auditLogs={auditLogs}
              transactions={transactions}
              customers={customers}
              clientPayments={clientPayments}
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
        clientPayments={clientPayments}
        serviceOrders={serviceOrders}
      />
    </div>
  );
}
