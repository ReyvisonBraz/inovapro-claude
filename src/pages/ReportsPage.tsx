import React from 'react';
import { Reports } from '../components/Reports';
import { useStats } from '../hooks/useStats';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../components/ui/Toast';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const { stats, handleChartClick } = useStats();
  const { categories } = useSettingsStore();
  const { transactions } = useTransactions(showToast);

  return (
    <Reports 
      chartData={stats.chartData}
      handleChartClick={handleChartClick}
      categories={categories}
      transactions={transactions.data}
    />
  );
};

export default ReportsPage;
