import React, { useState, useRef, useEffect } from 'react';
import { Search, User, X, Check } from 'lucide-react';
import { Customer } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerSearchSelectProps {
  customers: Customer[];
  selectedId: number;
  onSelect: (id: number) => void;
  placeholder?: string;
  className?: string;
}

export function CustomerSearchSelect({ 
  customers = [], 
  selectedId, 
  onSelect, 
  placeholder = "Selecionar Cliente",
  className
}: CustomerSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCustomer = (customers || []).find(c => c.id === selectedId);

  const filteredCustomers = (customers || []).filter(c => {
    const search = searchTerm.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(search) ||
      c.lastName.toLowerCase().includes(search) ||
      (c.nickname && c.nickname.toLowerCase().includes(search)) ||
      (c.companyName && c.companyName.toLowerCase().includes(search))
    );
  }).sort((a, b) => a.firstName.localeCompare(b.firstName));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 flex items-center justify-between cursor-pointer transition-all hover:bg-white/10",
          isOpen && "ring-2 ring-primary border-primary"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <User size={18} className={selectedCustomer ? "text-primary" : "text-slate-500"} />
          <span className={cn(
            "text-sm font-bold truncate",
            selectedCustomer ? "text-slate-200" : "text-slate-500"
          )}>
            {selectedCustomer 
              ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}${selectedCustomer.nickname ? ` (${selectedCustomer.nickname})` : ''}`
              : placeholder
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedId !== 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(0);
                setSearchTerm('');
              }}
              className="p-1 hover:bg-white/10 rounded-full text-slate-500 hover:text-rose-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <div className={cn(
            "w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-500 transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 z-[100] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-80"
          >
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por nome, apelido ou empresa..."
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-xs font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200"
                />
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <div 
                    key={customer.id}
                    onClick={() => {
                      onSelect(customer.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={cn(
                      "p-3 px-4 hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between group",
                      selectedId === customer.id && "bg-primary/10"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-sm font-bold",
                        selectedId === customer.id ? "text-primary" : "text-slate-200"
                      )}>
                        {customer.firstName} {customer.lastName}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {customer.nickname && (
                          <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                            {customer.nickname}
                          </span>
                        )}
                        {customer.companyName && (
                          <span className="text-[10px] text-primary/60 italic truncate max-w-[150px]">
                            {customer.companyName}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedId === customer.id && (
                      <Check size={16} className="text-primary" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-xs text-slate-500 font-medium">Nenhum cliente encontrado.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
