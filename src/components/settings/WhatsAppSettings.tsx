import React from 'react';
import { AppSettings } from '../../types';
import { MessageCircle, Info } from 'lucide-react';

interface WhatsAppSettingsProps {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

export const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = ({ settings, updateSettings }) => {
  const billingVariables = [
    { key: '{nome_cliente}', description: 'Primeiro nome do cliente' },
    { key: '{nome_completo}', description: 'Nome completo do cliente' },
    { key: '{valor_divida}', description: 'Valor total da dívida formatado (R$)' },
    { key: '{apelido}', description: 'Apelido do cliente (se houver)' },
    { key: '{empresa}', description: 'Nome da sua empresa' },
  ];

  const osVariables = [
    { key: '{nome_cliente}', description: 'Primeiro nome do cliente' },
    { key: '{os_id}', description: 'ID da Ordem de Serviço' },
    { key: '{equipamento}', description: 'Tipo + Marca + Modelo' },
    { key: '{status}', description: 'Status atual da OS' },
    { key: '{valor_total}', description: 'Valor total da OS (R$)' },
    { key: '{problema}', description: 'Problema relatado' },
    { key: '{empresa}', description: 'Nome da sua empresa' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
          <MessageCircle size={24} />
        </div>
        <div>
          <h4 className="text-xl font-bold">Configurações de WhatsApp</h4>
          <p className="text-xs text-slate-500 font-medium">Personalize as mensagens automáticas enviadas aos seus clientes</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Template de Cobrança */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 ml-1">Mensagem de Cobrança</label>
            <textarea 
              value={settings.whatsappBillingTemplate || ''}
              onChange={(e) => updateSettings({...settings, whatsappBillingTemplate: e.target.value})}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all"
              placeholder="Digite sua mensagem de cobrança aqui..."
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {billingVariables.map(v => (
                <button
                  key={v.key}
                  onClick={() => {
                    const current = settings.whatsappBillingTemplate || '';
                    updateSettings({...settings, whatsappBillingTemplate: current + ' ' + v.key});
                  }}
                  className="p-2 bg-black/20 border border-white/5 rounded-xl hover:border-primary/30 transition-all text-[10px] text-slate-400 font-bold"
                >
                  {v.key}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template de Ordem de Serviço */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Mensagem de Ordem de Serviço</label>
            <textarea 
              value={settings.whatsappOSTemplate || ''}
              onChange={(e) => updateSettings({...settings, whatsappOSTemplate: e.target.value})}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none resize-none transition-all"
              placeholder="Digite sua mensagem de OS aqui..."
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {osVariables.map(v => (
                <button
                  key={v.key}
                  onClick={() => {
                    const current = settings.whatsappOSTemplate || '';
                    updateSettings({...settings, whatsappOSTemplate: current + ' ' + v.key});
                  }}
                  className="p-2 bg-black/20 border border-white/5 rounded-xl hover:border-primary/30 transition-all text-[10px] text-slate-400 font-bold"
                >
                  {v.key}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic ml-1">Esta frase será usada quando você atualizar o status de uma OS ou clicar no botão de enviar status via WhatsApp.</p>
          </div>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
          <h5 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Dica de Uso</h5>
          <p className="text-xs text-slate-400 leading-relaxed">
            As variáveis entre chaves (ex: <code className="text-primary">{'{nome_cliente}'}</code>) serão substituídas automaticamente pelos dados reais no momento do envio. Você poderá revisar a mensagem antes de abrir o WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
};
