import React from 'react';
import { Dashboard } from '../components/dashboard/Dashboard';
import { useStats } from '../hooks/useStats';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFilterStore } from '../store/useFilterStore';

export const DashboardPage: React.FC = () => {
  const { dashboardMonth } = useFilterStore();
  const { stats, handleChartClick } = useStats(dashboardMonth);
  const { settings } = useSettingsStore();

  return (
    <Dashboard 
      totalIncome={stats.totalIncome}
      totalExpenses={stats.totalExpenses}
      netBalance={stats.netBalance}
      chartData={stats.chartData}
      handleChartClick={handleChartClick}
      sortedIncomeRanking={stats.sortedIncomeRanking}
      sortedExpenseRanking={stats.sortedExpenseRanking}
    />
  );
};

export default DashboardPage;
