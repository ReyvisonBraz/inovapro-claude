/**
 * REPORTS PAGE
 * ===========
 * Página principal de relatórios usando EnhancedReports
 */

import React from 'react';
import { EnhancedReports } from '../components/reports/EnhancedReports';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../components/ui/Toast';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const { categories } = useSettingsStore();
  const { transactions } = useTransactions(showToast);

  return (
    <EnhancedReports
      transactions={transactions.data || []}
      categories={categories}
    />
  );
};

export default ReportsPage;