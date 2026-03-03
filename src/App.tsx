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
  CheckCircle2
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
import { Transaction, Screen, AppSettings, Customer, ClientPayment } from './types';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Configurações do App
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'Financeiro Pro',
    fiscalYear: '2024',
    primaryColor: '#1152d4',
    categories: 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
    profileName: 'Inova Informática',
    profileAvatar: 'https://picsum.photos/seed/inova/100/100',
    appVersion: 'Versão Empresarial',
    initialBalance: 0,
    showWarnings: true,
    hiddenColumns: [],
    settingsPassword: '1234'
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
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingClientPayment, setIsAddingClientPayment] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState<ClientPayment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
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

  useEffect(() => {
    fetchTransactions();
    fetchSettings();
    fetchCustomers();
    fetchClientPayments();
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

  const handleAddCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.phone) {
      alert("Por favor, preencha pelo menos o nome e o telefone.");
      return;
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

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      
      if (editingCustomer) {
        const nameChanged = editingCustomer.firstName !== newCustomer.firstName || editingCustomer.lastName !== newCustomer.lastName;
        if (nameChanged) {
          const confirmNameChange = window.confirm("Você alterou o nome do cliente. Isso será refletido em todos os lançamentos vinculados. Deseja continuar?");
          if (!confirmNameChange) return;
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

    try {
      await fetch(`/api/client-payments/${isRecordingPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidAmount: newPaidAmount,
          status: newStatus
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
    
    const message = `*COMPROVANTE DE PAGAMENTO / LEMBRETE* 📄\n\n` +
      `*Cliente:* ${customer.firstName} ${customer.lastName}\n` +
      `*Empresa:* ${customer.companyName || 'N/A'}\n` +
      `*Descrição:* ${payment.description}\n` +
      `----------------------------------\n` +
      `*Valor Total:* ${formatCurrency(payment.totalAmount)}\n` +
      `*Valor Pago:* ${formatCurrency(payment.paidAmount)}\n` +
      `*Saldo Devedor:* ${formatCurrency(payment.totalAmount - payment.paidAmount)}\n` +
      `*Vencimento:* ${format(parseISO(payment.dueDate), 'dd/MM/yyyy')}\n` +
      `*Status:* ${payment.status === 'paid' ? '✅ PAGO' : '⏳ PENDENTE'}\n` +
      `----------------------------------\n` +
      `Agradecemos a preferência! 🙏`;
      
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      const res = await fetch(`/api/customers/${customer.id}/payments`);
      const payments = await res.json();
      
      if (payments.length > 0) {
        const descriptions = payments.map((p: any) => p.description).join(', ');
        const confirmDelete = window.confirm(
          `Este cliente possui lançamentos vinculados: ${descriptions}.\n\n` +
          `Para excluir o cliente, você deve primeiro excluir ou alterar esses lançamentos.\n` +
          `Deseja ir para a tela de pagamentos agora?`
        );
        if (confirmDelete) {
          setActiveScreen('client-payments');
        }
        return;
      }

      if (confirm('Deseja excluir este cliente?')) {
        await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' });
        fetchCustomers();
      }
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  };

  const printThermalReceipt = (payment: ClientPayment) => {
    const customer = customers.find(c => c.id === payment.customerId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Recibo Térmico</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 5mm; font-size: 12px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .footer { margin-top: 20px; text-align: center; }
            .signature { margin-top: 30px; border-top: 1px solid #000; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 class="bold">${settings.appName}</h2>
            <p>${settings.profileName}</p>
          </div>
          <div class="divider"></div>
          <p><span class="bold">CLIENTE:</span> ${customer?.firstName} ${customer?.lastName}</p>
          <p><span class="bold">DATA:</span> ${format(parseISO(payment.purchaseDate), 'dd/MM/yyyy')}</p>
          <div class="divider"></div>
          <p><span class="bold">DESC:</span> ${payment.description}</p>
          <p><span class="bold">TOTAL:</span> ${formatCurrency(payment.totalAmount)}</p>
          <p><span class="bold">PAGO:</span> ${formatCurrency(payment.paidAmount)}</p>
          <p><span class="bold">SALDO:</span> ${formatCurrency(payment.totalAmount - payment.paidAmount)}</p>
          <div class="divider"></div>
          <div class="signature">
            Assinatura do Cliente
          </div>
          <div class="footer">
            Obrigado pela preferência!
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const printA4Receipt = (payment: ClientPayment) => {
    const customer = customers.find(c => c.id === payment.customerId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Recibo A4 Completo</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .company-info h1 { margin: 0; color: ${settings.primaryColor}; }
            .receipt-title { text-align: center; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 40px; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: bold; border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .label { color: #666; font-size: 0.9em; }
            .value { font-weight: bold; }
            .totals { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 40px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .grand-total { font-size: 1.4em; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
            .footer { margin-top: 60px; text-align: center; font-size: 0.8em; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>${settings.appName}</h1>
              <p>${settings.profileName}</p>
            </div>
            <div class="date-info">
              <p>Data: ${format(new Date(), 'dd/MM/yyyy')}</p>
              <p>Recibo Nº: ${payment.id}</p>
            </div>
          </div>
          
          <h2 class="receipt-title">Comprovante de Pagamento Detalhado</h2>
          
          <div class="section">
            <div class="section-title">Dados do Cliente</div>
            <div class="grid">
              <div><span class="label">Nome:</span> <span class="value">${customer?.firstName} ${customer?.lastName}</span></div>
              <div><span class="label">CPF:</span> <span class="value">${customer?.cpf || 'N/A'}</span></div>
              <div><span class="label">Empresa:</span> <span class="value">${customer?.companyName || 'N/A'}</span></div>
              <div><span class="label">Telefone:</span> <span class="value">${customer?.phone}</span></div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Informações da Venda</div>
            <div class="grid">
              <div><span class="label">Descrição:</span> <span class="value">${payment.description}</span></div>
              <div><span class="label">Data da Compra:</span> <span class="value">${format(parseISO(payment.purchaseDate), 'dd/MM/yyyy')}</span></div>
              <div><span class="label">Vencimento:</span> <span class="value">${format(parseISO(payment.dueDate), 'dd/MM/yyyy')}</span></div>
              <div><span class="label">Forma de Pagamento:</span> <span class="value">${payment.paymentMethod}</span></div>
            </div>
          </div>
          
          <div class="totals">
            <div class="total-row"><span>Valor Total da Venda:</span> <span>${formatCurrency(payment.totalAmount)}</span></div>
            <div class="total-row"><span>Valor Pago até o momento:</span> <span>${formatCurrency(payment.paidAmount)}</span></div>
            <div class="total-row grand-total"><span>Saldo Devedor:</span> <span>${formatCurrency(payment.totalAmount - payment.paidAmount)}</span></div>
          </div>
          
          <div class="section" style="margin-top: 50px;">
            <div class="section-title">Observações</div>
            <p style="font-style: italic; color: #666;">${customer?.observation || 'Sem observações adicionais.'}</p>
          </div>
          
          <div class="footer">
            <p>Este documento é um comprovante de transação financeira entre as partes citadas.</p>
            <p>Gerado por ${settings.appName} em ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          
          <script>window.print();</script>
        </body>
      </html>
    `;
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

  const filteredCustomers = customers.filter(c => 
    c.firstName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.lastName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.nickname?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    c.cpf?.includes(customerSearch)
  );

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
            className="fixed inset-0 z-40 bg-bg-dark/80 backdrop-blur-sm lg:hidden"
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
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-bg-dark/80 backdrop-blur-md sticky top-0 z-30">
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
            <button className="p-2.5 text-slate-400 hover:bg-white/5 rounded-xl transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-bg-dark"></span>
            </button>
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
                    <select className="bg-slate-800 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary outline-none text-slate-200">
                      <option className="bg-slate-900">Últimos 12 Meses</option>
                      <option className="bg-slate-900">Últimos 6 Meses</option>
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
                    <input 
                      type="month"
                      value={dashboardMonth}
                      onChange={(e) => setDashboardMonth(e.target.value)}
                      className="bg-slate-800 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary outline-none text-slate-200 [color-scheme:dark]"
                    />
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
                    <input 
                      type="month"
                      value={dashboardMonth}
                      onChange={(e) => setDashboardMonth(e.target.value)}
                      className="bg-slate-800 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary outline-none text-slate-200 [color-scheme:dark]"
                    />
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
                          className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
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
                          className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="all">Todas</option>
                          {settings.categories.split(',').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
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
                              data={settings.categories.split(',').map(cat => ({
                                name: cat,
                                value: transactions.filter(t => t.category === cat && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
                              })).filter(d => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={110}
                              paddingAngle={8}
                              dataKey="value"
                            >
                              {settings.categories.split(',').map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#1152d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #ffffff10', borderRadius: '12px' }}
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
                      className="bg-slate-800 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary outline-none text-slate-200"
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
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</th>
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo</th>
                          <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {transactions
                          .filter(t => !reportMonth || format(parseISO(t.date), 'MMMM yyyy', { locale: ptBR }) === reportMonth)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(t => (
                            <tr 
                              key={t.id} 
                              className="hover:bg-white/[0.05] transition-colors cursor-pointer group"
                              onClick={() => handleTransactionClick(t)}
                            >
                              <td className="py-4 text-xs font-medium text-slate-400 group-hover:text-primary transition-colors">{format(parseISO(t.date), 'dd/MM/yyyy')}</td>
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
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Pesquisar clientes..."
                      className="h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none w-64"
                    />
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
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Plus size={20} />
                    Novo Cliente
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome *</label>
                            <input 
                              value={newCustomer.firstName}
                              onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
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
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Telefone (WhatsApp) *</label>
                            <input 
                              value={newCustomer.phone}
                              onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
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
                            onClick={handleAddCustomer}
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
                      {clientPayments.map(payment => (
                        <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold">{payment.customerName}</p>
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
                                  onClick={() => printThermalReceipt(payment)}
                                  className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                                  title="Recibo Térmico (80mm)"
                                >
                                  <Zap size={14} />
                                </button>
                                <button 
                                  onClick={() => printA4Receipt(payment)}
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
                      ))}
                      {clientPayments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic">
                            Nenhum pagamento registrado.
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
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200"
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
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200"
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categorias (Separadas por vírgula)</label>
                      <div className="relative">
                        <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          value={settings.categories}
                          onChange={(e) => updateSettings({...settings, categories: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
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
                      onChange={(e) => setNewTx({...newTx, type: e.target.value as any})}
                      className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer"
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
                      className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-200 appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled className="bg-slate-900">Selecionar categoria</option>
                      {settings.categories.split(',').map(cat => (
                        <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                      ))}
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
