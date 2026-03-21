import React, { useRef } from 'react';
import { AppSettings } from '../../types';
import { cn } from '../../lib/utils';
import { ImageIcon, Upload, Trash2 } from 'lucide-react';

interface PrintLayoutProps {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ settings, updateSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrCodeInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ ...settings, receiptLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ ...settings, receiptQrCode: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

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
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Logo do Recibo</label>
          <div className="flex items-center gap-4">
            {settings.receiptLogo ? (
              <div className="relative group w-24 h-24 rounded-xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                <img src={settings.receiptLogo} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => updateSettings({...settings, receiptLogo: ''})}
                    className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    title="Remover Logo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-slate-500 gap-2 shrink-0">
                <ImageIcon size={24} />
                <span className="text-[10px] uppercase font-bold">Sem Logo</span>
              </div>
            )}
            
            <div className="flex-1 space-y-2">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleLogoUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all text-slate-300"
              >
                <Upload size={16} />
                {settings.receiptLogo ? 'Trocar Logo' : 'Fazer Upload da Logo'}
              </button>
              <p className="text-[10px] text-slate-500 font-medium">
                Recomendado: Imagem PNG com fundo transparente. Tamanho máximo: 2MB.
              </p>
            </div>
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
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">QR Code (Opcional)</label>
          <div className="flex items-center gap-4">
            {settings.receiptQrCode ? (
              <div className="relative group w-24 h-24 rounded-xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                <img src={settings.receiptQrCode} alt="QR Code" className="max-w-full max-h-full object-contain p-2" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => updateSettings({...settings, receiptQrCode: ''})}
                    className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    title="Remover QR Code"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-slate-500 gap-2 shrink-0">
                <ImageIcon size={24} />
                <span className="text-[10px] uppercase font-bold text-center">Sem<br/>QR Code</span>
              </div>
            )}
            
            <div className="flex-1 space-y-2">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={qrCodeInputRef}
                onChange={handleQrCodeUpload}
              />
              <button 
                onClick={() => qrCodeInputRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all text-slate-300"
              >
                <Upload size={16} />
                {settings.receiptQrCode ? 'Trocar QR Code' : 'Fazer Upload do QR Code'}
              </button>
              <p className="text-[10px] text-slate-500 font-medium">
                Recomendado: Imagem quadrada (ex: PIX). Tamanho máximo: 2MB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
