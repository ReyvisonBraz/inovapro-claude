import React from 'react';
import { motion } from 'motion/react';
import { 
  History, Search, Filter, Calendar, 
  User, Activity, ChevronRight 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AuditLog } from '../../types';
import { format, parseISO } from 'date-fns';

interface AuditLogsProps {
  auditLogs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Filtrar logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Data/Hora</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Ação</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-300">
                      {format(parseISO(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={12} />
                      </div>
                      <p className="text-xs font-bold">{log.userName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                      log.action.includes('Excluir') ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                      log.action.includes('Editar') ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-400 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-500 italic">
                    Nenhum log de auditoria encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
