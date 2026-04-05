import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';
import { format, parseISO } from 'date-fns';

interface WhatsAppModalProps {
  show: boolean;
  onClose: () => void;
  selectedOrder: any;
  customers: any[];
  settings: any;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  show,
  onClose,
  selectedOrder,
  customers,
  settings,
  showToast
}) => {
  const [whatsappConfig, setWhatsappConfig] = React.useState<{ type: 'simplified' | 'complete' }>({ type: 'simplified' });
  const [whatsappMessage, setWhatsappMessage] = React.useState('');

  const generateWhatsAppMessage = (order: any, type: 'simplified' | 'complete') => {
    const customer = customers.find(c => c.id === order.customerId);
    if (!customer) return '';

    const osNumber = `#OS-${order.id.toString().padStart(4, '0')}`;
    const equipment = `${order.equipmentType || ''} ${order.equipmentBrand || ''} ${order.equipmentModel || ''}`.trim();
    
    let template = settings.whatsappOSTemplate || '';
    
    if (!template) {
      let message = `*ORDEM DE SERVIÇO ${osNumber}*\n\n`;
      message += `*Cliente:* ${customer.firstName} ${customer.lastName}\n`;
      message += `*Equipamento:* ${equipment}\n`;
      message += `*Status:* ${order.status}\n`;

      if (type === 'complete') {
        message += `*Data de Entrada:* ${order.entryDate || format(parseISO(order.createdAt), 'dd/MM/yyyy')}\n`;
        if (order.reportedProblem) message += `*Problema:* ${order.reportedProblem}\n`;
        if (order.technicalAnalysis) message += `*Análise:* ${order.technicalAnalysis}\n`;
        if (order.servicesPerformed) message += `*Serviços:* ${order.servicesPerformed}\n`;
        if (order.partsUsed && order.partsUsed.length > 0) {
          message += `\n*Peças:*\n`;
          order.partsUsed.forEach((p: any) => {
            message += `- ${p.name} (${p.quantity}x ${formatCurrency(p.unitPrice)})\n`;
          });
        }
        message += `\n*Total:* ${formatCurrency(order.totalAmount || 0)}\n`;
      } else {
        message += `\nPara mais informações, entre em contato conosco.`;
      }
      return message;
    }

    // Replace variables in template
    let message = template
      .replace(/{nome_cliente}/g, customer.firstName)
      .replace(/{os_id}/g, osNumber)
      .replace(/{equipamento}/g, equipment)
      .replace(/{status}/g, order.status)
      .replace(/{valor_total}/g, formatCurrency(order.totalAmount || 0))
      .replace(/{problema}/g, order.reportedProblem || 'N/A')
      .replace(/{empresa}/g, settings.profileName || 'Nossa Empresa');

    if (type === 'complete') {
      message += `\n\n*Detalhes da OS:*\n`;
      if (order.technicalAnalysis) message += `*Análise:* ${order.technicalAnalysis}\n`;
      if (order.servicesPerformed) message += `*Serviços:* ${order.servicesPerformed}\n`;
      if (order.partsUsed && order.partsUsed.length > 0) {
        message += `\n*Peças:*\n`;
        order.partsUsed.forEach((p: any) => {
          message += `- ${p.name} (${p.quantity}x ${formatCurrency(p.unitPrice)})\n`;
        });
      }
    }

    return message;
  };

  const handleSendWhatsApp = () => {
    if (!selectedOrder) return;
    const customer = customers.find(c => c.id === selectedOrder.customerId);
    if (customer?.phone) {
      const message = whatsappMessage;
      let phone = customer.phone.replace(/\D/g, '');
      if (phone.length === 10 || phone.length === 11) {
        phone = '55' + phone;
      }

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      onClose();
    } else {
      showToast('Cliente sem telefone cadastrado ou inválido.', 'warning');
    }
  };

  React.useEffect(() => {
    if (selectedOrder && show) {
      setWhatsappMessage(generateWhatsAppMessage(selectedOrder, whatsappConfig.type));
    }
  }, [selectedOrder, whatsappConfig.type, show]);

  return (
    <AnimatePresence>
      {show && selectedOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
            className="relative w-full max-w-lg glass-modal p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-xl font-bold">Enviar via WhatsApp</h3>
              </div>
              <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-2">Selecione o Formato</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setWhatsappConfig({ ...whatsappConfig, type: 'simplified' })}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-left group",
                      whatsappConfig.type === 'simplified' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    <p className="font-bold text-xs">Resumida</p>
                  </button>
                  <button 
                    onClick={() => setWhatsappConfig({ ...whatsappConfig, type: 'complete' })}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-left group",
                      whatsappConfig.type === 'complete' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    <p className="font-bold text-xs">Completa</p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Personalizar Mensagem</label>
                <textarea 
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all"
                  placeholder="Sua mensagem..."
                />
              </div>

              <button 
                onClick={handleSendWhatsApp}
                className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 group"
              >
                <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Enviar para WhatsApp
              </button>
              
              <p className="text-[10px] text-center text-slate-500 font-medium">
                O cliente receberá um link direto para acompanhar a OS em tempo real.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
