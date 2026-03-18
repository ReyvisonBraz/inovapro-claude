import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, User, Shield, 
  Database, Bell, Palette, Globe,
  Save, Plus, Trash2, Edit2, Key
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppSettings, Category, User as UserType } from '../../types';
import AuditLogs from '../audit/AuditLogs';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  categories: Category[];
  addCategory: (name: string, type: 'income' | 'expense') => void;
  deleteCategory: (id: number) => void;
  users: UserType[];
  addUser: (user: Omit<UserType, 'id'>) => void;
  updateUser: (id: number, user: Partial<UserType>) => void;
  deleteUser: (id: number) => void;
  auditLogs: any[];
}

const Settings: React.FC<SettingsProps> = ({
  settings = {} as AppSettings,
  updateSettings,
  categories,
  addCategory,
  deleteCategory,
  users,
  addUser,
  updateUser,
  deleteUser,
  auditLogs
}) => {
  const [activeTab, setActiveTab] = React.useState('general');
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryType, setNewCategoryType] = React.useState<'income' | 'expense'>('income');

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'categories', label: 'Categorias', icon: Palette },
    { id: 'users', label: 'Usuários', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'audit', label: 'Auditoria', icon: Database },
  ];

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
                      onChange={(e) => updateSettings({ appName: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Moeda</label>
                    <select 
                      value={settings.currency}
                      onChange={(e) => updateSettings({ currency: e.target.value })}
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
                    onClick={() => updateSettings({ showWarnings: !settings.showWarnings })}
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
                        addCategory(newCategoryName, newCategoryType);
                        setNewCategoryName('');
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
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Usuários do Sistema</h4>
                  <button className="text-primary text-xs font-bold hover:underline">Adicionar Usuário</button>
                </div>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email} • {user.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-500 hover:text-primary transition-all"><Edit2 size={16} /></button>
                        <button className="p-2 text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
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
                        value={settings.settingsPassword}
                        onChange={(e) => updateSettings({ settingsPassword: e.target.value })}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Nova senha..."
                      />
                    </div>
                    <button className="px-6 h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                      Atualizar
                    </button>
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
