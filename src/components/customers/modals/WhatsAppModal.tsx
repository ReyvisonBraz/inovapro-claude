import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Send } from 'lucide-react';
import { Customer, AppSettings } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  debt: number;
  settings: AppSettings;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  customer,
  debt,
  settings
}) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const template = settings.whatsappBillingTemplate || 'Olá {nome_cliente}, gostaríamos de lembrar sobre o débito pendente de {valor_divida}. Podemos ajudar com algo?';
      
      const processed = template
        .replace(/{nome_cliente}/g, customer.firstName)
        .replace(/{nome_completo}/g, `${customer.firstName} ${customer.lastName}`)
        .replace(/{valor_divida}/g, formatCurrency(debt))
        .replace(/{apelido}/g, customer.nickname || customer.firstName)
        .replace(/{empresa}/g, settings.appName || 'Nossa Empresa');
      
      setMessage(processed);
    }
  }, [isOpen, customer, debt, settings]);

  const handleSend = () => {
    const phone = customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-modal p-6 md:p-8 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Enviar Cobrança</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">WhatsApp: {customer.phone}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 ml-1">Personalizar Mensagem</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all"
                  placeholder="Digite a mensagem..."
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSend}
                  className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Enviar Agora
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
