import React, { useState } from 'react';
import { User, AuditLog } from '../../types';
import { cn } from '../../lib/utils';
import { UserPlus, Trash2, Shield, Clock, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface UserManagementProps {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'> & { password: string }) => void;
  deleteUser: (id: number) => void;
  auditLogs: AuditLog[];
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, addUser, deleteUser, auditLogs }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'employee' as const });

  const handleAddUser = () => {
    if (newUser.username && newUser.password && newUser.name) {
      addUser(newUser);
      setNewUser({ username: '', password: '', name: '', role: 'employee' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h4 className="text-xl font-bold">Usuários e Permissões</h4>
          <p className="text-xs text-slate-500 font-medium">Gerencie o acesso e monitore as atividades do sistema</p>
        </div>
      </div>

      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-4">
        <button 
          onClick={() => setActiveTab('users')}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'users' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-200"
          )}
        >
          <UserPlus size={16} />
          Usuários
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'logs' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-200"
          )}
        >
          <Activity size={16} />
          Logs de Auditoria
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-8">
          <div className="glass-card p-6 space-y-4 border border-white/10">
            <h5 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Adicionar Novo Usuário</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="Nome Completo"
                className="h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
              <input 
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                placeholder="Nome de Usuário (Login)"
                className="h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
              <input 
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Senha"
                className="h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
              <select 
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                className="h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-300 [&>option]:bg-slate-900"
              >
                <option value="employee">Funcionário</option>
                <option value="manager">Gerente</option>
                <option value="owner">Dono</option>
              </select>
            </div>
            <button 
              onClick={handleAddUser}
              className="w-full py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all"
            >
              Criar Usuário
            </button>
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Usuários Ativos</h5>
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                    user.role === 'owner' ? "bg-purple-500" : user.role === 'manager' ? "bg-blue-500" : "bg-slate-500"
                  )}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{user.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">@{user.username}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-widest font-bold",
                        user.role === 'owner' ? "bg-purple-500/20 text-purple-500" : user.role === 'manager' ? "bg-blue-500/20 text-blue-500" : "bg-slate-500/20 text-slate-500"
                      )}>
                        {user.role === 'owner' ? 'Dono' : user.role === 'manager' ? 'Gerente' : 'Funcionário'}
                      </span>
                    </div>
                  </div>
                </div>
                {user.username !== 'admin' && (
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Histórico de Atividades</h5>
            <span className="text-xs text-slate-500">{auditLogs.length} registros</span>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
                <div className="mt-1 text-slate-500">
                  <Clock size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-slate-300">
                      <span className="text-primary">{log.userName || 'Sistema'}</span> {log.action} {log.entity}
                    </p>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                      {format(parseISO(log.timestamp), 'dd/MM HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
