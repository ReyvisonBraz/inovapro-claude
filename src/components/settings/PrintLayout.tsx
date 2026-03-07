import React from 'react';
import { AppSettings } from '../../types';
import { cn } from '../../lib/utils';
import { ImageIcon } from 'lucide-react';

interface PrintLayoutProps {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ settings, updateSettings }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h4 className="text-xl font-bold">Layout de Impressão</h4>
          <p className="text-xs text-slate-500 font-medium">Configure como seus recibos serão gerados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Layout do Recibo</label>
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <button 
              onClick={() => updateSettings({...settings, receiptLayout: 'simple'})}
              className={cn(
                "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                settings.receiptLayout === 'simple' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Simples (Térmico)
            </button>
            <button 
              onClick={() => updateSettings({...settings, receiptLayout: 'a4'})}
              className={cn(
                "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                settings.receiptLayout === 'a4' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Completo (A4)
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">URL da Logo (Recibo)</label>
          <div className="relative">
            <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={settings.receiptLogo || ''}
              onChange={(e) => updateSettings({...settings, receiptLogo: e.target.value})}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="https://exemplo.com/logo.png"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CNPJ / CPF</label>
          <input 
            value={settings.receiptCnpj || ''}
            onChange={(e) => updateSettings({...settings, receiptCnpj: e.target.value})}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="00.000.000/0000-00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Endereço Completo</label>
          <input 
            value={settings.receiptAddress || ''}
            onChange={(e) => updateSettings({...settings, receiptAddress: e.target.value})}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Rua Exemplo, 123 - Cidade/UF"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chave PIX</label>
          <input 
            value={settings.receiptPixKey || ''}
            onChange={(e) => updateSettings({...settings, receiptPixKey: e.target.value})}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Chave PIX (CPF, Email, etc)"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">URL QR Code (Opcional)</label>
          <input 
            value={settings.receiptQrCode || ''}
            onChange={(e) => updateSettings({...settings, receiptQrCode: e.target.value})}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="URL da imagem do QR Code"
          />
        </div>
      </div>
    </div>
  );
};
