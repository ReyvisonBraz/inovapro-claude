import React from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, Search, Plus, Filter, Calendar, 
  TrendingUp, TrendingDown, Clock, CheckCircle2, 
  MoreVertical, Edit2, Trash2, Printer, MessageSquare, 
  Download, FileText, Users 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn, formatCurrency } from '../../lib/utils';
import { ClientPayment, Customer } from '../../types';

interface ClientPaymentsProps {
  clientPayments: ClientPayment[];
  customers: Customer[];
  onAdd: (payment: Omit<ClientPayment, 'id'>) => Promise<boolean>;
  onUpdate: (id: number, payment: Partial<ClientPayment>) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

const ClientPayments: React.FC<ClientPaymentsProps> = ({
  clientPayments,
  customers,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddingClientPayment, setIsAddingClientPayment] = React.useState(false);

  const handleRecordPayment = (payment: ClientPayment) => {
    // Implement record payment logic
    console.log('Record payment', payment);
  };

  const generateReceipt = (payment: ClientPayment) => {
    console.log('Generate receipt for', payment);
  };

  const sendWhatsAppReminder = (payment: ClientPayment) => {
    const customer = customers.find(c => c.id === payment.customerId);
    if (customer) {
      const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const filteredPayments = clientPayments.filter(p => {
    const customer = customers.find(c => c.id === p.customerId);
    const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
    return (
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
        <div className="relative w-full lg:max-w-md">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
          <input 
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
            placeholder="Pesquisar pagamentos ou clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => setIsAddingClientPayment(true)}
          className="flex items-center gap-2 px-8 h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full lg:w-auto"
        >
          <Plus size={18} />
          Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredPayments.map((payment) => {
          const customer = customers.find(c => c.id === payment.customerId);
          const balance = payment.totalAmount - payment.paidAmount;
          const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

          return (
            <motion.div 
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card group overflow-hidden"
            >
              <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                    payment.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {payment.status === 'paid' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold">{payment.description}</h4>
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                        payment.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {payment.status === 'paid' ? 'Pago' : payment.status === 'partial' ? 'Parcial' : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                      <Users size={14} className="text-primary" />
                      {customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente não encontrado'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1 lg:flex-none">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Valor Total</p>
                    <p className="text-sm font-black">{formatCurrency(payment.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Valor Pago</p>
                    <p className="text-sm font-black text-emerald-500">{formatCurrency(payment.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Saldo</p>
                    <p className={cn("text-sm font-black", balance > 0 ? "text-rose-500" : "text-emerald-500")}>
                      {formatCurrency(balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Vencimento</p>
                    <p className={cn("text-sm font-black", isOverdue ? "text-rose-500" : "text-slate-300")}>
                      {format(parseISO(payment.dueDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto">
                  {payment.status !== 'paid' && (
                    <button 
                      onClick={() => handleRecordPayment(payment)}
                      className="flex-1 lg:flex-none px-6 h-12 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                      Receber
                    </button>
                  )}
                  <button 
                    onClick={() => generateReceipt(payment)}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Imprimir Recibo"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => sendWhatsAppReminder(payment)}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                    title="Enviar Lembrete"
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredPayments.length === 0 && (
          <div className="py-20 text-center">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <CreditCard size={64} />
              <p className="text-lg font-bold uppercase tracking-widest">Nenhum pagamento encontrado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPayments;
