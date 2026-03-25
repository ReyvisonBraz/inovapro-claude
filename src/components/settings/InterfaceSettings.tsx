import React from 'react';
import { AppSettings } from '../../types';
import { cn } from '../../lib/utils';
import { Wallet, Calendar, Tag, User, ImageIcon } from 'lucide-react';

interface InterfaceSettingsProps {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

export const InterfaceSettings: React.FC<InterfaceSettingsProps> = ({ settings, updateSettings }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h4 className="text-xl font-bold">Interface do Sistema</h4>
          <p className="text-xs text-slate-500 font-medium">Personalize a identidade e o comportamento do seu dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome do Sistema</label>
          <div className="relative">
            <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={settings.appName}
              onChange={(e) => updateSettings({...settings, appName: e.target.value})}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Saldo Inicial da Conta</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
            <input 
              type="number"
              value={settings.initialBalance}
              onChange={(e) => updateSettings({...settings, initialBalance: parseFloat(e.target.value) || 0})}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ano Fiscal</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={settings.fiscalYear}
              onChange={(e) => updateSettings({...settings, fiscalYear: e.target.value})}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Senha de Acesso (Configurações)</label>
          <div className="relative">
            <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              value={settings.settingsPassword}
              onChange={(e) => updateSettings({...settings, settingsPassword: e.target.value})}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Preferências de Exibição</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={settings.showWarnings}
                onChange={(e) => updateSettings({ ...settings, showWarnings: e.target.checked })}
                className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 text-primary focus:ring-primary outline-none transition-all"
              />
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-widest">Exibir avisos de campos incompletos</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={settings.showPostCustomerActionPrompt !== false}
                onChange={(e) => updateSettings({ ...settings, showPostCustomerActionPrompt: e.target.checked })}
                className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 text-primary focus:ring-primary outline-none transition-all"
              />
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-widest">Ações rápidas após cadastro de cliente</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={settings.showWhatsAppPrompt !== false}
                onChange={(e) => updateSettings({ ...settings, showWhatsAppPrompt: e.target.checked })}
                className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 text-primary focus:ring-primary outline-none transition-all"
              />
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-widest">Sugerir envio de WhatsApp ao salvar OS</span>
            </label>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Colunas Ocultas (Transações)</label>
          <div className="flex flex-wrap gap-2">
            {['Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'].map(col => (
              <button
                key={col}
                onClick={() => {
                  const newHidden = settings.hiddenColumns.includes(col)
                    ? settings.hiddenColumns.filter(c => c !== col)
                    : [...settings.hiddenColumns, col];
                  updateSettings({ ...settings, hiddenColumns: newHidden });
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                  settings.hiddenColumns.includes(col) 
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                    : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                )}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome do Perfil</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={settings.profileName}
              onChange={(e) => updateSettings({...settings, profileName: e.target.value})}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">URL do Avatar</label>
          <div className="relative">
            <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={settings.profileAvatar}
              onChange={(e) => updateSettings({...settings, profileAvatar: e.target.value})}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cor Primária</label>
          <div className="flex gap-4">
            <input 
              type="color"
              value={settings.primaryColor}
              onChange={(e) => updateSettings({...settings, primaryColor: e.target.value})}
              className="h-12 w-20 bg-white/5 border border-white/10 rounded-xl p-1 cursor-pointer"
            />
            <div className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 text-xs font-mono text-slate-400">
              {settings.primaryColor}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Telegram Bot Token (Feedback Testers)</label>
          <div className="relative">
            <input 
              value={settings.telegramBotToken || ''}
              onChange={(e) => updateSettings({...settings, telegramBotToken: e.target.value})}
              placeholder="Ex: 123456789:ABCdefg..."
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Telegram Chat ID (Feedback Testers)</label>
          <div className="relative">
            <input 
              value={settings.telegramChatId || ''}
              onChange={(e) => updateSettings({...settings, telegramChatId: e.target.value})}
              placeholder="Ex: -10012345678"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
