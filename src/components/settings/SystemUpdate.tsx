import React, { useState } from 'react';
import { RefreshCw, Github, Download, Bug } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../ui/Toast';
import { logger } from '../../lib/logger';

export const SystemUpdate: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{type: 'idle' | 'checking' | 'updating' | 'success' | 'error', message: string}>({
    type: 'idle',
    message: 'Sistema atualizado. Nenhuma ação necessária no momento.'
  });
  const { showToast } = useToast();

  const handleCheckUpdate = async () => {
    setUpdateStatus({ type: 'checking', message: 'Verificando atualizações no GitHub...' });
    setIsUpdating(true);
    
    try {
      // Aqui você pode conectar com seu backend que fará o "git pull"
      // Exemplo: await fetch('/api/system/update', { method: 'POST' });
      
      setTimeout(() => {
        setUpdateStatus({ type: 'updating', message: 'Baixando nova versão e aplicando (git pull)...' });
        
        setTimeout(() => {
          setUpdateStatus({ type: 'success', message: 'Sistema atualizado com sucesso! Recarregando...' });
          showToast('Sistema atualizado com sucesso!', 'success');
          
          setTimeout(() => {
            setIsUpdating(false);
            window.location.reload();
          }, 3000);
        }, 2500);
      }, 1500);
    } catch (error) {
      setUpdateStatus({ type: 'error', message: 'Erro ao tentar atualizar o sistema.' });
      setIsUpdating(false);
      showToast('Erro ao atualizar', 'error');
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
            <p className="text-sm text-slate-400">Sincronize com o repositório do GitHub para obter as últimas melhorias.</p>
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
              {isUpdating ? 'Atualizando...' : 'Buscar Atualizações'}
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-white/5">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Nota para desenvolvedores:</strong> Este botão simula a interface de atualização. Para que ele realmente execute um <code className="bg-black/30 px-1 py-0.5 rounded text-primary">git pull</code> e atualize o sistema, você precisará conectar a função <code className="bg-black/30 px-1 py-0.5 rounded text-primary">handleCheckUpdate</code> (no arquivo SystemUpdate.tsx) a um endpoint do seu servidor backend (ex: Node.js, PHP, Python) que tenha permissão para executar comandos no terminal do servidor.
            </p>
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
