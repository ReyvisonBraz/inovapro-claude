import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, User, Shield, 
  Database, Bell, Palette, Globe,
  Save, Plus, Trash2, Edit2, Key,
  MessageSquare, Send, RefreshCw, Github, DownloadCloud
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppSettings, Category, User as UserType } from '../../types';
import AuditLogs from '../audit/AuditLogs';
import { useToast } from '../ui/Toast';

import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  categories: Category[];
  onAddCategory: (name: string, type: 'income' | 'expense') => void;
  onDeleteCategory: (id: number) => void;
  users: UserType[];
  onAddUser: (user: Omit<UserType, 'id'>) => void;
  onUpdateUser: (id: number, user: Partial<UserType>) => void;
  onDeleteUser: (id: number) => void;
  auditLogs: any[];
}

const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  categories,
  onAddCategory,
  onDeleteCategory,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  auditLogs
}) => {
  const [activeTab, setActiveTab] = React.useState('general');
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryType, setNewCategoryType] = React.useState<'income' | 'expense'>('income');
  const [isAddingUser, setIsAddingUser] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserType | null>(null);
  const [userForm, setUserForm] = React.useState({
    username: '',
    password: '',
    name: '',
    role: 'employee' as 'owner' | 'manager' | 'employee',
    permissions: [] as string[],
    createdAt: new Date().toISOString()
  });
  const [localPassword, setLocalPassword] = React.useState(settings.settingsPassword || '');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateStatus, setUpdateStatus] = React.useState<{type: 'idle' | 'checking' | 'updating' | 'success' | 'error', message: string}>({
    type: 'idle',
    message: 'Sistema atualizado. Nenhuma ação necessária no momento.'
  });
  const { showToast } = useToast();

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'categories', label: 'Categorias', icon: Palette },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'users', label: 'Usuários', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'updates', label: 'Atualizações', icon: RefreshCw },
    { id: 'audit', label: 'Auditoria', icon: Database },
  ];

  const handleUpdatePassword = () => {
    onUpdateSettings({ settingsPassword: localPassword });
    showToast('Senha de configurações atualizada!', 'success');
  };

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

  const handleSaveUser = () => {
    if (!userForm.username || !userForm.name || (!editingUser && !userForm.password)) {
      showToast('Preencha todos os campos obrigatórios!', 'warning');
      return;
    }

    if (editingUser) {
      onUpdateUser(editingUser.id, userForm);
      showToast('Usuário atualizado!', 'success');
    } else {
      onAddUser(userForm);
      showToast('Usuário adicionado!', 'success');
    }

    setIsAddingUser(false);
    setEditingUser(null);
    setUserForm({ username: '', password: '', name: '', role: 'employee', permissions: [], createdAt: new Date().toISOString() });
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">Personalize sua experiência e gerencie permissões</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8"
          >
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome do Aplicativo</label>
                    <input 
                      value={settings.appName}
                      onChange={(e) => onUpdateSettings({ appName: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Moeda</label>
                    <select 
                      value={settings.currency}
                      onChange={(e) => onUpdateSettings({ currency: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
                    >
                      <option value="BRL">Real (R$)</option>
                      <option value="USD">Dólar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-sm font-bold">Avisos</p>
                    <p className="text-xs text-slate-500">Mostrar avisos de sistema</p>
                  </div>
                  <button 
                    onClick={() => onUpdateSettings({ showWarnings: !settings.showWarnings })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      settings.showWarnings ? "bg-primary" : "bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      settings.showWarnings ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-8">
                <div className="flex gap-4">
                  <input 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nova categoria..."
                    className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                  <select 
                    value={newCategoryType}
                    onChange={(e) => setNewCategoryType(e.target.value as 'income' | 'expense')}
                    className="w-32 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
                  >
                    <option value="income">Entrada</option>
                    <option value="expense">Saída</option>
                  </select>
                  <button 
                    onClick={() => {
                      if (newCategoryName) {
                        onAddCategory(newCategoryName, newCategoryType);
                        setNewCategoryName('');
                        showToast('Categoria adicionada!', 'success');
                      }
                    }}
                    className="px-6 h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          cat.type === 'income' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <span className="text-sm font-bold">{cat.name}</span>
                      </div>
                      <button 
                        onClick={() => {
                          onDeleteCategory(cat.id);
                          showToast('Categoria removida!', 'info');
                        }}
                        className="p-2 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <Send size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Configuração SendPulse</h4>
                    <p className="text-xs text-slate-400">Integre sua conta SendPulse para automação de mensagens WhatsApp.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Client ID</label>
                    <input 
                      value={settings.sendPulseClientId || ''}
                      onChange={(e) => onUpdateSettings({ sendPulseClientId: e.target.value })}
                      placeholder="Seu Client ID da SendPulse"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Client Secret</label>
                    <input 
                      type="password"
                      value={settings.sendPulseClientSecret || ''}
                      onChange={(e) => onUpdateSettings({ sendPulseClientSecret: e.target.value })}
                      placeholder="Seu Client Secret da SendPulse"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Template ID (WhatsApp)</label>
                    <input 
                      value={settings.sendPulseTemplateId || ''}
                      onChange={(e) => onUpdateSettings({ sendPulseTemplateId: e.target.value })}
                      placeholder="ID do Template de Mensagem"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => showToast('Configurações de WhatsApp salvas!', 'success')}
                    className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    Salvar Configurações API
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Usuários do Sistema</h4>
                  {!isAddingUser && (
                    <button 
                      onClick={() => {
                        setEditingUser(null);
                        setUserForm({ username: '', password: '', name: '', role: 'employee', permissions: [], createdAt: new Date().toISOString() });
                        setIsAddingUser(true);
                      }}
                      className="flex items-center gap-2 text-primary text-xs font-bold hover:underline"
                    >
                      <Plus size={14} />
                      Adicionar Usuário
                    </button>
                  )}
                </div>

                {isAddingUser ? (
                  <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome Completo</label>
                        <input 
                          value={userForm.name}
                          onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                          placeholder="Ex: João Silva"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Usuário (Login)</label>
                        <input 
                          value={userForm.username}
                          onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                          placeholder="Ex: joao.silva"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Senha</label>
                        <input 
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                          placeholder={editingUser ? "Deixe em branco para manter" : "Senha de acesso"}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cargo / Função</label>
                        <select 
                          value={userForm.role}
                          onChange={(e) => setUserForm({...userForm, role: e.target.value as any})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
                        >
                          <option value="employee">Funcionário</option>
                          <option value="manager">Gerente</option>
                          <option value="owner">Proprietário</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setIsAddingUser(false)}
                        className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSaveUser}
                        className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                      >
                        {editingUser ? 'Salvar Alterações' : 'Adicionar Usuário'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.username} • {user.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingUser(user);
                              setUserForm({
                                username: user.username,
                                password: '',
                                name: user.name,
                                role: user.role,
                                permissions: user.permissions || [],
                                createdAt: user.createdAt
                              });
                              setIsAddingUser(true);
                            }}
                            className="p-2 text-slate-500 hover:text-primary transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteUser(user.id)}
                            className="p-2 text-slate-500 hover:text-rose-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Senha de Acesso às Configurações</h4>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password"
                        value={localPassword}
                        onChange={(e) => setLocalPassword(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Nova senha..."
                      />
                    </div>
                    <button 
                      onClick={handleUpdatePassword}
                      className="px-6 h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                      Atualizar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'updates' && (
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
                        <strong className="text-slate-300">Nota para desenvolvedores:</strong> Este botão simula a interface de atualização. Para que ele realmente execute um <code className="bg-black/30 px-1 py-0.5 rounded text-primary">git pull</code> e atualize o sistema, você precisará conectar a função <code className="bg-black/30 px-1 py-0.5 rounded text-primary">handleCheckUpdate</code> (no arquivo Settings.tsx) a um endpoint do seu servidor backend (ex: Node.js, PHP, Python) que tenha permissão para executar comandos no terminal do servidor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <AuditLogs auditLogs={auditLogs} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
