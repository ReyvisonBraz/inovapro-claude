import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { SystemError } from '../../types';
import { cn } from '../../lib/utils';
import { EmptyState } from '../ui/EmptyState';

export function SystemErrorsPanel({ errors, onResolve }: { errors: SystemError[]; onResolve: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return errors;
    return errors.filter(error => [error.id, error.requestId, error.operation, error.route, error.message, error.username]
      .some(value => value?.toLowerCase().includes(term)));
  }, [errors, search]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-white">Erros do sistema</h3>
        <p className="text-sm text-slate-400">Falhas técnicas persistidas no servidor. Pesquise pelo código exibido ao usuário.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Código, operação, rota, usuário ou mensagem…" className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div className="space-y-3">
        {filtered.map(error => (
          <article key={error.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className={error.severity === 'critical' ? 'text-rose-400' : error.severity === 'error' ? 'text-amber-400' : 'text-yellow-300'} />
                <span className={cn('rounded-md border px-2 py-1 text-[10px] font-black uppercase', error.severity === 'critical' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400')}>{error.severity}</span>
                <code className="text-xs font-bold text-primary">{error.id}</code>
              </div>
              <time className="text-xs text-slate-500">{format(parseISO(error.timestamp), 'dd/MM/yyyy HH:mm:ss')}</time>
            </div>
            <div>
              <p className="font-bold text-slate-100">{error.operation || 'Operação não identificada'}</p>
              <p className="mt-1 text-sm text-slate-300">{error.message}</p>
            </div>
            <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
              <span>Origem: {error.source}</span><span>HTTP: {error.statusCode || '—'}</span>
              <span>Rota: {error.route || '—'}</span><span>Request ID: {error.requestId || '—'}</span>
              <span>Usuário: {error.username || error.userId || '—'}</span>
            </div>
            {error.stack && <details className="text-xs text-slate-500"><summary className="cursor-pointer font-bold">Detalhes técnicos</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-3">{error.stack}</pre></details>}
            <button onClick={() => onResolve(error.id)} className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"><CheckCircle2 size={15} /> Marcar como resolvido</button>
          </article>
        ))}
        {filtered.length === 0 && <EmptyState title="Nenhum erro pendente encontrado" />}
      </div>
    </div>
  );
}
