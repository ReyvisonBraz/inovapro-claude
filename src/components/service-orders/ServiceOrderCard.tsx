import React from 'react';
import { 
  ChevronDown, AlertTriangle, Clock, 
  Smartphone, Calendar, Wallet, QrCode, 
  MessageCircle, Printer, Edit, Trash2, Check, RotateCcw, ShieldCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { getOrderWarranties, getWarrantyExpirySummary } from '../../lib/warrantyUtils';

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
  const warrantySummary = getWarrantyExpirySummary(getOrderWarranties(order));

  return (
    <div key={order.id} className={cn(
      "glass-card group hover:border-primary/30 transition-all duration-300 overflow-visible",
      isGrid ? "p-4 flex flex-col h-full" : "p-4 md:p-5"
    )}>
      <div className={cn(
        "flex gap-4",
        isGrid ? "flex-col" : "flex-col md:flex-row justify-between"
      )}>
        <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
              {visibleColumns.id && (
                <span className="text-[10px] md:text-xs font-black text-primary bg-primary/5 px-2 py-0.5 md:px-2.5 md:py-1 rounded border border-primary/10 shrink-0">
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
                    <>
                      <div
                        className="fixed inset-0 z-[90]"
                        onClick={() => setQuickStatusOrder(null)}
                      />
                      <div className="absolute left-0 top-full mt-2 w-56 glass-modal p-1.5 z-[110] shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl overflow-hidden" style={{ maxHeight: '70vh' }}>
                        <div className="p-2 mb-1 border-b border-white/5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Alterar Status</p>
                        </div>
                        <div className="space-y-0.5 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(70vh - 48px)' }}>
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
                    </>
                  )}
                </div>
              )}

              {visibleColumns.priority && order.priority === 'high' && (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle size={10} /> Alta
                </span>
              )}

              {warrantySummary && (
                <span className={cn(
                  'flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border',
                  warrantySummary.state === 'active' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  warrantySummary.state === 'expiring' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  warrantySummary.state === 'expired' && 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                )}>
                  <ShieldCheck size={11} /> {warrantySummary.label}
                </span>
              )}

              {order.warrantyReturn && (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <RotateCcw size={10} /> Retorno em garantia
                </span>
              )}
            </div>
            
            <div className="flex flex-col min-w-0">
              <h4 className={cn(
                "font-bold md:font-black text-white tracking-tight leading-tight truncate",
                isGrid ? "text-sm" : "text-sm md:text-2xl"
              )}>
                {order.firstName} {order.lastName}
              </h4>
              <div className="flex items-center gap-2 mt-1 md:mt-1.5 min-w-0">
                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md bg-white/5 text-slate-300 border border-white/10 text-[10px] md:text-xs font-bold min-w-0 max-w-full overflow-hidden">
                  <Smartphone size={12} className="text-primary shrink-0" />
                  <span className="truncate">
                    {order.equipmentType && <span className="text-primary">{order.equipmentType}</span>}
                    {order.equipmentType && (order.equipmentBrand || order.equipmentModel) && ' - '}
                    {order.equipmentBrand} {order.equipmentModel}
                    {!order.equipmentType && !order.equipmentBrand && !order.equipmentModel && (
                      <span className="text-slate-500 italic">Sem equipamento</span>
                    )}
                  </span>
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
            <div className="text-right hidden lg:block">
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
        "mt-5 pt-4 border-t border-white/5",
        isGrid ? "flex flex-col gap-2" : "flex items-center gap-2 justify-end"
      )}>
        {isGrid && (
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Criado em</span>
            <span className="text-[10px] font-bold text-slate-400">
              {format(parseISO(order.createdAt), "dd/MM/yy")}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
          <button
            onClick={() => handleEdit(order)}
            className={cn(
              "flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0",
              isGrid ? "p-1.5" : "px-4 py-2"
            )}
            title="Editar"
          >
            <Edit size={isGrid ? 14 : 16} />
            {!isGrid && <span className="hidden lg:inline text-xs font-bold ml-2">Editar</span>}
          </button>

          <div className="h-5 w-px bg-white/10 shrink-0" />

          <button
            onClick={() => {
              setSelectedOrder(order);
              setShowQRCodeModal(true);
            }}
            className={cn(
              "flex items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all active:scale-95 shrink-0",
              isGrid ? "p-1.5" : "px-4 py-2"
            )}
            title="QR Code"
          >
            <QrCode size={isGrid ? 14 : 16} />
            {!isGrid && <span className="text-xs font-bold ml-2">QR Code</span>}
          </button>

          <div className="h-5 w-px bg-white/10 shrink-0" />

          <button 
            onClick={() => {
              setSelectedOrder(order);
              setShowWhatsAppModal(true);
            }}
            className={cn(
              "rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all shrink-0",
              isGrid ? "p-1.5" : "p-2"
            )}
            title="WhatsApp"
          >
            <MessageCircle size={isGrid ? 14 : 18} />
          </button>
          
          <button 
            onClick={() => {
              setSelectedOrder(order);
              setShowPrintModal(true);
            }}
            className={cn(
              "rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all shrink-0",
              isGrid ? "p-1.5" : "p-2"
            )}
            title="Imprimir"
          >
            <Printer size={isGrid ? 14 : 18} />
          </button>

          <button 
            onClick={() => {
              onGeneratePayment?.(order);
            }}
            className={cn(
              "rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all shrink-0",
              isGrid ? "p-1.5" : "p-2"
            )}
            title="Gerar Pagamento"
          >
            <Wallet size={isGrid ? 14 : 18} />
          </button>

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
            className={cn(
              "rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0",
              isGrid ? "p-1.5" : "p-2"
            )}
            title="Excluir"
          >
            <Trash2 size={isGrid ? 14 : 18} />
          </button>
        </div>
      </div>
    </div>
  );
};
