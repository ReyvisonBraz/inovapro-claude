import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer } from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getA4EnhancedLayout, getA5Layout, getThermalLayout } from './printLayouts';
import { parseOSPrintTemplateConfig } from '../../../lib/osTemplateConfig';

interface PrintModalProps {
  show: boolean;
  onClose: () => void;
  selectedOrder: any;
  customers: any[];
  currentUser: any;
  osPrintConfig?: string;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  show,
  onClose,
  selectedOrder,
  customers,
  currentUser,
  osPrintConfig,
}) => {
  const [printConfig, setPrintConfig] = React.useState({ type: 'simplified', format: 'a4-enhanced' });
  const layoutConfigs = React.useMemo(() => parseOSPrintTemplateConfig(osPrintConfig), [osPrintConfig]);

  const handlePrint = () => {
    if (!selectedOrder) return;
    const customer = customers.find(c => c.id === selectedOrder.customerId);
    if (!customer) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const osNumber = `#OS-${selectedOrder.id.toString().padStart(4, '0')}`;
    const date = selectedOrder.entryDate || format(parseISO(selectedOrder.createdAt), 'dd/MM/yyyy');
    const dateFull = format(parseISO(selectedOrder.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const technician = currentUser?.name || 'Não informado';
    const appUrl = window.location.origin;
    const customerQrUrl = `${appUrl}/rastreio?osId=${selectedOrder.id}`;
    const techQrUrl = `${appUrl}/os/${selectedOrder.id}`;

    const customerQrImg = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(customerQrUrl)}`;
    const techQrImg = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(techQrUrl)}`;

    const hasEquipment = selectedOrder.equipmentType || selectedOrder.equipmentBrand || selectedOrder.equipmentModel;
    const equipmentDisplay = hasEquipment
      ? `${selectedOrder.equipmentType || ''} ${selectedOrder.equipmentBrand || ''} ${selectedOrder.equipmentModel || ''}`.trim()
      : 'Não informado';

    const isComplete = printConfig.type === 'complete';
    const layoutConfig =
      printConfig.format === 'thermal'    ? layoutConfigs.thermal :
      printConfig.format === 'a5'         ? layoutConfigs.a5 :
      isComplete                          ? layoutConfigs.a4Complete :
                                            layoutConfigs.a4Simplified;

    const printData = {
      osNumber, date, dateFull, technician,
      customer: { firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, cpf: customer.cpf },
      selectedOrder,
      equipmentDisplay,
      customerQrImg,
      techQrImg,
      printType: printConfig.type as 'simplified' | 'complete',
      formatCurrency,
      config: layoutConfig,
    };

    let content = '';
    if (printConfig.format === 'thermal') {
      content = getThermalLayout(printData);
    } else if (printConfig.format === 'a4-enhanced') {
      content = getA4EnhancedLayout(printData);
    } else if (printConfig.format === 'a5') {
      content = getA5Layout(printData);
    }

    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      {show && selectedOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4">
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
            className="relative w-full max-w-md max-h-[96dvh] overflow-y-auto glass-modal p-4 sm:p-8 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Imprimir Ordem</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo de Ordem</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPrintConfig({ ...printConfig, type: 'simplified' })}
                    className={cn(
                      "h-12 rounded-xl border font-bold text-xs transition-all",
                      printConfig.type === 'simplified' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    Simplificada
                  </button>
                  <button
                    onClick={() => setPrintConfig({ ...printConfig, type: 'complete' })}
                    className={cn(
                      "h-12 rounded-xl border font-bold text-xs transition-all",
                      printConfig.type === 'complete' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    Completa
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Formato de Impressão</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPrintConfig({ ...printConfig, format: 'a4-enhanced' })}
                    className={cn(
                      "h-14 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center",
                      printConfig.format === 'a4-enhanced' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    <span>A4</span>
                    <span className="text-[9px] font-normal opacity-70">Aprimorado</span>
                  </button>
                  <button
                    onClick={() => setPrintConfig({ ...printConfig, format: 'a5' })}
                    className={cn(
                      "h-14 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center",
                      printConfig.format === 'a5' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    <span>A5</span>
                    <span className="text-[9px] font-normal opacity-70">Compacto</span>
                  </button>
                  <button
                    onClick={() => setPrintConfig({ ...printConfig, format: 'thermal' })}
                    className={cn(
                      "h-14 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center",
                      printConfig.format === 'thermal' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    <span>80mm</span>
                    <span className="text-[9px] font-normal opacity-70">Térmica</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  handlePrint();
                  onClose();
                }}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 group"
              >
                <Printer size={24} className="group-hover:scale-110 transition-transform" />
                Imprimir Agora
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
