import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ServiceOrder, ServiceOrderStatus } from '../../../types';

interface ServiceOrderStatusModalProps {
  showStatusOnly: ServiceOrder | null;
  setShowStatusOnly: (order: ServiceOrder | null) => void;
  statuses: ServiceOrderStatus[];
}

export const ServiceOrderStatusModal: React.FC<ServiceOrderStatusModalProps> = ({
  showStatusOnly,
  setShowStatusOnly,
  statuses
}) => {
  return (
    <AnimatePresence>
      {showStatusOnly && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg glass-modal p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary animate-gradient-x" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Status da Ordem</h3>
                <p className="text-slate-500 font-medium">OS #{showStatusOnly.id.toString().padStart(4, '0')}</p>
              </div>
              <button 
                onClick={() => setShowStatusOnly(null)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Status Atual</div>
                <div 
                  className="px-6 py-3 rounded-2xl text-lg font-black shadow-lg"
                  style={{ 
                    backgroundColor: `${statuses.find(s => s.name === showStatusOnly.status)?.color || '#3b82f6'}20`,
                    color: statuses.find(s => s.name === showStatusOnly.status)?.color || '#3b82f6',
                    border: `1px solid ${statuses.find(s => s.name === showStatusOnly.status)?.color || '#3b82f6'}40`
                  }}
                >
                  {showStatusOnly.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Equipamento</div>
                  <div className="text-sm font-bold text-white">{showStatusOnly.equipmentBrand} {showStatusOnly.equipmentModel}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Cor</div>
                  <div className="text-sm font-bold text-white">{showStatusOnly.equipmentColor || 'Não informada'}</div>
                </div>
              </div>

              {showStatusOnly.analysisPrediction && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-primary/60">Previsão de Entrega</div>
                    <div className="text-sm font-bold text-white">{format(parseISO(showStatusOnly.analysisPrediction), 'dd/MM/yyyy')}</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/10" />
                  Histórico de Fotos
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {showStatusOnly.arrivalPhotoBase64 ? (
                    <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                      <img src={showStatusOnly.arrivalPhotoBase64} alt="Foto de Entrada" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="col-span-3 py-8 text-center text-slate-600 text-xs font-medium italic">
                      Nenhuma foto anexada ainda.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowStatusOnly(null)}
              className="w-full h-14 mt-8 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
            >
              Fechar
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
