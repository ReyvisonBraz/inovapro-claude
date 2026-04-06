import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Download, 
  Printer, 
  Users, 
  Package, 
  CreditCard,
  Search as SearchIcon
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { Screen } from '../../types';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppStore } from '../../store/useAppStore';
import { useFilterStore } from '../../store/useFilterStore';
import { useNotifications } from '../../hooks/useNotifications';
import { useClientPayments } from '../../hooks/useClientPayments';
import { useServiceOrders } from '../../hooks/useServiceOrders';
import { useExportData } from '../../hooks/useExportData';
import { useTransactions } from '../../hooks/useTransactions';
import { useCustomers } from '../../hooks/useCustomers';
import { useInventory } from '../../hooks/useInventory';
import { useFormStore } from '../../store/useFormStore';
import { useModalStore } from '../../store/useModalStore';

export const Header = () => {
  const { settings } = useSettingsStore();
  const {
    activeScreen, setActiveScreen,
    isSidebarOpen, setIsSidebarOpen,
    fontSize, setFontSize,
    showNotifications, setShowNotifications,
    notificationTab, setNotificationTab,
    setIsSearchingOS,
    setIsAdding,
    setIsAddingServiceOrder,
    setIsAddingCustomer,
    setCustomerRegistrationSource,
    setIsAddingInventoryItem,
    setIsAddingClientPayment
  } = useAppStore();

  const { searchTerm, setSearchTerm } = useFilterStore();
  
  const { clientPayments } = useClientPayments();
  const { serviceOrders } = useServiceOrders();
  const { transactions } = useTransactions();
  const { customers } = useCustomers();
  const { inventoryItems } = useInventory();
  const { setNewCustomer } = useFormStore();
  const { setEditingTransaction, setEditingCustomer } = useModalStore();

  const { 
    exportTransactionsToCSV,
    exportServiceOrdersToCSV,
    exportCustomersToCSV,
    exportInventoryToCSV,
    exportPaymentsToCSV
  } = useExportData();

  const { 
    upcomingDebts,
    dueTodayDebts,
    overdueDebts,
    overdueServiceOrders,
    dueTodayServiceOrders,
    upcomingServiceOrders,
    totalPaymentNotifications,
    totalServiceOrderNotifications,
    totalNotifications
  } = useNotifications(clientPayments.data, serviceOrders.data);

  const getHeaderConfig = () => {
    switch (activeScreen) {
      case 'dashboard':
        return { title: 'Painel de Controle' };
      case 'transactions':
        return { 
          title: 'Transações Diárias',
          export: { label: 'Exportar CSV', icon: Download, onClick: () => exportTransactionsToCSV(transactions.data) },
          newButton: { 
            label: 'Nova Entrada', 
            icon: Plus, 
            onClick: () => {
              setEditingTransaction(null);
              setIsAdding(true);
            } 
          }
        };
      case 'service-orders':
        return { 
          title: 'Ordens de Serviço',
          export: { label: 'Exportar CSV', icon: Download, onClick: () => exportServiceOrdersToCSV(serviceOrders.data, customers.data) },
          searchButton: { label: 'Buscar OS', icon: SearchIcon, onClick: () => setIsSearchingOS(true) },
          newButton: { label: 'Nova Ordem', icon: Plus, onClick: () => setIsAddingServiceOrder(true) }
        };
      case 'customers':
        return { 
          title: 'Gestão de Clientes',
          export: { label: 'Exportar CSV', icon: Download, onClick: () => exportCustomersToCSV(customers.data) },
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
              setCustomerRegistrationSource('customers');
              setIsAddingCustomer(true);
            } 
          }
        };
      case 'inventory':
        return { 
          title: 'Produtos & Serviços',
          export: { label: 'Exportar CSV', icon: Download, onClick: () => exportInventoryToCSV(inventoryItems) },
          newButton: { label: 'Novo Item', icon: Package, onClick: () => setIsAddingInventoryItem(true) }
        };
      case 'client-payments':
        return { 
          title: 'Vendas e Pagamentos',
          export: { label: 'Exportar CSV', icon: Download, onClick: () => exportPaymentsToCSV(clientPayments.data) },
          newButton: { label: 'Novo Pagamento', icon: CreditCard, onClick: () => setIsAddingClientPayment(true) }
        };
      case 'reports':
        return { 
          title: 'Relatórios e Análises',
          export: { label: 'Imprimir', icon: Printer, onClick: () => window.print() }
        };
      case 'settings':
        return { title: 'Configurações do Sistema' };
      default:
        return { title: 'FinanceFlow' };
    }
  };

  const config = getHeaderConfig();

  return (
    <header className="sticky top-0 z-40 bg-bg-dark/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-2xl shadow-black/20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2.5 text-slate-400 hover:bg-white/5 rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-xl font-black tracking-tighter italic leading-none">{config.title}</h2>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 hidden sm:block">Ano Fiscal {settings.fiscalYear}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {activeScreen === 'transactions' && (
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-primary/50 transition-all w-64">
            <Search size={16} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar transação..."
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full placeholder:text-slate-600 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setFontSize(Math.max(fontSize - 2, 12))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Diminuir fonte"
          >
            <span className="text-sm font-bold">A-</span>
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
          <button
            onClick={() => setFontSize(Math.min(fontSize + 2, 24))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Aumentar fonte"
          >
            <span className="text-sm font-bold">A+</span>
          </button>
        </div>

        <NotificationCenter 
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notificationTab={notificationTab}
          setNotificationTab={setNotificationTab}
          totalNotifications={totalNotifications}
          totalPaymentNotifications={totalPaymentNotifications}
          totalServiceOrderNotifications={totalServiceOrderNotifications}
          overdueDebts={overdueDebts}
          dueTodayDebts={dueTodayDebts}
          upcomingDebts={upcomingDebts}
          overdueServiceOrders={overdueServiceOrders}
          dueTodayServiceOrders={dueTodayServiceOrders}
          upcomingServiceOrders={upcomingServiceOrders}
          setActiveScreen={setActiveScreen}
        />
        <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>
        <div className="flex gap-2">
           {config.searchButton && (
             <button 
              onClick={config.searchButton?.onClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-white/10 transition-all hover:border-white/20"
            >
              {React.createElement(config.searchButton?.icon || SearchIcon, { size: 16 })}
              {config.searchButton?.label}
            </button>
           )}
           {config.export && (
             <button 
              onClick={config.export?.onClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-white/10 transition-all hover:border-white/20"
            >
              {React.createElement(config.export?.icon || Download, { size: 16 })}
              {config.export?.label || 'Exportar'}
            </button>
           )}
           {config.newButton && (
            <button 
              onClick={config.newButton?.onClick}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_10px_20px_-5px_rgba(17,82,212,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(17,82,212,0.5)] hover:scale-[1.02] active:scale-95"
            >
              {React.createElement(config.newButton?.icon || Plus, { size: 18 })}
              {config.newButton?.label}
            </button>
           )}
        </div>
      </div>
    </header>
  );
};
