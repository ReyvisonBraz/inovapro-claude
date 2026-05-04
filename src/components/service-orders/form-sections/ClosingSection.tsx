import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { ServiceOrderFormData } from '../../../schemas/serviceOrderSchema';
import { ServiceOrder } from '../../../types';

interface ClosingSectionProps {
  editingOrder: ServiceOrder | null;
  setShowQRCodeModal: (show: boolean) => void;
}

export const ClosingSection: React.FC<ClosingSectionProps> = ({
  editingOrder,
  setShowQRCodeModal
}) => {
  const { register } = useFormContext<ServiceOrderFormData>();

  if (!editingOrder) return null;

  return (
    <div className="space-y-6 pt-6 border-t border-white/5">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-1 w-8 bg-emerald-500 rounded-full" />
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Fechamento e Valores</h4>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-emerald-500 ml-1">Serviços Realizados</label>
        <textarea 
          {...register('servicesPerformed')}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] text-white placeholder:text-slate-500 resize-none transition-all"
          placeholder="Descreva o que foi feito no equipamento..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Mão de Obra (R$)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
            <input 
              type="number"
              step="0.01"
              {...register('serviceFee', { valueAsNumber: true })}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Valor Total (R$)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
            <input 
              type="number"
              step="0.01"
              {...register('totalAmount', { valueAsNumber: true })}
              className="w-full h-14 bg-primary/10 border border-primary/20 rounded-2xl pl-12 pr-4 text-sm font-black text-primary focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center bg-primary/5 p-6 rounded-3xl border border-primary/20 shadow-inner">
        <div className="bg-white p-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowQRCodeModal(true)}>
          <QRCodeSVG 
            value={`${window.location.origin}/?osId=${editingOrder.id}`}
            size={140}
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
            <QrCode size={16} className="text-primary" />
            <h5 className="text-sm font-black text-white uppercase tracking-widest">QR Code de Acompanhamento</h5>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">Este código permite que o cliente ou técnico acesse esta OS rapidamente via celular. Clique no QR Code para ampliar.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Observações Finais</label>
        <textarea 
          {...register('finalObservations')}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none min-h-[80px] resize-none transition-all"
          placeholder="Garantia, recomendações, etc..."
        />
      </div>
    </div>
  );
};
