import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../store/useFilterStore';

export const useStats = () => {
  const navigate = useNavigate();
  const { setDateFilterMode } = useFilterStore();
  const [stats, setStats] = useState({ 
    totalIncome: 0, 
    totalExpenses: 0, 
    netBalance: 0, 
    chartData: [],
    sortedIncomeRanking: [],
    sortedExpenseRanking: [],
    pendingPayments: 0, 
    activeOS: 0 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChartClick = useCallback((data: any) => {
    if (data && data.activeLabel) {
      setDateFilterMode('month');
      navigate('/transactions');
    }
  }, [navigate, setDateFilterMode]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    handleChartClick
  };
};
