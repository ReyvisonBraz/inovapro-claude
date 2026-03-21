import React, { useState } from 'react';
import { User, AuditLog, Transaction, Customer, ClientPayment } from '../../types';
import { cn } from '../../lib/utils';
import { UserPlus, Trash2, Shield, Clock, Activity, Check, X, Edit2, AlertCircle, Info, FileText, User as UserIcon, CreditCard, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface UserManagementProps {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'> & { password: string }) => void;
  updateUser: (id: number, user: any) => void;
  deleteUser: (id: number) => void;
  auditLogs: AuditLog[];
  transactions: Transaction[];
  customers: Customer[];
  clientPayments: ClientPayment[];
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', label: 'Ver Painel' },
  { id: 'manage_transactions', label: 'Gerenciar Transações' },
  { id: 'view_reports', label: 'Ver Relatórios' },
  { id: 'manage_customers', label: 'Gerenciar Clientes' },
  { id: 'manage_payments', label: 'Gerenciar Pagamentos' },
  { id: 'manage_settings', label: 'Gerenciar Configurações' },
  { id: 'manage_users', label: 'Gerenciar Usuários' },
];

export const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  addUser, 
  updateUser, 
  deleteUser, 
  auditLogs,
  transactions,
  customers,
  clientPayments
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ 
    username: '', 
    password: '', 
    name: '', 
    role: 'employee' as 'owner' | 'manager' | 'employee',
    permissions: [] as string[]
  });

  const handleSaveUser = () => {
    if (editingUserId) {
      // Update existing user
      if (newUser.username && newUser.name) {
        updateUser(editingUserId, newUser);
        resetForm();
      }
    } else {
      // Create new user
      if (newUser.username && newUser.password && newUser.name) {
        addUser(newUser);
        resetForm();
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setNewUser({
      username: user.username,
      password: '', // Password empty means don't change it
      name: user.name,
      role: user.role,
      permissions: user.permissions || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingUserId(null);
    setNewUser({ username: '', password: '', name: '', role: 'employee' as 'owner' | 'manager' | 'employee', permissions: [] });
  };

  const togglePermission = (permissionId: string) => {
    setNewUser(prev => {
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions };
    });
  };

  const getUserActivityStats = (userId: number) => {
    const userTransactions = transactions.filter(t => t.createdBy === userId).length;
    const userCustomers = customers.filter(c => c.createdBy === userId).length;
    const userPayments = clientPayments.filter(p => p.createdBy === userId).length;
    
    return {
      transactions: userTransactions,
      customers: userCustomers,
      payments: userPayments,
      total: userTransactions + userCustomers + userPayments
    };
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('add')) return <UserPlus size={14} className="text-emerald-500" />;
    if (action.includes('update') || action.includes('edit')) return <Edit2 size={14} className="text-blue-500" />;
    if (action.includes('delete') || action.includes('remove')) return <Trash2 size={14} className="text-rose-500" />;
    return <Activity size={14} className="text-slate-500" />;
  };

  const getEntityIcon = (entity: string) => {
    if (entity === 'Transaction') return <FileText size={14} />;
    if (entity === 'Customer') return <UserIcon size={14} />;
    if (entity === 'ClientPayment') return <CreditCard size={14} />;
    if (entity === 'User') return <Users size={14} />;
    return <Activity size={14} />;
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
          <div className={cn(
            "glass-card p-5 space-y-4 border transition-all duration-300",
            editingUserId ? "border-primary/50 shadow-[0_0_30px_rgba(17,82,212,0.15)] bg-primary/5" : "border-white/10"
          )}>
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", editingUserId ? "bg-emerald-500" : "bg-primary")} />
                {editingUserId ? 'Editando Usuário' : 'Novo Usuário'}
              </h5>
              {editingUserId && (
                <button 
                  onClick={resetForm}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-black uppercase tracking-widest flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded-md transition-all"
                >
                  <X size={10} /> Cancelar
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                <input 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Ex: João Silva"
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Login</label>
                <input 
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Ex: joao.silva"
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Senha</label>
                <input 
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder={editingUserId ? "Deixe em branco para manter" : "Senha de acesso"}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Cargo / Nível</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-slate-300 [&>option]:bg-slate-900 transition-all"
                >
                  <option value="employee">Funcionário</option>
                  <option value="manager">Gerente</option>
                  <option value="owner">Dono</option>
                </select>
              </div>
            </div>

            {newUser.role !== 'owner' && (
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Permissões de Acesso</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {AVAILABLE_PERMISSIONS.map(perm => (
                    <button
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border text-[11px] font-bold transition-all text-left",
                        newUser.permissions.includes(perm.id)
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-md border flex items-center justify-center transition-colors",
                        newUser.permissions.includes(perm.id) ? "bg-primary border-primary" : "border-slate-500"
                      )}>
                        {newUser.permissions.includes(perm.id) && <Check size={10} className="text-white" />}
                      </div>
                      {perm.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleSaveUser}
              className={cn(
                "w-full py-3 text-white rounded-xl font-bold text-sm transition-all mt-4 flex items-center justify-center gap-2",
                editingUserId 
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20" 
                  : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              )}
            >
              {editingUserId ? <Check size={18} /> : <UserPlus size={18} />}
              {editingUserId ? 'Salvar Alterações' : 'Criar Novo Usuário'}
            </button>
          </div>

          <div className="space-y-3">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Usuários Ativos</h5>
            <div className="grid grid-cols-1 gap-3">
              {users.map(user => {
                const stats = getUserActivityStats(user.id);
                const hasActivity = stats.total > 0;
                
                return (
                  <div key={user.id} className={cn(
                    "group flex flex-col gap-4 p-4 bg-white/5 border rounded-2xl transition-all hover:bg-white/[0.07]",
                    editingUserId === user.id ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" : "border-white/10"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg",
                            user.role === 'owner' ? "bg-gradient-to-br from-purple-500 to-indigo-600" : 
                            user.role === 'manager' ? "bg-gradient-to-br from-blue-500 to-cyan-600" : 
                            "bg-gradient-to-br from-slate-500 to-slate-700"
                          )}>
                            {user.name.charAt(0)}
                          </div>
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-bg-dark flex items-center justify-center",
                            user.role === 'owner' ? "bg-purple-500" : user.role === 'manager' ? "bg-blue-500" : "bg-slate-500"
                          )}>
                            <Shield size={8} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-base text-white">{user.name}</p>
                            {hasActivity && (
                              <div className="group/info relative">
                                <Info size={14} className="text-blue-400 cursor-help opacity-50 hover:opacity-100 transition-opacity" />
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl z-50 opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all scale-95 group-hover/info:scale-100">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 border-b border-white/5 pb-1">Atividade</p>
                                  <ul className="text-[11px] space-y-1.5 text-slate-300">
                                    <li className="flex justify-between"><span>Transações:</span> <span className="font-bold text-white">{stats.transactions}</span></li>
                                    <li className="flex justify-between"><span>Clientes:</span> <span className="font-bold text-white">{stats.customers}</span></li>
                                    <li className="flex justify-between"><span>Pagamentos:</span> <span className="font-bold text-white">{stats.payments}</span></li>
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500 font-medium">@{user.username}</span>
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black",
                              user.role === 'owner' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : 
                              user.role === 'manager' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : 
                              "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            )}>
                              {user.role === 'owner' ? 'Dono' : user.role === 'manager' ? 'Gerente' : 'Funcionário'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          title="Editar Usuário"
                        >
                          <Edit2 size={18} />
                        </button>
                        {user.username !== 'admin' && (
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Excluir Usuário"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {user.role !== 'owner' && user.permissions && user.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-16">
                        {user.permissions.map(perm => {
                          const label = AVAILABLE_PERMISSIONS.find(p => p.id === perm)?.label || perm;
                          return (
                            <span key={perm} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-slate-500">
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              <div key={log.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-slate-200 truncate">
                      <span className="text-primary">{log.userName || 'Sistema'}</span>
                      <span className="text-slate-400 font-normal mx-1">realizou</span>
                      <span className="text-white">{log.action}</span>
                    </p>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2 flex items-center gap-1">
                      <Clock size={10} />
                      {format(parseISO(log.timestamp), 'dd/MM HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
                      {getEntityIcon(log.entity)}
                      {log.entity}
                    </span>
                    <span className="truncate">{log.details}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
