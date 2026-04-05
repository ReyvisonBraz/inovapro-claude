import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { logger } from '../../lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // The logger will automatically catch this via the console.error override
    // but we can log it explicitly if we want
    logger.addLog('error', `React Error Boundary caught an error: ${error.message}`, errorInfo);
  }

  private handleDownloadLogs = () => {
    logger.downloadLogs();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-rose-500/20 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Ops! Algo deu errado.</h1>
              <p className="text-slate-400 text-sm">
                O sistema encontrou um erro inesperado. Não se preocupe, seus dados estão seguros.
              </p>
            </div>

            <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-left overflow-auto max-h-32">
              <p className="text-xs font-mono text-rose-400">
                {this.state.error?.message || 'Erro desconhecido'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleDownloadLogs}
                className="w-full h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
              >
                <Download size={18} />
                Baixar Logs de Erro
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
              >
                <RefreshCw size={18} />
                Recarregar Sistema
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
