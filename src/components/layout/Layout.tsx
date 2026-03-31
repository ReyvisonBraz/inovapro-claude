import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { ClientPayment, ServiceOrder } from '../../types';

interface LayoutProps {
  clientPayments: ClientPayment[];
  serviceOrders: ServiceOrder[];
  onLogout: () => void;
  onExportCSV?: () => void;
  onPrintReport?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  clientPayments, 
  serviceOrders, 
  onLogout,
  onExportCSV,
  onPrintReport
}) => {
  const { isSidebarOpen, setIsSidebarOpen } = useAppStore();

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

        <Sidebar onLogout={onLogout} />

        <main className="flex-1 flex flex-col min-w-0">
          <Header 
            clientPayments={clientPayments} 
            serviceOrders={serviceOrders} 
            onExportCSV={onExportCSV}
            onPrintReport={onPrintReport}
          />

          <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10 pb-24 lg:pb-10">
            <Outlet />
          </div>

          <BottomNav />

          <footer className="py-10 px-10 text-center border-t border-white/5 hidden lg:block">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              © 2024 FinanceFlow Inc. Todos os direitos reservados.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};
