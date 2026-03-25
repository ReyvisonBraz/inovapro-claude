import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shield, Search, CheckCircle2, AlertTriangle, MonitorSmartphone, Calendar, FileText, Wrench, PackageCheck, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useAppSettings } from '../hooks/useAppSettings';

interface StatusPageProps {
  osId: number;
}

interface OsDetails {
  id: number;
  status: string;
  reportedProblem: string;
  technicalAnalysis: string;
  equipmentType: string;
  equipmentBrand: string;
  equipmentModel: string;
  entryDate: string;
  analysisPrediction: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
}

const statusColors: Record<string, string> = {
  'Aguardando Análise': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  'Em Análise': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Aguardando Aprovação': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Aprovado': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'Em Manutenção': 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
  'Aguardando Peças': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Pronto para Retirada': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Entregue': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  'Cancelado': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  'Urgente': 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const StatusPage: React.FC<StatusPageProps> = ({ osId }) => {
  const { settings } = useAppSettings();
  const [cpfPrefix, setCpfPrefix] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [osData, setOsData] = useState<OsDetails | null>(null);

  const formatOsNumber = (id: number) => `#OS-${id.toString().padStart(4, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpfPrefix.length < 4) {
      setError('Por favor, digite os 4 primeiros números do CPF.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/service-orders/public/${osId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cpfPrefix })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao consultar OS. Verifique os dados.');
      }

      setOsData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (osData) {
    const statusColorClass = statusColors[osData.status] || 'bg-primary/10 text-primary border-primary/20';

    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center py-12 px-4 selection:bg-primary/30">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white">{settings.appName || 'FinanceFlow'}</h1>
            <p className="text-slate-400 font-medium">Acompanhamento de Ordem de Serviço</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
            
            <div className="p-8 space-y-8">
              {/* Status Header */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-sm font-bold text-slate-500 tracking-widest uppercase">
                  {formatOsNumber(osData.id)}
                </div>
                <h2 className="text-xl font-bold text-slate-200">
                  Olá, {osData.firstName} {osData.lastName}!
                </h2>
                <div className={`mt-2 px-6 py-2.5 rounded-full border \${statusColorClass} font-bold text-sm shadow-lg`}>
                  {osData.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-1 border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Entrada</span>
                  <span className="text-sm font-bold text-slate-300">
                    {osData.entryDate ? format(parseISO(osData.entryDate), "dd 'de' MMM, yyyy", { locale: ptBR }) : '-'}
                  </span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-1 border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Previsão</span>
                  <span className="text-sm font-bold text-slate-300">
                    {osData.analysisPrediction ? format(parseISO(osData.analysisPrediction), "dd 'de' MMM, yyyy", { locale: ptBR }) : 'Não informada'}
                  </span>
                </div>
              </div>

              {/* Equipamento */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MonitorSmartphone className="w-4 h-4 text-primary" />
                  Seu Equipamento
                </h3>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm">
                  <p className="text-slate-300"><span className="text-slate-500">Tipo:</span> {osData.equipmentType || 'N/A'}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Marca:</span> {osData.equipmentBrand || 'N/A'}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Modelo:</span> {osData.equipmentModel || 'N/A'}</p>
                </div>
              </div>

              {/* Detalhes */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    Problema Relatado
                  </h3>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {osData.reportedProblem || 'Não detalhado.'}
                  </div>
                </div>

                {osData.technicalAnalysis && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      Parecer Técnico
                    </h3>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {osData.technicalAnalysis}
                    </div>
                  </div>
                )}
              </div>

              {/* Valor */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Valor Total do Serviço</span>
                <span className="text-xl font-black text-emerald-400">
                  {formatCurrency(osData.totalAmount || 0)}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 text-center text-xs text-slate-500 border-t border-white/5">
              Última atualização: {format(parseISO(osData.updatedAt || osData.createdAt), "dd/MM/yyyy 'às' HH:mm")}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 selection:bg-primary/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
        
        <div className="flex flex-col items-center text-center space-y-6 mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Consulta de OS</h1>
            <p className="text-sm text-slate-400">
              Para sua segurança, digite os 4 primeiros números do CPF cadastrado na Ordem de Serviço <strong className="text-white">#{osId.toString().padStart(4, '0')}</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">4 Primeiros Dígitos do CPF</label>
            <div className="relative">
              <input 
                type="text" 
                inputMode="numeric"
                maxLength={4}
                value={cpfPrefix}
                onChange={(e) => setCpfPrefix(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Excesso: 1234"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 text-xl font-bold tracking-[0.2em] focus:ring-2 focus:ring-primary outline-none transition-all text-white placeholder:text-slate-600"
                disabled={loading}
              />
              <LockIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || cpfPrefix.length < 4}
            className="w-full h-14 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_-5px_rgba(17,82,212,0.4)]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Consultar OS
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// Helper component
const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
