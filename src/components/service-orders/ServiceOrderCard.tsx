import React from 'react';
import { 
  Briefcase, ChevronDown, AlertTriangle, Clock, 
  Smartphone, Calendar, Wallet, QrCode, 
  MessageCircle, Printer, Edit, Trash2, Check, MoreHorizontal
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface ServiceOrderCardProps {
  order: any;
  visibleColumns: any;
  quickStatusOrder: any;
  setQuickStatusOrder: (order: any) => void;
  getStatusColor: (status: string) => any;
  statuses: any[];
  handleUpdateStatus: (id: number, status: string) => void;
  formatCurrency: (value: number) => string;
  setSelectedOrder: (order: any) => void;
  setShowQRCodeModal: (show: boolean) => void;
  setShowWhatsAppModal: (show: boolean) => void;
  setShowPrintModal: (show: boolean) => void;
  handleEdit: (order: any) => void;
  onOpenConfirm: (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning') => void;
  onDeleteOrder: (id: number) => void;
  clientPayments: any;
  viewMode?: 'grid' | 'list';
  onGeneratePayment?: (order: any) => void;
}

export const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({
  order,
  visibleColumns,
  quickStatusOrder,
  setQuickStatusOrder,
  getStatusColor,
  statuses,
  handleUpdateStatus,
  formatCurrency,
  setSelectedOrder,
  setShowQRCodeModal,
  setShowWhatsAppModal,
  setShowPrintModal,
  handleEdit,
  onOpenConfirm,
  onDeleteOrder,
  clientPayments,
  viewMode = 'list',
  onGeneratePayment
}) => {
  const isGrid = viewMode === 'grid';

  return (
    <div key={order.id} className={cn(
      "glass-card group hover:border-primary/30 transition-all duration-300 overflow-visible",
      isGrid ? "p-4 flex flex-col h-full" : "p-5"
    )}>
      <div className={cn(
        "flex gap-4",
        isGrid ? "flex-col" : "flex-col md:flex-row justify-between"
      )}>
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={cn(
            "rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110",
            isGrid ? "h-10 w-10" : "h-12 w-12"
          )}>
            <Briefcase size={isGrid ? 20 : 24} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {visibleColumns.id && (
                <span className="text-xs font-black text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10">
                  #OS-{order.id.toString().padStart(4, '0')}
                </span>
              )}
              
              {visibleColumns.status && (
                <div className="relative">
                  <button 
                    onClick={() => setQuickStatusOrder(quickStatusOrder?.id === order.id ? null : order)}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                    style={getStatusColor(order.status)}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                    {order.status}
                    <ChevronDown size={12} className={cn("transition-transform duration-200", quickStatusOrder?.id === order.id && "rotate-180")} />
                  </button>
                  
                  {quickStatusOrder?.id === order.id && (
                    <div className="absolute left-0 top-full mt-2 w-56 glass-modal p-1.5 z-[100] shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl overflow-hidden">
                      <div className="p-2 mb-1 border-b border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Alterar Status</p>
                      </div>
                      <div className="space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
                        {statuses.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              handleUpdateStatus(order.id, s.name);
                              setQuickStatusOrder(null);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-3 group/item",
                              order.status === s.name 
                                ? "bg-primary/20 text-primary shadow-inner" 
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <span 
                              className="h-1.5 w-1.5 rounded-full shrink-0 shadow-sm group-hover/item:scale-125 transition-transform" 
                              style={{ backgroundColor: s.color }} 
                            />
                            <span className="flex-1 truncate">{s.name}</span>
                            {order.status === s.name && <Check size={10} className="shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {visibleColumns.priority && order.priority === 'high' && (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle size={10} /> Alta
                </span>
              )}
            </div>
            
            <div className="flex flex-col">
              <h4 className={cn(
                "font-black text-white tracking-tight leading-tight truncate",
                isGrid ? "text-xl" : "text-2xl"
              )}>
                {order.firstName} {order.lastName}
              </h4>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/10 text-xs font-bold">
                  <Smartphone size={14} className="text-primary" />
                  {order.equipmentBrand} {order.equipmentModel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(
          "flex flex-col gap-4",
          isGrid ? "mt-2" : "md:items-end justify-between"
        )}>
          {!isGrid && (
            <div className="text-right hidden md:block">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Entrada</p>
              <p className="text-xs font-bold text-slate-300">
                {format(parseISO(order.createdAt), "dd MMM yyyy", { locale: ptBR })}
              </p>
            </div>
          )}

          <div className={cn(
            "grid gap-3",
            isGrid ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3 md:flex md:items-center"
          )}>
            {visibleColumns.entryDate && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Entrada</span>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10 text-[10px] text-blue-400 font-bold shadow-sm">
                  <Calendar size={12} />
                  {order.entryDate ? order.entryDate.split('-').reverse().join('/') : format(parseISO(order.createdAt), 'dd/MM/yy')}
                </div>
              </div>
            )}
            
            {visibleColumns.prediction && order.analysisPrediction && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Previsão</span>
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-sm text-[10px] font-bold",
                  new Date(order.analysisPrediction) < new Date() && order.status !== 'Concluído' 
                    ? "bg-rose-500/5 border-rose-500/10 text-rose-400" 
                    : "bg-slate-500/5 border-slate-500/10 text-slate-400"
                )}>
                  <Clock size={12} />
                  {format(parseISO(order.analysisPrediction), 'dd/MM/yy')}
                </div>
              </div>
            )}

            {visibleColumns.total && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Valor Total</span>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-sm text-emerald-400 font-black shadow-sm">
                  <Wallet size={14} />
                  {formatCurrency(order.totalAmount || 0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {order.reportedProblem && (
        <div className={cn(
          "p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group/problem",
          isGrid ? "mt-3 flex-1" : "mt-4"
        )}>
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-l-xl" />
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-primary/70" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problema Relatado</p>
          </div>
          <p className={cn(
            "text-slate-300 leading-relaxed font-medium",
            isGrid ? "text-xs line-clamp-3" : "text-sm line-clamp-2"
          )}>
            {order.reportedProblem}
          </p>
        </div>
      )}

      <div className={cn(
        "flex items-center gap-2 mt-5 pt-4 border-t border-white/5",
        isGrid ? "justify-between" : "justify-end"
      )}>
        {isGrid && (
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Criado em</span>
            <span className="text-[10px] font-bold text-slate-400">
              {format(parseISO(order.createdAt), "dd/MM/yy")}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
          <button 
            onClick={() => handleEdit(order)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95",
              isGrid ? "p-2" : "px-4 py-2"
            )}
            title="Editar"
          >
            <Edit size={16} />
            {!isGrid && <span className="text-xs font-bold">Editar</span>}
          </button>
          
          <div className="h-4 w-px bg-white/10 mx-1" />
          
          <button 
            onClick={() => {
              setSelectedOrder(order);
              setShowQRCodeModal(true);
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all active:scale-95",
              isGrid ? "p-2" : "px-4 py-2"
            )}
            title="QR Code"
          >
            <QrCode size={16} />
            {!isGrid && <span className="text-xs font-bold">QR Code</span>}
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button 
            onClick={() => {
              setSelectedOrder(order);
              setShowWhatsAppModal(true);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
            title="WhatsApp"
          >
            <MessageCircle size={18} />
          </button>
          
          <button 
            onClick={() => {
              setSelectedOrder(order);
              setShowPrintModal(true);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
            title="Imprimir"
          >
            <Printer size={18} />
          </button>

          {order.status === 'Concluído' && !clientPayments.data.some((p: any) => p.description?.includes(`OS #${order.id.toString().padStart(4, '0')}`)) && (
            <button 
              onClick={() => {
                onGeneratePayment?.(order);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
              title="Gerar Pagamento"
            >
              <Wallet size={18} />
            </button>
          )}

          <button 
            onClick={() => {
              const hasParts = order.partsUsed && order.partsUsed.length > 0;
              const isCompleted = order.status === 'Concluído' || order.status === 'Entregue';
              const hasPayments = clientPayments.data.some((p: any) => p.description?.includes(`#OS-${order.id}`));
              
              let warningMessage = `Excluir #OS-${order.id.toString().padStart(4, '0')}?`;
              if (isCompleted) warningMessage += `\nStatus: ${order.status}.`;
              if (hasParts) warningMessage += `\nPossui peças vinculadas.`;
              if (hasPayments) warningMessage += `\nPossui pagamentos registrados.`;

              onOpenConfirm(
                'Excluir OS',
                warningMessage,
                () => onDeleteOrder(order.id),
                'danger'
              );
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
