import { useMemo } from 'react';
import { format, parseISO, eachMonthOfInterval, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '../types';

export const useDashboardStats = (transactions: Transaction[], dashboardMonth: string) => {
  const dashboardTransactions = useMemo(() => {
    return transactions.filter(t => format(parseISO(t.date), 'yyyy-MM') === dashboardMonth);
  }, [transactions, dashboardMonth]);

  const incomeByCategory = useMemo(() => {
    return dashboardTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [dashboardTransactions]);

  const expenseByCategory = useMemo(() => {
    return dashboardTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [dashboardTransactions]);

  const sortedIncomeRanking = useMemo(() => {
    return Object.entries(incomeByCategory)
      .sort(([, a], [, b]) => (b as number) - (a as number)) as [string, number][];
  }, [incomeByCategory]);

  const sortedExpenseRanking = useMemo(() => {
    return Object.entries(expenseByCategory)
      .sort(([, a], [, b]) => (b as number) - (a as number)) as [string, number][];
  }, [expenseByCategory]);

  const chartData = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return last6Months.map(month => {
      const monthName = format(month, 'MMM', { locale: ptBR });
      const monthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), month));
      
      return {
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        fullName: format(month, 'MMMM yyyy', { locale: ptBR }),
        renda: monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
        despesa: monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
        date: month
      };
    });
  }, [transactions]);

  return {
    sortedIncomeRanking,
    sortedExpenseRanking,
    chartData
  };
};
