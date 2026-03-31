import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, Plus, Download, Printer, Users, Package, CreditCard, 
  Menu, Download as DownloadIcon 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';
import { useFormStore } from '../../store/useFormStore';
import { useNotifications } from '../../hooks/useNotifications';
import { ClientPayment, ServiceOrder } from '../../types';

interface HeaderProps {
  clientPayments: ClientPayment[];
  serviceOrders: ServiceOrder[];
  onExportCSV?: () => void;
  onPrintReport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  clientPayments, 
  serviceOrders,
  onExportCSV,
  onPrintReport
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const { currentUser } = useAuthStore();
  const { 
    setIsSidebarOpen, 
    fontSize, setFontSize,
    showNotifications, setShowNotifications,
    notificationTab, setNotificationTab,
    setIsAdding,
    setIsAddingServiceOrder,
    setIsAddingInventoryItem,
    setIsAddingCustomer,
    setIsAddingClientPayment
  } = useAppStore();
  
  const { 
    setEditingCustomer,
    openConfirm 
  } = useModalStore();
  
  const { setNewCustomer } = useFormStore();

  const {
    overdueDebts,
    dueTodayDebts,
    upcomingDebts,
    overdueServiceOrders,
    dueTodayServiceOrders,
    upcomingServiceOrders,
    totalPaymentNotifications,
    totalServiceOrderNotifications,
    totalNotifications
  } = useNotifications(clientPayments, serviceOrders);

  const getHeaderConfig = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
      case '/dashboard':
        return { title: 'Painel de Controle' };
      case '/transactions':
        return { 
          title: 'Transações Diárias',
          export: { label: 'Exportar CSV', icon: Download, onClick: onExportCSV },
          newButton: { label: 'Nova Entrada', icon: Plus, onClick: () => setIsAdding(true) }
        };
      case '/service-orders':
        return { 
          title: 'Ordens de Serviço',
          export: { label: 'Exportar CSV', icon: Download, onClick: onExportCSV },
          newButton: { label: 'Nova Ordem', icon: Plus, onClick: () => setIsAddingServiceOrder(true) }
        };
      case '/customers':
        return { 
          title: 'Gestão de Clientes',
          export: { label: 'Exportar CSV', icon: Download, onClick: onExportCSV },
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
      case '/inventory':
        return { 
          title: 'Produtos & Serviços',
          export: { label: 'Exportar CSV', icon: Download, onClick: onExportCSV },
          newButton: { label: 'Novo Item', icon: Package, onClick: () => setIsAddingInventoryItem(true) }
        };
      case '/client-payments':
        return { 
          title: 'Vendas e Pagamentos',
          export: { label: 'Exportar CSV', icon: Download, onClick: onExportCSV },
          newButton: { label: 'Novo Pagamento', icon: CreditCard, onClick: () => setIsAddingClientPayment(true) }
        };
      case '/reports':
        return { 
          title: 'Relatórios e Análises',
          export: { label: 'Imprimir', icon: Printer, onClick: onPrintReport }
        };
      case '/settings':
        return { title: 'Configurações do Sistema' };
      default:
        return { title: 'FinanceFlow' };
    }
  };

  const config = getHeaderConfig();

  return (
    <header className={cn(
      "h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-bg-dark/80 backdrop-blur-md sticky top-0 transition-all",
      showNotifications ? "z-[60]" : "z-30"
    )}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 text-slate-400 hover:bg-white/5 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-bold tracking-tight">
          {config.title}
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
                            <div key={p.id} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-1 cursor-pointer hover:bg-rose-500/20 transition-colors" onClick={() => { navigate('/client-payments'); setShowNotifications(false); }}>
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
                            <div key={p.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1 cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => { navigate('/client-payments'); setShowNotifications(false); }}>
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
                            <div key={p.id} className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col gap-1 cursor-pointer hover:bg-yellow-500/20 transition-colors" onClick={() => { navigate('/client-payments'); setShowNotifications(false); }}>
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
                            <div key={o.id} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-1 cursor-pointer hover:bg-rose-500/20 transition-colors" onClick={() => { navigate('/service-orders'); setShowNotifications(false); }}>
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
                            <div key={o.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1 cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => { navigate('/service-orders'); setShowNotifications(false); }}>
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
                            <div key={o.id} className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col gap-1 cursor-pointer hover:bg-yellow-500/20 transition-colors" onClick={() => { navigate('/service-orders'); setShowNotifications(false); }}>
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
                        onClick={() => { navigate('/client-payments'); setShowNotifications(false); }}
                        className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                      >
                        Ver Todos os Pagamentos
                      </button>
                    ) : (
                      <button 
                        onClick={() => { navigate('/service-orders'); setShowNotifications(false); }}
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
           {config.export && (
             <button 
              onClick={config.export.onClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-white/10 transition-all hover:border-white/20"
            >
              {React.createElement(config.export.icon, { size: 16 })}
              {config.export.label}
            </button>
           )}
           {config.newButton && (
            <button 
              onClick={config.newButton.onClick}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_10px_20px_-5px_rgba(17,82,212,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(17,82,212,0.5)] hover:scale-[1.02] active:scale-95"
            >
              {React.createElement(config.newButton.icon, { size: 18 })}
              {config.newButton.label}
            </button>
           )}
        </div>
      </div>
    </header>
  );
};
