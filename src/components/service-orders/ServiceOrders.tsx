import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Search, Filter, Clock, CheckCircle2, 
  AlertCircle, Wrench, ChevronRight, Printer,
  MessageCircle, Trash2, Edit2
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { ServiceOrder } from '../../types';
import { format, parseISO } from 'date-fns';

interface ServiceOrdersProps {
  serviceOrders: ServiceOrder[];
  onAdd: (so: Omit<ServiceOrder, 'id'>) => Promise<boolean>;
  onUpdate: (id: number, so: Partial<ServiceOrder>) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

const ServiceOrders: React.FC<ServiceOrdersProps> = ({
  serviceOrders,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isAddingSO, setIsAddingSO] = React.useState(false);
  const [editingSO, setEditingSO] = React.useState<ServiceOrder | null>(null);

  const handleEditSO = (so: ServiceOrder) => {
    setEditingSO(so);
    setIsAddingSO(true);
  };

  const handleDeleteSO = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
      await onDelete(id);
    }
  };

  const generateSOPrint = (so: ServiceOrder) => {
    console.log('Print SO', so);
  };

  const sendSOWhatsApp = (so: ServiceOrder) => {
    console.log('Send WhatsApp for SO', so);
  };

  const filteredOrders = serviceOrders.filter(so => {
    const matchesSearch = 
      so.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || so.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'in_progress': return 'text-primary bg-primary/10 border-primary/20';
      case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'delivered': return 'text-slate-400 bg-white/5 border-white/10';
      case 'cancelled': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-white/5 border-white/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Reparo';
      case 'completed': return 'Pronto';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Ordens de Serviço</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Gerencie reparos, prazos e orçamentos técnicos</p>
        </div>
        <button 
          onClick={() => setIsAddingSO(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 h-12"
        >
          <Plus size={20} />
          Nova OS
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text"
            placeholder="Buscar por cliente, modelo ou Nº da OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {['all', 'pending', 'in_progress', 'completed', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 h-12 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                statusFilter === status 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white/5 text-slate-500 border-white/10 hover:bg-white/10"
              )}
            >
              {status === 'all' ? 'Todas' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((so) => (
          <motion.div 
            key={so.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card group overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    getStatusColor(so.status)
                  )}>
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">OS #{so.id.toString().padStart(4, '0')}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      {format(parseISO(so.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border",
                  getStatusColor(so.status)
                )}>
                  {getStatusLabel(so.status)}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold truncate">{so.customerName}</p>
                <p className="text-xs text-slate-400 font-medium">{so.deviceModel} • {so.deviceBrand}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Defeito Relatado</p>
                <p className="text-xs text-slate-300 line-clamp-2 italic">"{so.reportedDefect}"</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Previsão</p>
                  <p className="text-xs font-bold text-slate-300">
                    {so.estimatedDate ? format(parseISO(so.estimatedDate), 'dd/MM/yyyy') : 'Não definida'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor Total</p>
                  <p className="text-lg font-black text-primary">{formatCurrency(so.totalValue)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <button 
                    onClick={() => generateSOPrint(so)}
                    className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                    title="Imprimir OS"
                  >
                    <Printer size={16} />
                  </button>
                  <button 
                    onClick={() => sendSOWhatsApp(so)}
                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditSO(so)}
                    className="p-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteSO(so.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500 italic">
            Nenhuma ordem de serviço encontrada.
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceOrders;
