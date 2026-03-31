import React from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';
import { ClientPayment, ServiceOrder, Screen } from '../types';

interface NotificationCenterProps {
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
  setActiveScreen: (screen: Screen) => void;
}

export const NotificationCenter = ({
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
  setActiveScreen
}: NotificationCenterProps) => {
  return (
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
  );
};
