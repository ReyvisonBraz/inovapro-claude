import React from 'react';
import { Dashboard } from '../components/dashboard/Dashboard';
import { DrillDownModal } from '../components/ui/DrillDownModal';
import { useStats } from '../hooks/useStats';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFilterStore } from '../store/useFilterStore';

export const DashboardPage: React.FC = () => {
  const { dashboardMonth } = useFilterStore();
  const { stats, handleChartClick, drillDownModal } = useStats(dashboardMonth);
  const { settings } = useSettingsStore();

  return (
    <>
      <Dashboard 
        totalIncome={stats.totalIncome}
        totalExpenses={stats.totalExpenses}
        netBalance={stats.netBalance}
        chartData={stats.chartData}
        handleChartClick={(data) => handleChartClick(data, stats.transactions || [])}
        sortedIncomeRanking={stats.sortedIncomeRanking}
        sortedExpenseRanking={stats.sortedExpenseRanking}
      />
      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={drillDownModal.close}
        title={drillDownModal.title}
        subtitle={drillDownModal.subtitle}
        drillDownData={drillDownModal.drillDownData!}
        filters={drillDownModal.filters}
      />
    </>
  );
};

export default DashboardPage;