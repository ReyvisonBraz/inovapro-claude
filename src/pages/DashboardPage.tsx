import React from 'react';
import { Dashboard } from '../components/dashboard/Dashboard';
import { DrillDownModal } from '../components/ui/DrillDownModal';
import { useStats } from '../hooks/useStats';
import { useFilterStore } from '../store/useFilterStore';

export const DashboardPage: React.FC = () => {
  const { dashboardMonth } = useFilterStore();
  const { stats, handleChartClick, drillDownModal } = useStats(dashboardMonth);

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
        pendingPayments={stats.pendingPayments ?? 0}
        activeOS={stats.activeOS ?? 0}
        recentTransactions={stats.recentTransactions ?? []}
        monthIncome={stats.monthIncome ?? 0}
        monthExpenses={stats.monthExpenses ?? 0}
        monthNet={stats.monthNet ?? 0}
        monthOSCount={stats.monthOSCount ?? 0}
        osStatusCount={stats.osStatusCount ?? {}}
        topProducts={stats.topProducts ?? []}
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
