import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Search, Plus, User, Phone, FileText, 
  CreditCard, Edit, Trash2, Printer, MessageSquare 
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Customer } from '../../types';

interface CustomersProps {
  customers: Customer[];
  onAdd: (customer: Omit<Customer, 'id'>) => Promise<boolean>;
  onUpdate: (id: number, customer: Partial<Customer>) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

const Customers: React.FC<CustomersProps> = ({
  customers,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddingCustomer, setIsAddingCustomer] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsAddingCustomer(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${customer.firstName}?`)) {
      await onDelete(customer.id);
    }
  };

  const printCustomerStatement = (customer: Customer) => {
    console.log('Print statement for', customer);
  };

  const filteredCustomers = customers.filter(c => 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
        <div className="relative w-full lg:max-w-md">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
          <input 
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
            placeholder="Pesquisar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => setIsAddingCustomer(true)}
          className="flex items-center gap-2 px-8 h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full lg:w-auto"
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <motion.div 
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card group overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{customer.firstName} {customer.lastName}</h4>
                    {customer.nickname && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {customer.nickname}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEditCustomer(customer)}
                    className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCustomer(customer)}
                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                    <Phone size={10} /> Telefone
                  </p>
                  <p className="text-xs font-bold">{customer.phone}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                    <CreditCard size={10} /> Limite
                  </p>
                  <p className="text-xs font-bold text-emerald-500">{formatCurrency(customer.creditLimit)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <button 
                  onClick={() => printCustomerStatement(customer)}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  title="Imprimir Extrato"
                >
                  <Printer size={16} /> Extrato
                </button>
                <button 
                  onClick={() => {
                    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                  title="WhatsApp"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <Users size={64} />
              <p className="text-lg font-bold uppercase tracking-widest">Nenhum cliente encontrado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
