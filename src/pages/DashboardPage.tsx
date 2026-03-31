import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { useStats } from '../hooks/useStats';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFilterStore } from '../store/useFilterStore';

export const DashboardPage: React.FC = () => {
  const { stats, handleChartClick } = useStats();
  const { settings } = useSettingsStore();
  const { dashboardMonth, handlePrevMonth, handleNextMonth } = useFilterStore();

  return (
    <Dashboard 
      totalIncome={stats.totalIncome}
      totalExpenses={stats.totalExpenses}
      netBalance={stats.netBalance}
      chartData={stats.chartData}
      handleChartClick={handleChartClick}
      sortedIncomeRanking={stats.sortedIncomeRanking}
      sortedExpenseRanking={stats.sortedExpenseRanking}
      initialBalance={settings.initialBalance}
      dashboardMonth={dashboardMonth}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
    />
  );
};

export default DashboardPage;
