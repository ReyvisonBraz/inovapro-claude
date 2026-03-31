import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Download, 
  Printer, 
  Users, 
  Package, 
  CreditCard 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NotificationCenter } from './NotificationCenter';
import { Screen, ClientPayment, ServiceOrder } from '../types';
import { useSettingsStore } from '../store/useSettingsStore';

interface HeaderProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notificationTab: 'payments' | 'service-orders';
  setNotificationTab: (tab: 'payments' | 'service-orders') => void;
  totalNotifications: number;
  totalPaymentNotifications: number;
  totalServiceOrderNotifications: number;
  overdueDebts: ClientPayment[];
  dueTodayDebts: ClientPayment[];
  upcomingDebts: ClientPayment[];
  overdueServiceOrders: ServiceOrder[];
  dueTodayServiceOrders: ServiceOrder[];
  upcomingServiceOrders: ServiceOrder[];
  getHeaderConfig: () => any;
}

export const Header = ({
  activeScreen,
  setActiveScreen,
  isSidebarOpen,
  setIsSidebarOpen,
  searchTerm,
  setSearchTerm,
  fontSize,
  setFontSize,
  showNotifications,
  setShowNotifications,
  notificationTab,
  setNotificationTab,
  totalNotifications,
  totalPaymentNotifications,
  totalServiceOrderNotifications,
  overdueDebts,
  dueTodayDebts,
  upcomingDebts,
  overdueServiceOrders,
  dueTodayServiceOrders,
  upcomingServiceOrders,
  getHeaderConfig
}: HeaderProps) => {
  const { settings } = useSettingsStore();

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
          <h2 className="text-xl font-black tracking-tighter italic leading-none">{getHeaderConfig().title}</h2>
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
  );
};
