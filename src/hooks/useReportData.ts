import { useMemo } from 'react';
import { format as formatDate, parseISO, subDays, subMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '../types';
import { useFilterStore } from '../store/useFilterStore';

export type ChartPeriod = '7d' | '30d' | '90d' | '12m' | 'custom';

export interface KPICard {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  format: 'currency' | 'number' | 'percent';
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function useReportData(
  transactions: Transaction[],
  chartPeriod: ChartPeriod
) {
  const {
    reportStartDate,
    reportEndDate,
    reportTypeFilter,
    reportCategoryFilter,
  } = useFilterStore();

  const dateRange = useMemo(() => {
    const end = reportEndDate ? new Date(reportEndDate) : new Date();
    let start: Date;

    switch (chartPeriod) {
      case '7d': start = subDays(end, 7); break;
      case '30d': start = subDays(end, 30); break;
      case '90d': start = subDays(end, 90); break;
      case '12m': start = subMonths(end, 12); break;
      case 'custom':
      default: start = reportStartDate ? new Date(reportStartDate) : subDays(end, 30);
    }
    return { start, end };
  }, [chartPeriod, reportStartDate, reportEndDate]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      if (!isWithinInterval(txDate, { start: startOfDay(dateRange.start), end: endOfDay(dateRange.end) })) return false;
      if (reportTypeFilter !== 'all' && tx.type !== reportTypeFilter) return false;
      if (reportCategoryFilter !== 'all' && tx.category !== reportCategoryFilter) return false;
      return true;
    });
  }, [transactions, dateRange, reportTypeFilter, reportCategoryFilter]);

  const kpis = useMemo<KPICard[]>(() => {
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const transactionCount = filteredTransactions.length;
    const avgTransaction = transactionCount > 0 ? balance / transactionCount : 0;

    const periodDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const prevStart = new Date(dateRange.start.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    const prevEnd = new Date(dateRange.start.getTime() - 1);

    const prevTx = transactions.filter(tx => isWithinInterval(new Date(tx.date), { start: prevStart, end: prevEnd }));
    const prevIncome = prevTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevBalance = prevIncome - prevExpense;

    const incomeTrend = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseTrend = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;
    const balanceTrend = prevBalance !== 0 ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 : 0;

    return [
      { id: 'income', label: 'Total Receitas', value: totalIncome, previousValue: prevIncome, format: 'currency' as const, color: 'emerald', trend: incomeTrend >= 0 ? 'up' as const : 'down' as const },
      { id: 'expense', label: 'Total Despesas', value: totalExpense, previousValue: prevExpense, format: 'currency' as const, color: 'rose', trend: expenseTrend <= 0 ? 'up' as const : 'down' as const },
      { id: 'balance', label: 'Saldo', value: balance, previousValue: prevBalance, format: 'currency' as const, color: balance >= 0 ? 'emerald' : 'rose', trend: balanceTrend >= 0 ? 'up' as const : 'down' as const },
      { id: 'count', label: 'Transações', value: transactionCount, format: 'number' as const, color: 'blue', trend: 'neutral' as const },
      { id: 'avg', label: 'Média/Transação', value: avgTransaction, format: 'currency' as const, color: 'purple', trend: 'neutral' as const },
    ];
  }, [filteredTransactions, dateRange, transactions]);

  const monthlyBarData = useMemo(() => {
    const byMonth: Record<string, { income: number; expense: number }> = {};
    const current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      const monthKey = formatDate(current, 'yyyy-MM');
      byMonth[monthKey] = { income: 0, expense: 0 };
      current.setMonth(current.getMonth() + 1);
    }
    filteredTransactions.forEach(tx => {
      const monthKey = tx.date.substring(0, 7);
      if (byMonth[monthKey]) {
        if (tx.type === 'income') byMonth[monthKey].income += tx.amount;
        else byMonth[monthKey].expense += tx.amount;
      }
    });
    return Object.entries(byMonth).map(([month, data]) => ({
      month: formatDate(parseISO(`${month}-01`), 'MMM', { locale: ptBR }).toUpperCase(),
      fullMonth: month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }));
  }, [filteredTransactions, dateRange]);

  const categoryPieData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    filteredTransactions.forEach(tx => { byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount; });
    const colors = ['#1152d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    return Object.entries(byCategory)
      .map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const trendLineData = useMemo(() => {
    const byDay: Record<string, { income: number; expense: number; balance: number }> = {};
    const current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      const dayKey = formatDate(current, 'yyyy-MM-dd');
      byDay[dayKey] = { income: 0, expense: 0, balance: 0 };
      current.setDate(current.getDate() + 1);
    }
    filteredTransactions.forEach(tx => {
      const dayKey = tx.date;
      if (byDay[dayKey]) {
        if (tx.type === 'income') byDay[dayKey].income += tx.amount;
        else byDay[dayKey].expense += tx.amount;
        byDay[dayKey].balance = byDay[dayKey].income - byDay[dayKey].expense;
      }
    });
    let cumulative = 0;
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        cumulative += data.balance;
        return { date: formatDate(parseISO(date), 'dd/MM'), fullDate: date, ...data, cumulative };
      });
  }, [filteredTransactions, dateRange]);

  const cashFlowData = useMemo(() => {
    let runningBalance = 0;
    return trendLineData.map(d => {
      runningBalance += d.cumulative;
      return { ...d, runningBalance };
    });
  }, [trendLineData]);

  const topCategories = useMemo(() => categoryPieData.slice(0, 5), [categoryPieData]);

  return { dateRange, filteredTransactions, kpis, monthlyBarData, categoryPieData, trendLineData, cashFlowData, topCategories };
}