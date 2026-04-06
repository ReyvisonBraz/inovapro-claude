import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useFilterStore } from '../store/useFilterStore';

export const useStats = (month?: string) => {
  const navigate = useNavigate();
  const { setDateFilterMode } = useFilterStore();

  const { data: stats = { 
    totalIncome: 0, 
    totalExpenses: 0, 
    netBalance: 0, 
    chartData: [],
    sortedIncomeRanking: [],
    sortedExpenseRanking: [],
    pendingPayments: 0, 
    activeOS: 0 
  }, isLoading, error, refetch: fetchStats } = useQuery({
    queryKey: ['stats', month],
    queryFn: async () => {
      const res = await axios.get('/api/stats', { params: { month } });
      return res.data;
    }
  });

  const handleChartClick = useCallback((data: any) => {
    if (data && data.activeLabel) {
      setDateFilterMode('month');
      navigate('/transactions');
    }
  }, [navigate, setDateFilterMode]);

  return {
    stats,
    isLoading,
    error: error instanceof Error ? error.message : null,
    fetchStats,
    handleChartClick
  };
};
