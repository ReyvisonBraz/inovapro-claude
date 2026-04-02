import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
  show: boolean;
  onClose: () => void;
  selectedOrder: any;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  show,
  onClose,
  selectedOrder
}) => {
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
            className="relative w-full max-w-sm glass-modal p-4 sm:p-6 md:p-8 text-center"
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl font-bold">QR Code da OS</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl inline-block mb-6 shadow-2xl">
              <QRCodeSVG 
                value={`${window.location.origin}/?osId=${selectedOrder.id}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-lg font-black text-white">#OS-{selectedOrder.id.toString().padStart(4, '0')}</p>
              <p className="text-sm text-slate-400">Escaneie para acessar os detalhes, fotos e status desta ordem de serviço em tempo real.</p>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-left">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Dica do Técnico</p>
              <p className="text-xs text-slate-400">Você pode imprimir este QR Code na etiqueta térmica para colar no equipamento do cliente.</p>
            </div>

            <button 
              onClick={onClose}
              className="w-full h-14 bg-white/5 text-white rounded-2xl font-black mt-8 border border-white/10 hover:bg-white/10 transition-all"
            >
              Fechar
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
