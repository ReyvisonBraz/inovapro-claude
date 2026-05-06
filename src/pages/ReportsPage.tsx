import React, { useState } from 'react';
import { EnhancedReports } from '../components/reports/EnhancedReports';
import { OSReports } from '../components/reports/OSReports';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../components/ui/Toast';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { BarChart3, Wrench } from 'lucide-react';
import { cn } from '../lib/utils';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const { categories } = useSettingsStore();
  const { transactions } = useTransactions(showToast);
  const [tab, setTab] = useState<'financeiro' | 'os'>('financeiro');

  const { data: serviceOrders = [] } = useQuery({
    queryKey: ['service-orders-all'],
    queryFn: async () => {
      const { data } = await api.get('/service-orders?page=1&limit=9999');
      return data?.data || data || [];
    },
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data } = await api.get('/inventory');
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Seletor de Módulo */}
      <div className="flex gap-3 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <button
          onClick={() => setTab('financeiro')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            tab === 'financeiro' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'
          )}
        >
          <BarChart3 size={16} /> Financeiro
        </button>
        <button
          onClick={() => setTab('os')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            tab === 'os' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'
          )}
        >
          <Wrench size={16} /> Ordens de Serviço
        </button>
      </div>

      {tab === 'financeiro' && (
        <EnhancedReports
          transactions={transactions.data || []}
          categories={categories}
        />
      )}

      {tab === 'os' && (
        <OSReports
          serviceOrders={serviceOrders}
          inventoryItems={inventoryItems}
        />
      )}
    </div>
  );
};

export default ReportsPage;