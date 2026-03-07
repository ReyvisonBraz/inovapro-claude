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
  Tag,
  User,
  Users,
  CreditCard,
  MessageCircle,
  ImageIcon,
  Edit,
  Copy,
  CheckCircle2,
  LayoutGrid,
  List as ListIcon
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
import { cn, formatCurrency } from './lib/utils';
import { Transaction, Screen, AppSettings, Customer, ClientPayment, Category } from './types';

// --- Componentes Reutilizáveis ---

// Item da barra lateral (Sidebar)
const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
      active 
        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(17,82,212,0.1)]" 
        : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent hover:border-white/5"
    )}
  >
    {active && (
      <motion.div 
        layoutId="sidebar-active"
        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
      />
    )}
    <Icon size={20} className={cn("transition-all duration-300 group-hover:scale-110", active ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

// Cartão de estatística (Dashboard)
const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="glass-card p-8 flex flex-col gap-6 group cursor-default"
  >
    <div className="flex justify-between items-start">
      <div className={cn("p-4 rounded-2xl border border-white/5 transition-all duration-500 group-hover:border-white/10 group-hover:scale-110", color)}>
        <Icon size={24} />
      </div>
      <div className={cn(
        "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-sm",
        trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
      )}>
        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black tracking-tighter text-white">{formatCurrency(value)}</h3>
      <div className="flex items-center gap-2 mt-3">
        <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full", trend === 'up' ? "bg-emerald-500" : "bg-rose-500")} style={{ width: '60%' }}></div>
        </div>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">vs mês anterior</p>
      </div>
    </div>
  </motion.div>
);

// Modal de Senha para Configurações
const PasswordModal = ({ isOpen, onClose, onUnlock, passwordInput, setPasswordInput }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-modal w-full max-w-md p-8 relative z-10"
        >
          <div className="flex flex-col items-center text-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Settings size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Área Restrita</h3>
              <p className="text-sm text-slate-500 mt-2">Insira a senha de acesso para gerenciar as configurações do sistema.</p>
            </div>
            
            <div className="w-full space-y-4">
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full text-center text-2xl tracking-[0.5em]"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && onUnlock()}
              />
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={onUnlock}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
                >
                  Desbloquear
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// Modal de Aviso de Campos Faltando
const WarningModal = ({ isOpen, onClose, type, onConfirm, showWarnings, setShowWarnings }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-modal w-full max-w-md p-8 relative z-10"
        >
          <div className="flex flex-col items-center text-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Campos Incompletos</h3>
              <p className="text-sm text-slate-500 mt-2">
                {type === 'both' ? 'Você não selecionou uma categoria nem preencheu a descrição.' : 
                 type === 'category' ? 'Você não selecionou uma categoria para este lançamento.' : 
                 'Você não preencheu a descrição deste lançamento.'}
                <br />Deseja continuar assim mesmo?
              </p>
            </div>
            
            <div className="w-full space-y-6">
              <label className="flex items-center gap-3 cursor-pointer group justify-center">
                <input 
                  type="checkbox" 
                  checked={!showWarnings}
                  onChange={(e) => setShowWarnings(!e.target.checked)}
                  className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 text-primary focus:ring-primary outline-none transition-all"
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-widest">Não mostrar este aviso novamente</span>
              </label>

              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  Voltar e Corrigir
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Aplicativo Principal ---

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedPayments, setExpandedPayments] = useState<number[]>([]);
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>('all');
  const [paymentSearchTerm, setPaymentSearchTerm] = useState<string>('');

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

  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [categoryTab, setCategoryTab] = useState<'income' | 'expense'>('income');
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
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingClientPayment, setIsAddingClientPayment] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState<ClientPayment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerViewMode, setCustomerViewMode] = useState<'grid' | 'list'>('grid');
  const [customerSort, setCustomerSort] = useState<'name' | 'debt'>('name');
  const [customerFilterDebt, setCustomerFilterDebt] = useState<boolean>(false);
  const [showCustomerFilters, setShowCustomerFilters] = useState(false);
  
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

  const formatMonthYear = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(d, 'MMMM yyyy', { locale: ptBR });
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
    fetchTransactions();
    fetchSettings();
    fetchCustomers();
    fetchClientPayments();
    fetchCategories();
  }, []);

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
          creditLimit: parseFloat(newCustomer.creditLimit) || 0
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
    if (!newClientPayment.customerId || !newClientPayment.totalAmount) return;
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
          status
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
    } catch (err) {
      console.error("Failed to add client payment", err);
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
          paymentHistory: newHistory
        })
      });
      setIsRecordingPayment(null);
      setPaymentAmount('');
      fetchClientPayments();
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
          description: newTx.description || 'Sem descrição'
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
          date: format(new Date(), 'yyyy-MM-dd')
        })
      });
      fetchTransactions();
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
    .sort(([, a], [, b]) => (b as number) - (a as number));

  const sortedExpenseRanking = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number));

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

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.firstName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.lastName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.nickname?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.cpf?.includes(customerSearch);
    
    if (!matchesSearch) return false;

    if (customerFilterDebt) {
      const hasDebt = clientPayments.some(p => p.customerId === c.id && p.status !== 'paid');
      if (!hasDebt) return false;
    }

    return true;
  }).sort((a, b) => {
    if (customerSort === 'name') {
      return a.firstName.localeCompare(b.firstName);
    } else {
      const debtA = clientPayments.filter(p => p.customerId === a.id && p.status !== 'paid').reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
      const debtB = clientPayments.filter(p => p.customerId === b.id && p.status !== 'paid').reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);
      return debtB - debtA;
    }
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

  return (
    <div className="flex min-h-screen bg-bg-dark text-slate-100 selection:bg-primary/30">
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

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Painel" 
            active={activeScreen === 'dashboard'} 
            onClick={() => { setActiveScreen('dashboard'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={ReceiptText} 
            label="Transações Diárias" 
            active={activeScreen === 'transactions'} 
            onClick={() => { setActiveScreen('transactions'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={BarChart3} 
            label="Relatórios" 
            active={activeScreen === 'reports'} 
            onClick={() => { setActiveScreen('reports'); setIsSidebarOpen(false); }} 
          />
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Gestão de Clientes</p>
          </div>

          <SidebarItem 
            icon={Users} 
            label="Clientes" 
            active={activeScreen === 'customers'} 
            onClick={() => { setActiveScreen('customers'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={CreditCard} 
            label="Pagamentos Clientes" 
            active={activeScreen === 'client-payments'} 
            onClick={() => { setActiveScreen('client-payments'); setIsSidebarOpen(false); }} 
          />
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Conta</p>
          </div>
          
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
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden border-2 border-primary/20">
              <img 
                src={settings.profileAvatar} 
                alt="Perfil" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{settings.profileName}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Acesso Admin</p>
            </div>
            <MoreVertical size={16} className="text-slate-500 cursor-pointer hover:text-slate-300" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className={cn(
          "h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-bg-dark/80 backdrop-blur-md sticky top-0 transition-all",
          showNotifications ? "z-40" : "z-30"
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
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                  title="Saldo Inicial" 
                  value={settings.initialBalance} 
                  change="Configurado" 
                  trend="up" 
                  icon={Briefcase} 
                  color="bg-slate-500/10 text-slate-500"
                />
                <StatCard 
                  title="Renda Total" 
                  value={totalIncome} 
                  change="+12.4%" 
                  trend="up" 
                  icon={TrendingUp} 
                  color="bg-emerald-500/10 text-emerald-500"
                />
                <StatCard 
                  title="Despesas Totais" 
                  value={totalExpenses} 
                  change="-5.2%" 
                  trend="down" 
                  icon={TrendingDown} 
                  color="bg-rose-500/10 text-rose-500"
                />
                <StatCard 
                  title="Saldo Líquido" 
                  value={netBalance} 
                  change="+18.1%" 
                  trend="up" 
                  icon={Wallet} 
                  color="bg-primary/10 text-primary"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-bold">Tendência de Fluxo de Caixa</h4>
                      <p className="text-xs text-slate-500 font-medium">Desempenho de flutuação mensal</p>
                    </div>
                    <select className="bg-slate-800 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900">
                      <option>Últimos 12 Meses</option>
                      <option>Últimos 6 Meses</option>
                    </select>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} onClick={handleChartClick}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1152d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#1152d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #ffffff10', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="renda" 
                          stroke="#1152d4" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorIncome)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-bold">Comparação Mensal</h4>
                      <p className="text-xs text-slate-500 font-medium">Detalhamento de Renda vs Despesas</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="text-slate-400">Renda</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white/10"></span>
                        <span className="text-slate-400">Despesa</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} onClick={handleChartClick}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{ fill: '#ffffff05' }}
                          contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        />
                        <Bar dataKey="renda" fill="#1152d4" radius={[4, 4, 0, 0]} barSize={12} />
                        <Bar dataKey="despesa" fill="#ffffff10" radius={[4, 4, 0, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Rankings Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-bold">Ranking de Entradas</h4>
                      <p className="text-xs text-slate-500 font-medium">Categorias mais rentáveis</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
                      <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-bold uppercase tracking-widest min-w-[100px] text-center">
                        {formatMonthYear(dashboardMonth)}
                      </span>
                      <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {sortedIncomeRanking.map(([category, amount], index) => (
                      <div key={category} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-bold">{category}</span>
                            <span className="text-sm font-black text-emerald-500">{formatCurrency(amount as number)}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${((amount as number) / Math.max(...sortedIncomeRanking.map(([, a]) => a as number))) * 100}%` }}
                              className="h-full bg-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {sortedIncomeRanking.length === 0 && (
                      <p className="text-center text-slate-500 text-sm italic py-10">Nenhuma entrada registrada para este mês.</p>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-bold">Ranking de Saídas</h4>
                      <p className="text-xs text-slate-500 font-medium">Maiores despesas por categoria</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
                      <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-bold uppercase tracking-widest min-w-[100px] text-center">
                        {formatMonthYear(dashboardMonth)}
                      </span>
                      <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {sortedExpenseRanking.map(([category, amount], index) => (
                      <div key={category} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-bold">{category}</span>
                            <span className="text-sm font-black text-rose-500">{formatCurrency(amount as number)}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${((amount as number) / Math.max(...sortedExpenseRanking.map(([, a]) => a as number))) * 100}%` }}
                              className="h-full bg-rose-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {sortedExpenseRanking.length === 0 && (
                      <p className="text-center text-slate-500 text-sm italic py-10">Nenhuma saída registrada para este mês.</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </>
          ) : activeScreen === 'transactions' ? (
            /* Transactions Screen */
            <div className="space-y-8 p-6 lg:p-10">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                  <div className="relative w-full lg:max-w-md">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
                    <input 
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                      placeholder="Pesquisar transações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="flex p-1.5 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                      {[
                        { id: 'day', label: 'Dia' },
                        { id: 'month', label: 'Mês' },
                        { id: 'range', label: 'Período' },
                        { id: 'all', label: 'Tudo' }
                      ].map(mode => (
                        <button 
                          key={mode.id}
                          onClick={() => setDateFilterMode(mode.id as any)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                            dateFilterMode === mode.id 
                              ? "bg-primary text-white shadow-[0_10px_20px_-5px_rgba(17,82,212,0.4)] scale-105" 
                              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                          )}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    <div className="h-10 w-px bg-white/5 hidden lg:block" />

                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={cn(
                        "flex items-center gap-3 px-6 h-14 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                        showFilters 
                          ? "bg-primary/20 border-primary text-primary shadow-[0_0_30px_rgba(17,82,212,0.1)]" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <Filter size={18} className={cn("transition-transform duration-500", showFilters && "rotate-180")} />
                      Filtros
                    </button>
                  </div>
                </div>

                {/* Calendar Controls - Highlighted */}
                <AnimatePresence mode="wait">
                  {dateFilterMode !== 'all' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-center"
                    >
                      <div className="inline-flex items-center gap-4 p-2 bg-primary/5 border border-primary/10 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
                        {dateFilterMode === 'day' && (
                          <div className="flex items-center gap-4 px-6 py-3">
                            <div className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                              <Calendar size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Data Selecionada</span>
                              <input 
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0"
                              />
                            </div>
                            <button 
                              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                              className="ml-4 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest text-primary transition-all border border-primary/10"
                            >
                              Hoje
                            </button>
                          </div>
                        )}

                        {dateFilterMode === 'month' && (
                          <div className="flex items-center gap-4 px-6 py-3">
                            <div className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                              <Calendar size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Mês de Referência</span>
                              <input 
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0"
                              />
                            </div>
                            <button 
                              onClick={() => setSelectedMonth(format(new Date(), 'yyyy-MM'))}
                              className="ml-4 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest text-primary transition-all border border-primary/10"
                            >
                              Este Mês
                            </button>
                          </div>
                        )}

                        {dateFilterMode === 'range' && (
                          <div className="flex items-center gap-8 px-6 py-3">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                                <Calendar size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Início</span>
                                <input 
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                  className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0 w-40"
                                />
                              </div>
                            </div>
                            
                            <div className="h-8 w-px bg-primary/20" />

                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Fim</span>
                              <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-lg font-black text-slate-100 cursor-pointer [color-scheme:dark] focus:ring-0 w-40"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo</label>
                        <select 
                          value={filterType}
                          onChange={(e: any) => setFilterType(e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900"
                        >
                          <option value="all">Todos</option>
                          <option value="income">Entradas</option>
                          <option value="expense">Saídas</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</label>
                        <select 
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900"
                        >
                          <option value="all">Todas</option>
                          <optgroup label="Entradas">
                            {categories.filter(c => c.type === 'income').map(cat => (
                              <option key={`inc-${cat.id}`} value={cat.name}>{cat.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Saídas">
                            {categories.filter(c => c.type === 'expense').map(cat => (
                              <option key={`exp-${cat.id}`} value={cat.name}>{cat.name}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Mínimo</label>
                        <input 
                          type="number"
                          value={filterMinAmount}
                          onChange={(e) => setFilterMinAmount(e.target.value)}
                          placeholder="R$ 0,00"
                          className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Máximo</label>
                        <input 
                          type="number"
                          value={filterMaxAmount}
                          onChange={(e) => setFilterMaxAmount(e.target.value)}
                          placeholder="R$ 10.000,00"
                          className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {/* Quick Date Ranges */}
                      {dateFilterMode === 'range' && (
                        <div className="col-span-full pt-4 border-t border-white/5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Atalhos de Período</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: 'Últimos 7 dias', days: 7 },
                              { label: 'Últimos 30 dias', days: 30 },
                              { label: 'Este Mês', currentMonth: true },
                              { label: 'Este Ano', currentYear: true },
                            ].map(range => (
                              <button
                                key={range.label}
                                onClick={() => {
                                  const end = new Date();
                                  let start = new Date();
                                  if (range.days) {
                                    start.setDate(end.getDate() - range.days);
                                  } else if (range.currentMonth) {
                                    start = startOfMonth(end);
                                  } else if (range.currentYear) {
                                    start = new Date(end.getFullYear(), 0, 1);
                                  }
                                  setStartDate(format(start, 'yyyy-MM-dd'));
                                  setEndDate(format(end, 'yyyy-MM-dd'));
                                }}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
                              >
                                {range.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Column Visibility Toggles in Filters */}
                      <div className="col-span-full pt-4 border-t border-white/5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Exibir Colunas</label>
                        <div className="flex flex-wrap gap-2">
                          {['Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'].map(col => (
                            <button
                              key={col}
                              onClick={() => {
                                const newHidden = settings.hiddenColumns.includes(col)
                                  ? settings.hiddenColumns.filter(c => c !== col)
                                  : [...settings.hiddenColumns, col];
                                updateSettings({ ...settings, hiddenColumns: newHidden });
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                                !settings.hiddenColumns.includes(col) 
                                  ? "bg-primary/10 border-primary/20 text-primary" 
                                  : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                              )}
                            >
                              {col}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-full pt-6 border-t border-white/5 flex justify-end">
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterCategory('all');
                            setFilterMinAmount('');
                            setFilterMaxAmount('');
                            setDateFilterMode('all');
                          }}
                          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-all border border-white/10 flex items-center gap-2"
                        >
                          <X size={14} />
                          Limpar Todos os Filtros
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        {!settings.hiddenColumns.includes('Descrição') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>}
                        {!settings.hiddenColumns.includes('Categoria') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</th>}
                        {!settings.hiddenColumns.includes('Tipo') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo</th>}
                        {!settings.hiddenColumns.includes('Valor') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor</th>}
                        {!settings.hiddenColumns.includes('Status') && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>}
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-all duration-300 group border-b border-white/[0.02] last:border-0">
                          {!settings.hiddenColumns.includes('Descrição') && (
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-500">
                                  {tx.category === 'Alimentação' && <Coffee size={16} />}
                                  {tx.category === 'Trabalho' && <Briefcase size={16} />}
                                  {tx.category === 'Utilidades' && <Zap size={16} />}
                                  {tx.category === 'Viagem' && <Car size={16} />}
                                  {tx.category === 'Lazer' && <ShoppingBag size={16} />}
                                  {!['Alimentação', 'Trabalho', 'Utilidades', 'Viagem', 'Lazer'].includes(tx.category) && <ShoppingBag size={16} />}
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{tx.description}</p>
                                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                                    {format(new Date(tx.date), 'hh:mm a')} • {tx.category}
                                  </p>
                                </div>
                              </div>
                            </td>
                          )}
                          {!settings.hiddenColumns.includes('Categoria') && (
                            <td className="px-8 py-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-slate-400">
                                {tx.category}
                              </span>
                            </td>
                          )}
                          {!settings.hiddenColumns.includes('Tipo') && (
                            <td className="px-8 py-5">
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                              )}>
                                {tx.type === 'income' ? 'entrada' : 'saída'}
                              </span>
                            </td>
                          )}
                          {!settings.hiddenColumns.includes('Valor') && (
                            <td className="px-8 py-5 font-black tracking-tight text-sm">
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </td>
                          )}
                          {!settings.hiddenColumns.includes('Status') && (
                            <td className="px-8 py-5">
                              <div className={cn(
                                "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest",
                                tx.status === 'Concluído' || tx.status === 'Completed' ? "text-emerald-500" : tx.status === 'Pendente' || tx.status === 'Pending' ? "text-amber-500" : "text-rose-500"
                              )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", tx.status === 'Concluído' || tx.status === 'Completed' ? "bg-emerald-500" : tx.status === 'Pendente' || tx.status === 'Pending' ? "bg-amber-500" : "bg-rose-500")}></div>
                                {tx.status === 'Completed' ? 'Concluído' : tx.status === 'Pending' ? 'Pendente' : tx.status === 'Failed' ? 'Falhou' : tx.status}
                              </div>
                            </td>
                          )}
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingTransaction(tx);
                                  setNewTx({
                                    description: tx.description,
                                    category: tx.category,
                                    type: tx.type,
                                    amount: tx.amount.toString(),
                                    date: tx.date
                                  });
                                  setIsAdding(true);
                                }}
                                className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDuplicateTransaction(tx)}
                                className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                title="Duplicar"
                              >
                                <Copy size={16} />
                              </button>
                              <button 
                                onClick={() => setTransactionToDelete(tx.id)}
                                className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  Mostrando <span className="text-slate-200 font-bold">{transactions.length}</span> transações
                </p>
                <div className="flex gap-2">
                  <button className="px-5 py-2.5 rounded-xl border border-white/5 bg-white/5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all disabled:opacity-30" disabled>
                    Anterior
                  </button>
                  <button className="px-5 py-2.5 rounded-xl border border-white/5 bg-white/5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all">
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          ) : activeScreen === 'reports' ? (
            /* Reports Screen */
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold">Análise Detalhada</h3>
                  <p className="text-sm text-slate-500">Relatórios gerados com base no ano fiscal {settings.fiscalYear}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                    <button 
                      onClick={() => setReportView('charts')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        reportView === 'charts' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      Gráficos
                    </button>
                    <button 
                      onClick={() => setReportView('table')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        reportView === 'table' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      Tabela
                    </button>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    <Printer size={18} />
                    Imprimir
                  </button>
                </div>
              </div>

              {reportView === 'charts' ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-8"
                    >
                      <h4 className="text-lg font-bold mb-6">Gastos por Categoria</h4>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categories.filter(c => c.type === 'expense').map(cat => ({
                                name: cat.name,
                                value: transactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
                              })).filter(d => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={110}
                              paddingAngle={8}
                              dataKey="value"
                            >
                              {categories.filter(c => c.type === 'expense').map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#1152d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
                              itemStyle={{ color: '#f1f5f9' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-8"
                    >
                      <h4 className="text-lg font-bold mb-6">Comparativo de Fluxo</h4>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                            <Bar dataKey="renda" fill="#1152d4" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  </div>

                  {/* Transactions for the selected month in Reports */}
                  {reportMonth && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-8 space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold">Transações de {format(parseISO(`${reportMonth}-01`), 'MMMM yyyy', { locale: ptBR })}</h4>
                          <p className="text-xs text-slate-500 font-medium">Lista detalhada de entradas e saídas do período</p>
                        </div>
                        <button 
                          onClick={() => setReportMonth(null)}
                          className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300"
                        >
                          Limpar Filtro
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Data</th>
                              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</th>
                              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {transactions
                              .filter(tx => format(parseISO(tx.date), 'yyyy-MM') === reportMonth)
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 text-xs font-medium text-slate-400">
                                    {format(parseISO(tx.date), 'dd/MM')}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold">
                                    {tx.description}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-slate-500">
                                      {tx.category}
                                    </span>
                                  </td>
                                  <td className={cn(
                                    "px-4 py-3 text-right font-black text-sm",
                                    tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                                  )}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                  </td>
                                </tr>
                              ))}
                            {transactions.filter(tx => format(parseISO(tx.date), 'yyyy-MM') === reportMonth).length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-slate-500 text-sm italic">
                                  Nenhuma transação encontrada para este mês.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="glass-card p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-lg font-bold">Resumo Mensal por Dia</h4>
                    <select 
                      className="bg-slate-800 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
                      value={reportMonth || ''}
                      onChange={(e) => setReportMonth(e.target.value)}
                    >
                      <option value="">Todos os Meses</option>
                      {last6Months.map(m => (
                        <option key={m.toISOString()} value={format(m, 'MMMM yyyy', { locale: ptBR })}>
                          {format(m, 'MMMM yyyy', { locale: ptBR })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Data</th>
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Cliente</th>
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</th>
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo</th>
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {allMovements
                          .filter(t => !reportMonth || format(parseISO(t.date), 'MMMM yyyy', { locale: ptBR }) === reportMonth)
                          .map(t => (
                            <tr 
                              key={t.id} 
                              className="hover:bg-white/[0.05] transition-colors cursor-pointer group"
                              onClick={() => t.source === 'transaction' && handleTransactionClick(t)}
                            >
                              <td className="py-4 text-xs font-medium text-slate-400 group-hover:text-primary transition-colors">{format(parseISO(t.date), 'dd/MM/yyyy')}</td>
                              <td className="py-4 text-xs font-bold text-slate-300">{t.clientName || '-'}</td>
                              <td className="py-4 text-sm font-bold">{t.description}</td>
                              <td className="py-4">
                                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  {t.category}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest",
                                  t.type === 'income' ? "text-emerald-500" : "text-rose-500"
                                )}>
                                  {t.type === 'income' ? 'entrada' : 'saída'}
                                </span>
                              </td>
                              <td className={cn(
                                "py-4 text-sm font-black text-right",
                                t.type === 'income' ? "text-emerald-500" : "text-rose-500"
                              )}>
                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="glass-card p-6 border-l-4 border-emerald-500">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total de Entradas</p>
                  <h5 className="text-2xl font-bold text-emerald-500">{formatCurrency(totalIncome)}</h5>
                </div>
                <div className="glass-card p-6 border-l-4 border-rose-500">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total de Saídas</p>
                  <h5 className="text-2xl font-bold text-rose-500">{formatCurrency(totalExpenses)}</h5>
                </div>
                <div className="glass-card p-6 border-l-4 border-primary">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Saldo Acumulado</p>
                  <h5 className="text-2xl font-bold text-primary">{formatCurrency(netBalance)}</h5>
                </div>
              </div>
            </div>
          ) : activeScreen === 'customers' ? (
            /* Customers Screen */
            <div className="p-6 lg:p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Gestão de Clientes</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Cadastre e gerencie seus clientes para cobranças rápidas</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-64">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Pesquisar clientes..."
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setCustomerFilterDebt(!customerFilterDebt)}
                      className={cn(
                        "flex-1 sm:flex-none h-12 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                        customerFilterDebt ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                      title="Filtrar clientes com dívidas"
                    >
                      <AlertTriangle size={14} />
                      Com Dívida
                    </button>
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                      <button 
                        onClick={() => setCustomerSort('name')}
                        className={cn(
                          "p-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest",
                          customerSort === 'name' ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                        )}
                        title="Ordenar por Nome"
                      >
                        A-Z
                      </button>
                      <button 
                        onClick={() => setCustomerSort('debt')}
                        className={cn(
                          "p-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest",
                          customerSort === 'debt' ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                        )}
                        title="Ordenar por Dívida"
                      >
                        $$$
                      </button>
                    </div>
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                      <button 
                        onClick={() => setCustomerViewMode('grid')}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          customerViewMode === 'grid' ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                        )}
                      >
                        <LayoutGrid size={18} />
                      </button>
                      <button 
                        onClick={() => setCustomerViewMode('list')}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          customerViewMode === 'list' ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                        )}
                      >
                        <ListIcon size={18} />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
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
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 h-12"
                  >
                    <Plus size={20} />
                    Novo Cliente
                  </button>
                </div>
              </div>

              <div className={cn(
                "gap-6",
                customerViewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
              )}>
                {filteredCustomers.map(customer => (
                  <motion.div 
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 space-y-4 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">ID: {customer.id}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl shadow-inner">
                        {customer.firstName[0]}{customer.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate text-lg">
                          {customer.firstName} {customer.lastName}
                          {customer.nickname && <span className="text-primary ml-2 text-sm">({customer.nickname})</span>}
                        </h4>
                        {customer.companyName && <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{customer.companyName}</p>}
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-slate-500">{customer.phone}</p>
                          {customer.creditLimit && customer.creditLimit > 0 && (
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              Limite: {formatCurrency(customer.creditLimit)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {customer.cpf && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg">
                          <Tag size={10} />
                          CPF: {customer.cpf}
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          setNewClientPayment(prev => ({ ...prev, customerId: customer.id }));
                          setActiveScreen('client-payments');
                          setIsAddingClientPayment(true);
                        }}
                        className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Plus size={10} />
                        Novo Lançamento
                      </button>
                    </div>

                    {customer.observation && (
                      <p className="text-xs text-slate-500 italic line-clamp-2 bg-black/20 p-3 rounded-xl border border-white/5">
                        "{customer.observation}"
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => printCustomerStatement(customer)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-500/20 hover:bg-slate-500/20 transition-all"
                      >
                        <Printer size={14} />
                        Extrato
                      </button>
                      <button 
                        onClick={() => {
                          const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </button>
                      <button 
                        onClick={() => {
                          setEditingCustomer(customer);
                          setNewCustomer({
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                            nickname: customer.nickname || '',
                            cpf: customer.cpf || '',
                            companyName: customer.companyName || '',
                            phone: customer.phone,
                            observation: customer.observation || '',
                            creditLimit: customer.creditLimit?.toString() || ''
                          });
                          setIsAddingCustomer(true);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          setNewCustomer({
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                            nickname: customer.nickname ? `${customer.nickname} (Cópia)` : '',
                            cpf: customer.cpf || '',
                            companyName: customer.companyName || '',
                            phone: customer.phone,
                            observation: customer.observation || '',
                            creditLimit: customer.creditLimit?.toString() || ''
                          });
                          setIsAddingCustomer(true);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                        title="Clonar"
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer)}
                        className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10">
                    <Users size={40} className="mx-auto text-slate-600 mb-4 opacity-20" />
                    <p className="text-slate-500 italic">Nenhum cliente encontrado.</p>
                  </div>
                )}
              </div>

              {/* Add/Edit Customer Modal */}
              <AnimatePresence>
                {isAddingCustomer && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setIsAddingCustomer(false);
                        setEditingCustomer(null);
                      }}
                      className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-2xl glass-modal p-8 overflow-y-auto max-h-[90vh]"
                    >
                      <h3 className="text-xl font-bold mb-6">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">
                              <span>Nome *</span>
                              <span className="text-[8px] text-primary/60 italic">Obrigatório</span>
                            </label>
                            <input 
                              value={newCustomer.firstName}
                              onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                              className="w-full h-12 bg-white/5 border-2 border-primary/30 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                              placeholder="João"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sobrenome</label>
                            <input 
                              value={newCustomer.lastName}
                              onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                              placeholder="Silva"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Apelido</label>
                            <input 
                              value={newCustomer.nickname}
                              onChange={(e) => setNewCustomer({...newCustomer, nickname: e.target.value})}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                              placeholder="Jão"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">CPF</label>
                            <input 
                              value={newCustomer.cpf}
                              onChange={(e) => setNewCustomer({...newCustomer, cpf: e.target.value})}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                              placeholder="000.000.000-00"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome da Empresa</label>
                            <input 
                              value={newCustomer.companyName}
                              onChange={(e) => setNewCustomer({...newCustomer, companyName: e.target.value})}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                              placeholder="Empresa LTDA"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">
                              <span>Telefone (WhatsApp) *</span>
                              <span className="text-[8px] text-primary/60 italic">Obrigatório</span>
                            </label>
                            <input 
                              value={newCustomer.phone}
                              onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                              className="w-full h-12 bg-white/5 border-2 border-primary/30 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                              placeholder="5511999999999"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Limite de Crédito</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                              <input 
                                type="number"
                                value={newCustomer.creditLimit}
                                onChange={(e) => setNewCustomer({...newCustomer, creditLimit: e.target.value})}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Observações</label>
                          <textarea 
                            value={newCustomer.observation}
                            onChange={(e) => setNewCustomer({...newCustomer, observation: e.target.value})}
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none resize-none"
                            placeholder="Notas sobre o cliente..."
                          />
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => {
                              setIsAddingCustomer(false);
                              setEditingCustomer(null);
                            }}
                            className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={() => handleAddCustomer(false)}
                            className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                          >
                            {editingCustomer ? 'Atualizar Cliente' : 'Salvar Cliente'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              {/* Customer Warning Modal */}
              <AnimatePresence>
                {showCustomerWarningModal && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
                      onClick={() => setShowCustomerWarningModal(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-md glass-modal p-8 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Informações Incompletas</h3>
                      <p className="text-slate-400 text-sm mb-8">
                        {customerWarningType === 'both' && "Você não preencheu o CPF e o Telefone do cliente."}
                        {customerWarningType === 'cpf' && "Você não preencheu o CPF do cliente."}
                        {customerWarningType === 'phone' && "Você não preencheu o Telefone do cliente."}
                        <br/><br/>
                        Deseja salvar assim mesmo?
                      </p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setShowCustomerWarningModal(false)}
                          className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                        >
                          Voltar e Preencher
                        </button>
                        <button 
                          onClick={() => handleAddCustomer(true)}
                          className="flex-1 py-4 rounded-2xl font-bold bg-amber-500 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                        >
                          Salvar Assim Mesmo
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Customer Delete Warning Modal */}
              <AnimatePresence>
                {customerToDelete && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
                      onClick={() => setCustomerToDelete(null)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-md glass-modal p-8 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Atenção!</h3>
                      
                      {customerPaymentsWarning.length > 0 ? (
                        <>
                          <p className="text-slate-400 text-sm mb-6">
                            O cliente <strong className="text-slate-200">{customerToDelete.firstName} {customerToDelete.lastName}</strong> possui <strong>{customerPaymentsWarning.length}</strong> lançamento(s) vinculado(s).
                          </p>
                          <div className="bg-white/5 rounded-xl p-4 mb-8 max-h-40 overflow-y-auto text-left space-y-2">
                            {customerPaymentsWarning.map((p, i) => (
                              <div key={i} className="text-xs text-slate-300 flex justify-between">
                                <span className="truncate pr-4">{p.description}</span>
                                <span className="font-bold text-slate-400">{formatCurrency(p.totalAmount - p.paidAmount)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-3">
                            <button 
                              onClick={() => {
                                setCustomerToDelete(null);
                                setActiveScreen('client-payments');
                              }}
                              className="w-full py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                            >
                              Ir para Pagamentos
                            </button>
                            <button 
                              onClick={confirmDeleteCustomerWithPayments}
                              className="w-full py-4 rounded-2xl font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                            >
                              Excluir Cliente e Pagamentos
                            </button>
                            <button 
                              onClick={() => setCustomerToDelete(null)}
                              className="w-full py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-400 text-sm mb-8">
                            Tem certeza que deseja excluir o cliente <strong className="text-slate-200">{customerToDelete.firstName} {customerToDelete.lastName}</strong>? Esta ação não pode ser desfeita.
                          </p>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => setCustomerToDelete(null)}
                              className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                            >
                              Cancelar
                            </button>
                            <button 
                              onClick={confirmDeleteCustomerWithPayments}
                              className="flex-1 py-4 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02]"
                            >
                              Excluir Cliente
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ) : activeScreen === 'client-payments' ? (
            /* Client Payments Screen */
            <div className="p-6 lg:p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Pagamentos e Parcelamentos</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Registre vendas, parcelamentos e envie lembretes de cobrança</p>
                </div>
                <button 
                  onClick={() => setIsAddingClientPayment(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Plus size={20} />
                  Novo Registro
                </button>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                      type="text"
                      placeholder="Buscar por cliente ou descrição..."
                      value={paymentSearchTerm}
                      onChange={(e) => setPaymentSearchTerm(e.target.value)}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <select
                    value={paymentFilterStatus}
                    onChange={(e) => setPaymentFilterStatus(e.target.value)}
                    className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="paid">Pagos</option>
                    <option value="partial">Parciais</option>
                    <option value="pending">Pendentes</option>
                    <option value="overdue">Vencidos</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Cliente</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Vencimento</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Total</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredClientPayments.map(payment => (
                        <React.Fragment key={payment.id}>
                          <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => togglePaymentExpansion(payment.id)}
                                  className="p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors"
                                >
                                  {expandedPayments.includes(payment.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                <p className="text-sm font-bold">{payment.customerName}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-slate-300">{payment.description}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{payment.paymentMethod} • {payment.installmentsCount}x</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className={cn(
                                "text-sm font-bold",
                                new Date(payment.dueDate) < new Date() && payment.status !== 'paid' ? "text-rose-500" : "text-slate-300"
                              )}>
                                {format(parseISO(payment.dueDate), 'dd/MM/yyyy')}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-black">{formatCurrency(payment.totalAmount)}</p>
                              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Pago: {formatCurrency(payment.paidAmount)}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                                payment.status === 'paid' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                payment.status === 'partial' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                "bg-rose-500/10 border-rose-500/20 text-rose-500"
                              )}>
                                {payment.status === 'paid' ? 'Pago' : payment.status === 'partial' ? 'Parcial' : 'Pendente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {payment.status !== 'paid' && (
                                  <button 
                                    onClick={() => setIsRecordingPayment(payment)}
                                    className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                                    title="Registrar Pagamento"
                                  >
                                    <CheckCircle2 size={14} />
                                  </button>
                                )}
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => generateReceipt(payment, 'simple')}
                                    className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                                    title="Recibo Térmico (80mm)"
                                  >
                                    <Zap size={14} />
                                  </button>
                                  <button 
                                    onClick={() => generateReceipt(payment, 'a4')}
                                    className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                                    title="Recibo A4 Completo"
                                  >
                                    <Printer size={14} />
                                  </button>
                                </div>
                                <button 
                                  onClick={() => sendWhatsAppReminder(payment)}
                                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle size={14} />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (confirm('Deseja excluir este registro?')) {
                                      await fetch(`/api/client-payments/${payment.id}`, { method: 'DELETE' });
                                      fetchClientPayments();
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          <AnimatePresence>
                            {expandedPayments.includes(payment.id) && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white/[0.01] border-b border-white/5"
                              >
                                <td colSpan={6} className="px-6 py-4">
                                  <div className="pl-10">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Histórico de Pagamentos</h4>
                                    {payment.paymentHistory && JSON.parse(payment.paymentHistory).length > 0 ? (
                                      <div className="space-y-2">
                                        {JSON.parse(payment.paymentHistory).map((h: any, i: number) => (
                                          <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 max-w-md">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                <CheckCircle2 size={14} />
                                              </div>
                                              <div>
                                                <p className="text-sm font-bold">{formatCurrency(h.amount)}</p>
                                                <p className="text-[10px] text-slate-500">{format(parseISO(h.date), 'dd/MM/yyyy HH:mm')}</p>
                                              </div>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                              Parcela {i + 1}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-slate-500 italic">Nenhum pagamento registrado ainda.</p>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                      {filteredClientPayments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic">
                            Nenhum pagamento encontrado com os filtros atuais.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Client Payment Modal */}
              <AnimatePresence>
                {isAddingClientPayment && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsAddingClientPayment(false)}
                      className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-2xl glass-modal p-8 max-h-[90vh] overflow-y-auto"
                    >
                      <h3 className="text-xl font-bold mb-6">Novo Registro de Venda/Pagamento</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cliente</label>
                          <select 
                            value={newClientPayment.customerId}
                            onChange={(e) => setNewClientPayment({...newClientPayment, customerId: parseInt(e.target.value)})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
                          >
                            <option value={0}>Selecionar Cliente</option>
                            {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição da Compra</label>
                          <input 
                            value={newClientPayment.description}
                            onChange={(e) => setNewClientPayment({...newClientPayment, description: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Ex: Venda de Notebook"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Total</label>
                          <input 
                            type="number"
                            value={newClientPayment.totalAmount}
                            onChange={(e) => setNewClientPayment({...newClientPayment, totalAmount: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Já Pago (Entrada)</label>
                          <input 
                            type="number"
                            value={newClientPayment.paidAmount}
                            onChange={(e) => setNewClientPayment({...newClientPayment, paidAmount: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data da Compra</label>
                          <input 
                            type="date"
                            value={newClientPayment.purchaseDate}
                            onChange={(e) => setNewClientPayment({...newClientPayment, purchaseDate: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none [color-scheme:dark]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data de Vencimento</label>
                          <input 
                            type="date"
                            value={newClientPayment.dueDate}
                            onChange={(e) => setNewClientPayment({...newClientPayment, dueDate: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none [color-scheme:dark]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Forma de Pagamento</label>
                          <select 
                            value={newClientPayment.paymentMethod}
                            onChange={(e) => setNewClientPayment({...newClientPayment, paymentMethod: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
                          >
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="PIX">PIX</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                            <option value="Cartão de Débito">Cartão de Débito</option>
                            <option value="Boleto">Boleto</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nº de Parcelas</label>
                          <input 
                            type="number"
                            value={newClientPayment.installmentsCount}
                            onChange={(e) => setNewClientPayment({...newClientPayment, installmentsCount: parseInt(e.target.value)})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                            min="1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-8">
                        <button 
                          onClick={() => setIsAddingClientPayment(false)}
                          className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleAddClientPayment}
                          className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                        >
                          Registrar Venda
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Record Payment Modal */}
              <AnimatePresence>
                {isRecordingPayment && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsRecordingPayment(null)}
                      className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-md glass-modal p-8"
                    >
                      <h3 className="text-xl font-bold mb-2">Registrar Pagamento</h3>
                      <p className="text-sm text-slate-500 mb-6">
                        Cliente: <span className="text-slate-200 font-bold">{isRecordingPayment.customerName}</span><br/>
                        Saldo Devedor: <span className="text-primary font-bold">{formatCurrency(isRecordingPayment.totalAmount - isRecordingPayment.paidAmount)}</span>
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor do Pagamento</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                            <input 
                              type="number"
                              autoFocus
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => setIsRecordingPayment(null)}
                            className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={handleRecordPayment}
                            className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Settings Screen */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl space-y-8"
            >
              <div className="glass-card p-8 space-y-10">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Configurações do Sistema</h4>
                    <p className="text-xs text-slate-500 font-medium">Personalize a identidade e o comportamento do seu dashboard</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome do Sistema</label>
                      <div className="relative">
                        <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          value={settings.appName}
                          onChange={(e) => updateSettings({...settings, appName: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Saldo Inicial da Conta</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                        <input 
                          type="number"
                          value={settings.initialBalance}
                          onChange={(e) => updateSettings({...settings, initialBalance: parseFloat(e.target.value) || 0})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ano Fiscal</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          value={settings.fiscalYear}
                          onChange={(e) => updateSettings({...settings, fiscalYear: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Senha de Acesso (Configurações)</label>
                      <div className="relative">
                        <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text"
                          value={settings.settingsPassword}
                          onChange={(e) => updateSettings({...settings, settingsPassword: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Preferências de Exibição</label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={settings.showWarnings}
                            onChange={(e) => updateSettings({ ...settings, showWarnings: e.target.checked })}
                            className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 text-primary focus:ring-primary outline-none transition-all"
                          />
                          <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-widest">Exibir avisos de campos incompletos</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Colunas Ocultas (Transações)</label>
                      <div className="flex flex-wrap gap-2">
                        {['Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'].map(col => (
                          <button
                            key={col}
                            onClick={() => {
                              const newHidden = settings.hiddenColumns.includes(col)
                                ? settings.hiddenColumns.filter(c => c !== col)
                                : [...settings.hiddenColumns, col];
                              updateSettings({ ...settings, hiddenColumns: newHidden });
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                              settings.hiddenColumns.includes(col) 
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                                : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                            )}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome do Perfil</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          value={settings.profileName}
                          onChange={(e) => updateSettings({...settings, profileName: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">URL do Avatar</label>
                      <div className="relative">
                        <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          value={settings.profileAvatar}
                          onChange={(e) => updateSettings({...settings, profileAvatar: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cor Primária</label>
                      <div className="flex gap-4">
                        <input 
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSettings({...settings, primaryColor: e.target.value})}
                          className="h-12 w-20 bg-white/5 border border-white/10 rounded-xl p-1 cursor-pointer"
                        />
                        <div className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 text-xs font-mono text-slate-400">
                          {settings.primaryColor}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Configurações de Impressão</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Layout do Recibo</label>
                          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                            <button 
                              onClick={() => updateSettings({...settings, receiptLayout: 'simple'})}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                settings.receiptLayout === 'simple' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                              )}
                            >
                              Simples (Térmico)
                            </button>
                            <button 
                              onClick={() => updateSettings({...settings, receiptLayout: 'a4'})}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                settings.receiptLayout === 'a4' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                              )}
                            >
                              Completo (A4)
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">URL da Logo (Recibo)</label>
                          <div className="relative">
                            <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                              value={settings.receiptLogo || ''}
                              onChange={(e) => updateSettings({...settings, receiptLogo: e.target.value})}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                              placeholder="https://exemplo.com/logo.png"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CNPJ / CPF</label>
                          <input 
                            value={settings.receiptCnpj || ''}
                            onChange={(e) => updateSettings({...settings, receiptCnpj: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="00.000.000/0000-00"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Endereço Completo</label>
                          <input 
                            value={settings.receiptAddress || ''}
                            onChange={(e) => updateSettings({...settings, receiptAddress: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="Rua Exemplo, 123 - Cidade/UF"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chave PIX</label>
                          <input 
                            value={settings.receiptPixKey || ''}
                            onChange={(e) => updateSettings({...settings, receiptPixKey: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="Chave PIX (CPF, Email, etc)"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">URL QR Code (Opcional)</label>
                          <input 
                            value={settings.receiptQrCode || ''}
                            onChange={(e) => updateSettings({...settings, receiptQrCode: e.target.value})}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="URL da imagem do QR Code"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 col-span-full">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categorias de Lançamentos</label>
                      
                      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-4">
                        <button 
                          onClick={() => setCategoryTab('income')}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                            categoryTab === 'income' ? "bg-emerald-500/20 text-emerald-500" : "text-slate-400 hover:text-slate-200"
                          )}
                        >
                          Entradas
                        </button>
                        <button 
                          onClick={() => setCategoryTab('expense')}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                            categoryTab === 'expense' ? "bg-rose-500/20 text-rose-500" : "text-slate-400 hover:text-slate-200"
                          )}
                        >
                          Saídas
                        </button>
                      </div>

                      {categoryTab === 'income' ? (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input 
                              value={newIncomeCategory}
                              onChange={(e) => setNewIncomeCategory(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newIncomeCategory.trim()) {
                                  addCategory(newIncomeCategory.trim(), 'income');
                                  setNewIncomeCategory('');
                                }
                              }}
                              placeholder="Nova categoria de entrada..."
                              className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            />
                            <button 
                              onClick={() => {
                                if (newIncomeCategory.trim()) {
                                  addCategory(newIncomeCategory.trim(), 'income');
                                  setNewIncomeCategory('');
                                }
                              }}
                              className="h-12 px-6 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-500/20 transition-all"
                            >
                              Adicionar
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {categories.filter(c => c.type === 'income').map(cat => (
                              <div key={cat.id} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-slate-300">
                                {cat.name}
                                <button 
                                  onClick={() => deleteCategory(cat.id)}
                                  className="text-slate-500 hover:text-rose-500 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input 
                              value={newExpenseCategory}
                              onChange={(e) => setNewExpenseCategory(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newExpenseCategory.trim()) {
                                  addCategory(newExpenseCategory.trim(), 'expense');
                                  setNewExpenseCategory('');
                                }
                              }}
                              placeholder="Nova categoria de saída..."
                              className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                            />
                            <button 
                              onClick={() => {
                                if (newExpenseCategory.trim()) {
                                  addCategory(newExpenseCategory.trim(), 'expense');
                                  setNewExpenseCategory('');
                                }
                              }}
                              className="h-12 px-6 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-bold hover:bg-rose-500/20 transition-all"
                            >
                              Adicionar
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {categories.filter(c => c.type === 'expense').map(cat => (
                              <div key={cat.id} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-slate-300">
                                {cat.name}
                                <button 
                                  onClick={() => deleteCategory(cat.id)}
                                  className="text-slate-500 hover:text-rose-500 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <footer className="py-10 px-10 text-center border-t border-white/5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">© 2024 FinanceFlow Inc. Todos os direitos reservados.</p>
        </footer>
      </main>

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

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-modal p-8 lg:p-12"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    {editingTransaction ? <Edit size={28} /> : <Plus size={28} />}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight">
                      {editingTransaction ? 'Editar Transação' : 'Nova Entrada'}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">Preencha os detalhes da sua movimentação</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
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
                  className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Tipo de Fluxo</label>
                    <select 
                      value={newTx.type}
                      onChange={(e) => setNewTx({...newTx, type: e.target.value as any, category: ''})}
                      className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer [&>option]:bg-slate-900"
                    >
                      <option value="expense" className="bg-slate-900">Despesa (Saída)</option>
                      <option value="income" className="bg-slate-900">Renda (Entrada)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Categoria</label>
                    <select 
                      value={newTx.category}
                      onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                      className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer [&>option]:bg-slate-900"
                      required
                    >
                      <option value="" disabled className="bg-slate-900">Selecionar categoria</option>
                      {newTx.type === 'income' ? (
                        categories.filter(c => c.type === 'income').map(cat => (
                          <option key={cat.id} value={cat.name} className="bg-slate-900">{cat.name}</option>
                        ))
                      ) : (
                        categories.filter(c => c.type === 'expense').map(cat => (
                          <option key={cat.id} value={cat.name} className="bg-slate-900">{cat.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Valor</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={newTx.amount}
                        onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                        className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 text-lg font-black focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-800"
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Data da Operação</label>
                    <input 
                      type="date"
                      value={newTx.date}
                      onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                      className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Descrição Detalhada</label>
                  <textarea 
                    value={newTx.description}
                    onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                    className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all resize-none placeholder:text-slate-800"
                    placeholder="Ex: Compra de suprimentos mensais... (Opcional)"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center gap-6 pt-10 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-2xl font-bold shadow-[0_20px_40px_-10px_rgba(17,82,212,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(17,82,212,0.5)] transition-all flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95"
                  >
                    <Plus size={22} />
                    Confirmar Transação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {transactionToDelete !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTransactionToDelete(null)}
              className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-modal p-10 border-rose-500/20"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                  <AlertTriangle size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Confirmar Exclusão</h3>
                  <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                    Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita e afetará seus relatórios.
                  </p>
                </div>
                <div className="flex w-full gap-4 pt-6">
                  <button 
                    onClick={() => setTransactionToDelete(null)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleDeleteTransaction(transactionToDelete)}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-6 py-4 rounded-2xl font-bold shadow-[0_15px_30px_-5px_rgba(239,68,68,0.3)] transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print styles and Dynamic Theme */}
      <style>{`
        :root {
          --color-primary: ${settings.primaryColor};
        }
        @media print {
          aside, header, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .glass-card {
            border: 1px solid #eee !important;
            background: white !important;
            box-shadow: none !important;
          }
          .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400 {
            color: #333 !important;
          }
          .bg-bg-dark {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
