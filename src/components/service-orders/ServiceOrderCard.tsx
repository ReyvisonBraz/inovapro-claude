import React from 'react';
import { 
  Briefcase, ChevronDown, AlertTriangle, Clock, 
  Smartphone, Calendar, Wallet, QrCode, 
  MessageCircle, Printer, Edit, Trash2 
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
  clientPayments
}) => {
  return (
    <div key={order.id} className="glass-card p-5 group hover:border-primary/30 transition-all">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Briefcase size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              {visibleColumns.id && <span className="text-sm font-bold text-primary">#OS-{order.id.toString().padStart(4, '0')}</span>}
              {visibleColumns.status && (
                <div className="relative">
                  <button 
                    onClick={() => setQuickStatusOrder(quickStatusOrder?.id === order.id ? null : order)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border hover:opacity-80 transition-all flex items-center gap-1"
                    style={getStatusColor(order.status)}
                  >
                    {order.status}
                    <ChevronDown size={10} />
                  </button>
                  
                  {quickStatusOrder?.id === order.id && (
                    <div className="absolute left-0 top-full mt-1 w-48 glass-modal p-2 z-50 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                      <div className="space-y-1">
                        {statuses.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              handleUpdateStatus(order.id, s.name);
                              setQuickStatusOrder(null);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                              order.status === s.name ? "bg-primary/20 text-primary" : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {visibleColumns.priority && order.priority === 'high' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle size={10} /> Alta Prioridade
                </span>
              )}
              {visibleColumns.prediction && order.analysisPrediction && new Date(order.analysisPrediction) < new Date() && order.status !== 'Concluído' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                  <Clock size={10} /> Atrasado
                </span>
              )}
            </div>
            
            <div className="flex flex-col gap-0.5">
              <h4 className="font-black text-xl text-white tracking-tight">
                {order.firstName} {order.lastName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                  <Smartphone size={14} />
                  {order.equipmentBrand} {order.equipmentModel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mt-4">
              {visibleColumns.entryDate && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={14} className="text-slate-600" />
                  <span>Entrada: <span className="text-slate-300 font-medium">{order.entryDate || format(parseISO(order.createdAt), 'dd/MM/yyyy')}</span></span>
                </div>
              )}
              {visibleColumns.prediction && order.analysisPrediction && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={14} className="text-slate-600" />
                  <span>Previsão: <span className="text-slate-300 font-medium">{format(parseISO(order.analysisPrediction), 'dd/MM/yyyy')}</span></span>
                </div>
              )}
              {visibleColumns.total && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Wallet size={14} className="text-slate-600" />
                  <span>Total: <span className="text-emerald-400 font-bold">{formatCurrency(order.totalAmount || 0)}</span></span>
                </div>
              )}
            </div>

            {order.reportedProblem && (
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Problema Relatado</p>
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {order.reportedProblem}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row md:flex-col justify-between items-start sm:items-end gap-4 shrink-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
          <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end md:hidden">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Criado em</p>
            <p className="text-xs font-medium text-slate-300">{format(parseISO(order.createdAt), "dd MMM yyyy", { locale: ptBR })}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Criado em</p>
            <p className="text-xs font-medium text-slate-300">{format(parseISO(order.createdAt), "dd MMM yyyy", { locale: ptBR })}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end w-full sm:w-auto">
            <button 
              onClick={() => {
                setSelectedOrder(order);
                setShowQRCodeModal(true);
              }}
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all border border-white/5"
              title="Ver QR Code"
            >
              <QrCode size={20} />
            </button>
            <button 
              onClick={() => {
                setSelectedOrder(order);
                setShowWhatsAppModal(true);
              }}
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all border border-white/5"
              title="Enviar via WhatsApp"
            >
              <MessageCircle size={20} />
            </button>
            <button 
              onClick={() => {
                setSelectedOrder(order);
                setShowPrintModal(true);
              }}
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all border border-white/5"
              title="Imprimir OS"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={() => handleEdit(order)}
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all border border-white/5"
              title="Editar"
            >
              <Edit size={20} />
            </button>
            <button 
              onClick={() => {
                const hasParts = order.partsUsed && order.partsUsed.length > 0;
                const isCompleted = order.status === 'Concluído' || order.status === 'Entregue';
                const hasPayments = clientPayments.data.some((p: any) => p.description?.includes(`#OS-${order.id}`));
                
                let warningMessage = `Tem certeza que deseja excluir a Ordem de Serviço #OS-${order.id.toString().padStart(4, '0')}?`;
                
                if (isCompleted) {
                  warningMessage += `\n\n⚠️ ATENÇÃO: Esta ordem está com status "${order.status}". Excluir ordens finalizadas pode afetar seus relatórios financeiros e histórico do cliente.`;
                }
                
                if (hasParts) {
                  warningMessage += `\n\n⚠️ ATENÇÃO: Existem ${order.partsUsed?.length || 0} peças vinculadas a esta ordem. A exclusão NÃO retornará automaticamente estas peças ao estoque.`;
                }

                if (hasPayments) {
                  warningMessage += `\n\n⚠️ ATENÇÃO: Existem pagamentos registrados para esta Ordem de Serviço no módulo de Contas a Receber. Recomenda-se verificar antes de excluir.`;
                }

                onOpenConfirm(
                  'Excluir Ordem de Serviço',
                  warningMessage,
                  () => onDeleteOrder(order.id),
                  'danger'
                );
              }}
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5"
              title="Excluir"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
