import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useFilterStore } from '../store/useFilterStore';
import { DrillDownModal, DrillDownData } from '../components/ui/DrillDownModal';
import { Transaction } from '../types';

export const useStats = (month?: string) => {
  const navigate = useNavigate();
  const {
    reportTypeFilter,
    reportCategoryFilter,
    reportCustomerFilter,
    reportPaymentStatus,
    reportTagsFilter,
    reportStartDate,
    reportEndDate,
  } = useFilterStore();

  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    drillDownData: DrillDownData | null;
    filters?: {
      reportTypeFilter: string;
      reportCategoryFilter: string;
      reportCustomerFilter: string;
      reportPaymentStatus: string;
      reportTagsFilter: string[];
      reportStartDate: string;
      reportEndDate: string;
    };
  }>({
    isOpen: false,
    title: '',
    drillDownData: null,
  });

  const { data: stats = {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    chartData: [],
    sortedIncomeRanking: [],
    sortedExpenseRanking: [],
    pendingPayments: 0,
    activeOS: 0,
    transactions: [] as Transaction[],
  }, isLoading, error, refetch: fetchStats } = useQuery({
    queryKey: ['stats', month],
    queryFn: async () => {
      const res = await api.get('/stats', { params: { month } });
      return res.data;
    }
  });

  const openDrillDownModal = useCallback((
    title: string,
    subtitle: string | undefined,
    drillDownData: DrillDownData
  ) => {
    setDrillDownModal({
      isOpen: true,
      title,
      subtitle,
      drillDownData,
      filters: {
        reportTypeFilter,
        reportCategoryFilter,
        reportCustomerFilter,
        reportPaymentStatus,
        reportTagsFilter,
        reportStartDate,
        reportEndDate,
      },
    });
  }, [reportTypeFilter, reportCategoryFilter, reportCustomerFilter, reportPaymentStatus, reportTagsFilter, reportStartDate, reportEndDate]);

  const closeDrillDownModal = useCallback(() => {
    setDrillDownModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleChartClick = useCallback((data: any, transactions: Transaction[] = []) => {
    if (data && data.name) {
      const label = data.name || data.activeLabel;
      if (label) {
        const filteredTransactions = transactions.filter((tx: Transaction) => {
          const txDate = new Date(tx.date);
          const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
          return txMonth === label;
        });

        const drillDownData: DrillDownData = {
          levels: [
            {
              title: `Detalhes de ${label}`,
              subtitle: `Visão geral das transações em ${label}`,
              data: filteredTransactions,
              getCategoryValue: (tx: Transaction) => tx.category,
              getCategoryLabel: (tx: Transaction) => tx.category,
            },
            {
              title: 'Transações por Categoria',
              data: filteredTransactions,
              getCategoryValue: (tx: Transaction) => tx.category,
              getCategoryLabel: (tx: Transaction) => tx.category,
            },
          ],
          currentLevel: 0,
        };

        openDrillDownModal(
          `Análise: ${label}`,
          `Transações detalhadas para o período selecionado`,
          drillDownData
        );
      }
    }
  }, [openDrillDownModal]);

  return {
    stats,
    isLoading,
    error: error instanceof Error ? error.message : null,
    fetchStats,
    handleChartClick,
    drillDownModal: {
      isOpen: drillDownModal.isOpen,
      title: drillDownModal.title,
      subtitle: drillDownModal.subtitle,
      drillDownData: drillDownModal.drillDownData,
      filters: drillDownModal.filters,
      close: closeDrillDownModal,
    },
    openDrillDownModal,
  };
};