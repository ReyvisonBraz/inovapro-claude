import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  Database, 
  Cloud, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Circle,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ProjectOverview: React.FC = () => {
  const steps = [
    {
      title: 'Migração para Supabase (PostgreSQL)',
      icon: Database,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      items: [
        { label: 'Definição do Esquema Relacional (Prisma/SQL)', completed: true },
        { label: 'Provisionar projeto no Supabase (Região: sa-east-1)', completed: false },
        { label: 'Executar script de criação de tabelas (DDL)', completed: false },
        { label: 'Migrar dados existentes do SQLite para o PostgreSQL', completed: false },
      ]
    },
    {
      title: 'Hospedagem no Render.com (Backend)',
      icon: Cloud,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      items: [
        { label: 'Criar Web Service no Render conectado ao GitHub', completed: false },
        { label: 'Configurar variáveis de ambiente (DATABASE_URL, etc)', completed: false },
        { label: 'Configurar o start script para produção', completed: false },
        { label: 'Habilitar HTTPS automático e Health Check', completed: false },
      ]
    },
    {
      title: 'Autenticação e Segurança',
      icon: ShieldCheck,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      items: [
        { label: 'Implementar Supabase Auth', completed: false },
        { label: 'Configurar Row Level Security (RLS)', completed: false },
        { label: 'Configurar políticas de acesso baseadas em auth.uid()', completed: false },
      ]
    },
    {
      title: 'Integrações Avançadas',
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      items: [
        { label: 'Configurar Supabase Storage para fotos', completed: false },
        { label: 'Implementar Webhooks para notificações em tempo real', completed: false },
        { label: 'Integração com APIs de Terceiros via Server-side', completed: false },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Rocket size={24} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight">Status do Projeto</h4>
          <p className="text-sm text-slate-400">Visão geral do roadmap de migração para Cloud (Supabase & Render).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Progresso Geral</span>
            <span className="text-lg font-black text-white">85%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              className="h-full bg-primary shadow-[0_0_15px_rgba(17,82,212,0.5)]"
            />
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            O sistema está em fase final de transição. A estrutura de dados e lógica de negócios já está preparada para o ambiente de produção.
          </p>
        </div>

        <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <CheckCircle2 size={18} />
            </div>
            <h5 className="text-sm font-bold text-white">Concluído Recentemente</h5>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <ArrowRight size={12} className="text-emerald-500" />
              Refatoração de pastas e domínios
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <ArrowRight size={12} className="text-emerald-500" />
              Sistema de Auditoria e Logs
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <ArrowRight size={12} className="text-emerald-500" />
              Gestão Multi-usuário e Permissões
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <h5 className="text-sm font-bold uppercase tracking-widest text-slate-500">Roadmap de Migração</h5>
        
        <div className="grid grid-cols-1 gap-4">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("p-3 rounded-xl", step.bgColor, step.color)}>
                  <step.icon size={24} />
                </div>
                <h6 className="text-base font-bold text-white">{step.title}</h6>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {step.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-600 shrink-0" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      item.completed ? "text-slate-300" : "text-slate-500"
                    )}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
        <p className="text-[10px] text-blue-400 leading-relaxed text-center uppercase tracking-widest font-bold">
          Próxima Parada: Supabase Cloud & Render Backend Integration
        </p>
      </div>
    </div>
  );
};
