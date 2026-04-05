import React from 'react';
import { Reports } from '../components/reports/Reports';
import { useStats } from '../hooks/useStats';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../components/ui/Toast';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const { stats, handleChartClick, fetchStats } = useStats();
  const { categories } = useSettingsStore();
  const { transactions } = useTransactions(showToast);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
