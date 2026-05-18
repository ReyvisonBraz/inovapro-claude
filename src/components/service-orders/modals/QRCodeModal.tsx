import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, ExternalLink, Printer } from 'lucide-react';
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
  const appUrl = window.location.origin;
  const osNumber = selectedOrder ? `#OS-${selectedOrder.id.toString().padStart(4, '0')}` : '';

  const customerUrl = `${appUrl}/rastreio?osId=${selectedOrder?.id}`;
  const techUrl = `${appUrl}/os/${selectedOrder?.id}`;

  const [copied, setCopied] = React.useState<'customer' | 'tech' | null>(null);

  const copyToClipboard = async (url: string, type: 'customer' | 'tech') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

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
            className="relative w-full max-w-sm glass-modal p-4 sm:p-6 md:p-8"
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl font-bold">QR Codes - ${osNumber}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-lg font-black text-white">{osNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-3 rounded-2xl text-center shadow-lg">
                <div className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-2">Cliente</div>
                <div className="inline-block bg-white">
                  <QRCodeSVG value={customerUrl} size={110} level="H" includeMargin={false} />
                </div>
                <p className="text-[9px] text-slate-500 mt-2">Acompanhar status</p>
              </div>
              <div className="bg-white p-3 rounded-2xl text-center shadow-lg">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Técnico</div>
                <div className="inline-block bg-white">
                  <QRCodeSVG value={techUrl} size={110} level="H" includeMargin={false} />
                </div>
                <p className="text-[9px] text-slate-500 mt-2">Abrir para editar</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-medium">
                Escaneie ou copie o link abaixo:
              </p>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-blue-500 uppercase">Cliente</div>
                  <div className="text-[11px] text-slate-300 truncate">{customerUrl}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(customerUrl, 'customer')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all shrink-0"
                  title="Copiar link do cliente"
                >
                  <Copy size={16} className={copied === 'customer' ? 'text-emerald-500' : 'text-slate-400'} />
                </button>
                <a
                  href={customerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-all shrink-0"
                  title="Abrir página do cliente"
                >
                  <ExternalLink size={16} className="text-slate-400" />
                </a>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Técnico</div>
                  <div className="text-[11px] text-slate-300 truncate">{techUrl}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(techUrl, 'tech')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all shrink-0"
                  title="Copiar link do técnico"
                >
                  <Copy size={16} className={copied === 'tech' ? 'text-emerald-500' : 'text-slate-400'} />
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Ações Rápidas</p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Cliente escaneia → vê status sem login
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  QR do cliente pode ser enviado por WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                  QR do técnico imprime como etiqueta no equipamento
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  Mudar status dispara WhatsApp automático
                </li>
              </ul>
            </div>

            <button 
              onClick={onClose}
              className="w-full h-12 bg-white/5 text-white rounded-2xl font-black mt-6 border border-white/10 hover:bg-white/10 transition-all"
            >
              Fechar
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
