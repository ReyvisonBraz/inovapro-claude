import React, { useState } from 'react';
import { RefreshCw, Github, Download, Bug } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../ui/Toast';
import { logger } from '../../lib/logger';

export const SystemUpdate: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{type: 'idle' | 'checking' | 'updating' | 'success' | 'error', message: string}>({
    type: 'idle',
    message: 'Use a verificação para consultar a versão publicada.'
  });
  const { showToast } = useToast();

  const handleCheckUpdate = async () => {
    setUpdateStatus({ type: 'checking', message: 'Consultando a versão publicada...' });
    setIsUpdating(true);
    
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (!registration) throw new Error('Atualização automática não está disponível neste navegador.');
      await registration.update();
      setUpdateStatus({ type: 'success', message: 'Verificação concluída. Se houver uma nova versão, o aviso para atualizar aparecerá na tela.' });
      showToast('Verificação de atualização concluída.', 'success');
      setIsUpdating(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao verificar a versão publicada.';
      setUpdateStatus({ type: 'error', message });
      setIsUpdating(false);
      showToast('Não foi possível verificar atualizações.', 'error');
    }
  };

  const handleDownloadLogs = () => {
    logger.downloadLogs();
    showToast('Logs baixados com sucesso!', 'success');
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Github size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white tracking-tight">Atualização do Sistema</h4>
            <p className="text-sm text-slate-400">Consulte o service worker para detectar uma versão já publicada.</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Status Atual</span>
                {updateStatus.type === 'success' && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Atualizado</span>}
                {updateStatus.type === 'error' && <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">Erro</span>}
                {updateStatus.type === 'updating' && <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">Baixando...</span>}
              </div>
              <p className={cn(
                "text-sm font-medium",
                updateStatus.type === 'error' ? "text-rose-400" :
                updateStatus.type === 'success' ? "text-emerald-400" :
                updateStatus.type === 'checking' || updateStatus.type === 'updating' ? "text-blue-400" :
                "text-slate-300"
              )}>
                {updateStatus.message}
              </p>
            </div>

            <button 
              onClick={handleCheckUpdate}
              disabled={isUpdating}
              className={cn(
                "h-12 px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg whitespace-nowrap",
                isUpdating 
                  ? "bg-white/10 text-slate-400 cursor-not-allowed" 
                  : "bg-primary text-white shadow-primary/20 hover:scale-105"
              )}
            >
              <RefreshCw size={18} className={cn(isUpdating && "animate-spin")} />
              {isUpdating ? 'Verificando...' : 'Verificar Atualizações'}
            </button>
          </div>

        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Bug size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white tracking-tight">Diagnóstico e Logs</h4>
            <p className="text-sm text-slate-400">Exporte os logs do sistema para ajudar na correção de bugs e erros.</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mt-6 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleDownloadLogs}
            className="flex-1 h-12 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            <Download size={18} />
            Baixar Logs do Sistema
          </button>
        </div>
      </div>
    </div>
  );
};
