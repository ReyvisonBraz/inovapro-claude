import React, { useState } from 'react';
import { AppSettings, Category, User, AuditLog, Transaction, Customer, ClientPayment, EquipmentType } from '../../types';
import { cn } from '../../lib/utils';
import { PrintLayout } from './PrintLayout';
import { InterfaceSettings } from './InterfaceSettings';
import { CategorySettings } from './CategorySettings';
import { UserManagement } from './UserManagement';
import { Printer, Layout, List, Users, MessageCircle, Laptop, RefreshCw } from 'lucide-react';
import { WhatsAppSettings } from './WhatsAppSettings';
import { EquipmentSettings } from './EquipmentSettings';
import { SystemUpdate } from './SystemUpdate';
import { Brand, Model } from '../../types';

interface SettingsLayoutProps {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
  categories: Category[];
  addCategory: (name: string, type: 'income' | 'expense') => void;
  deleteCategory: (id: number) => void;
  users: User[];
  addUser: (user: any) => void;
  updateUser: (id: number, user: any) => void;
  deleteUser: (id: number) => void;
  auditLogs: AuditLog[];
  transactions: Transaction[];
  customers: Customer[];
  clientPayments: ClientPayment[];
  brands: Brand[];
  models: Model[];
  equipmentTypes: EquipmentType[];
  addBrand: (name: string, equipmentType: string) => Promise<void>;
  deleteBrand: (id: number) => Promise<void>;
  addModel: (brandId: number, name: string) => Promise<void>;
  deleteModel: (id: number) => Promise<void>;
  addEquipmentType: (name: string, icon?: string) => void;
  deleteEquipmentType: (id: number) => void;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'print' | 'interface' | 'categories' | 'users' | 'whatsapp' | 'equipment' | 'updates'>('interface');

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de Navegação */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Configurações</h3>
          
          <button
            onClick={() => setActiveTab('interface')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'interface' 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            )}
          >
            <Layout size={18} />
            Interface
          </button>
          
          <button
            onClick={() => setActiveTab('print')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'print' 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            )}
          >
            <Printer size={18} />
            Impressão
          </button>
          
          <button
            onClick={() => setActiveTab('categories')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'categories' 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            )}
          >
            <List size={18} />
            Categorias
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'equipment' 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            )}
          >
            <Laptop size={18} />
            Equipamentos
          </button>
          
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'whatsapp' 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            )}
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'users' 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            )}
          >
            <Users size={18} />
            Usuários
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'updates' 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            )}
          >
            <RefreshCw size={18} />
            Atualizações
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 glass-card p-8 min-h-[600px]">
          {activeTab === 'interface' && <InterfaceSettings {...props} />}
          {activeTab === 'print' && <PrintLayout {...props} />}
          {activeTab === 'categories' && <CategorySettings {...props} />}
          {activeTab === 'whatsapp' && <WhatsAppSettings settings={props.settings} updateSettings={props.updateSettings} />}
          {activeTab === 'equipment' && (
            <EquipmentSettings 
              brands={props.brands}
              models={props.models}
              equipmentTypes={props.equipmentTypes}
              onAddBrand={props.addBrand}
              onDeleteBrand={props.deleteBrand}
              onAddModel={props.addModel}
              onDeleteModel={props.deleteModel}
              onAddEquipmentType={props.addEquipmentType}
              onDeleteEquipmentType={props.deleteEquipmentType}
            />
          )}
          {activeTab === 'users' && (
            <UserManagement 
              users={props.users}
              addUser={props.addUser}
              updateUser={props.updateUser}
              deleteUser={props.deleteUser}
              auditLogs={props.auditLogs}
              transactions={props.transactions}
              customers={props.customers}
              clientPayments={props.clientPayments}
            />
          )}
          {activeTab === 'updates' && <SystemUpdate />}
        </div>
      </div>
    </div>
  );
};
