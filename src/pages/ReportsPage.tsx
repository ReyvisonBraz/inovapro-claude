import React from 'react';
import { Reports } from '../components/reports/Reports';
import { DrillDownModal } from '../components/ui/DrillDownModal';
import { useStats } from '../hooks/useStats';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../components/ui/Toast';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const { stats, handleChartClick, fetchStats, drillDownModal } = useStats();
  const { categories } = useSettingsStore();
  const { transactions } = useTransactions(showToast);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <>
      <Reports 
        chartData={stats.chartData}
        handleChartClick={(data) => handleChartClick(data, transactions.data || [])}
        categories={categories}
        transactions={transactions.data}
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

export default ReportsPage;