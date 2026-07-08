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
  Search as SearchIcon,
  X
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
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
import { useIsMobile } from '../../hooks/useMediaQuery';

export const Header = () => {
  const isMobile = useIsMobile();
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
  const { transactions } = useTransactions(() => {});
  const { customers } = useCustomers();
  const { inventoryItems } = useInventory(() => {});
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
    overdueDebts, dueTodayDebts, upcomingDebts,
    overdueServiceOrders, dueTodayServiceOrders, upcomingServiceOrders,
    totalPaymentNotifications, totalServiceOrderNotifications,
    totalNotifications
  } = useNotifications(clientPayments.data, serviceOrders.data);

  const getHeaderConfig = () => {
    switch (activeScreen) {
      case 'dashboard':
        return { title: 'Painel de Controle', subtitle: 'Visão geral do negócio' };
      case 'transactions':
        return {
          title: 'Transações Diárias',
          subtitle: 'Receitas e despesas',
          export: { label: 'Exportar', icon: Download, onClick: () => exportTransactionsToCSV(transactions.data) },
          newButton: { label: 'Nova Entrada', icon: Plus, onClick: () => { setEditingTransaction(null); setIsAdding(true); } }
        };
      case 'service-orders':
        return {
          title: 'Ordens de Serviço',
          subtitle: 'Assistência técnica',
          export: { label: 'Exportar', icon: Download, onClick: () => exportServiceOrdersToCSV(serviceOrders.data, customers.data) },
          searchButton: { label: 'Buscar', icon: SearchIcon, onClick: () => setIsSearchingOS(true) },
          newButton: { label: 'Nova Ordem', icon: Plus, onClick: () => setIsAddingServiceOrder(true) }
        };
      case 'customers':
        return {
          title: 'Clientes',
          subtitle: 'Gestão de clientes',
          export: { label: 'Exportar', icon: Download, onClick: () => exportCustomersToCSV(customers.data) },
          newButton: {
            label: 'Novo Cliente', icon: Users,
            onClick: () => {
              setEditingCustomer(null);
              setNewCustomer({ firstName: '', lastName: '', nickname: '', cpf: '', companyName: '', phone: '', observation: '', creditLimit: undefined });
              setCustomerRegistrationSource('customers');
              setIsAddingCustomer(true);
            }
          }
        };
      case 'inventory':
        return {
          title: 'Produtos & Serviços',
          subtitle: 'Catálogo e estoque',
          export: { label: 'Exportar', icon: Download, onClick: () => exportInventoryToCSV(inventoryItems) },
          newButton: { label: 'Novo Item', icon: Package, onClick: () => setIsAddingInventoryItem(true) }
        };
      case 'client-payments':
        return {
          title: 'Vendas e Pagamentos',
          subtitle: 'Recebíveis e cobranças',
          export: { label: 'Exportar', icon: Download, onClick: () => exportPaymentsToCSV(clientPayments.data) },
          newButton: { label: 'Novo Pagamento', icon: CreditCard, onClick: () => setIsAddingClientPayment(true) }
        };
      case 'reports':
        return { title: 'Relatórios', subtitle: 'Análises e métricas', export: { label: 'Imprimir', icon: Printer, onClick: () => window.print() } };
      case 'settings':
        return { title: 'Configurações', subtitle: 'Personalize o sistema' };
      default:
        return { title: 'INOVA PRO', subtitle: '' };
    }
  };

  const config = getHeaderConfig();

  if (isMobile) {
    return (
      <header className="sticky top-0 z-30 bg-bg-dark/90 backdrop-blur-xl border-b border-white/[0.04] mobile-safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold font-display tracking-tight text-white leading-tight">{config.title}</h1>
              {config.subtitle && (
                <span className="text-[10px] font-medium text-slate-500 leading-tight">{config.subtitle}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
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
            {config.newButton && (
              <button
                onClick={config.newButton.onClick}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25 active:scale-90 transition-all"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Search bar inline for transactions */}
        {activeScreen === 'transactions' && (
          <div className="px-4 pb-3">
            <div className="flex items-center bg-white/[0.04] border border-white/[0.06] rounded-xl px-3.5 h-10 focus-within:border-primary/40 transition-all">
              <Search size={15} className="text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Buscar transação..."
                className="bg-transparent border-none focus:ring-0 text-sm ml-2.5 w-full placeholder:text-slate-600 font-medium outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1 text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-bg-dark/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex items-center justify-between px-6 lg:px-10 h-16">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold font-display tracking-tight text-white">{config.title}</h1>
            {config.subtitle && (
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{config.subtitle}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeScreen === 'transactions' && (
            <div className="flex items-center bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 h-10 focus-within:border-primary/40 transition-all w-56">
              <Search size={15} className="text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Buscar transação..."
                className="bg-transparent border-none focus:ring-0 text-sm ml-2.5 w-full placeholder:text-slate-600 font-medium outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1 text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setFontSize(Math.max(fontSize - 2, 12))}
              title="Diminuir fonte"
              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-colors text-[11px] font-black"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(Math.min(fontSize + 2, 24))}
              title="Aumentar fonte"
              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition-colors text-[11px] font-black"
            >
              A+
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

          <div className="h-6 w-px bg-white/[0.06]" />

          <div className="flex items-center gap-2">
            {config.searchButton && (
              <button onClick={config.searchButton.onClick} className="btn-secondary h-10 px-3.5 text-xs">
                {React.createElement(config.searchButton.icon || SearchIcon, { size: 15 })}
                <span className="hidden xl:inline">{config.searchButton.label}</span>
              </button>
            )}
            {config.export && (
              <button onClick={config.export.onClick} className="btn-secondary h-10 px-3.5 text-xs">
                {React.createElement(config.export.icon || Download, { size: 15 })}
                <span className="hidden xl:inline">{config.export.label}</span>
              </button>
            )}
            {config.newButton && (
              <button onClick={config.newButton.onClick} className="btn-primary h-10 px-5 text-xs shadow-lg shadow-primary/25">
                {React.createElement(config.newButton.icon || Plus, { size: 16 })}
                <span>{config.newButton.label}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
