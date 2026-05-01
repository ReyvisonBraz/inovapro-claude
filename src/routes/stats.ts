import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error } from '../lib/server-logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split('T')[0];

    const [totalIncome, totalExpenses] = await Promise.all([
      prisma.transaction.aggregate({ where: { type: 'income' }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { type: 'expense' }, _sum: { amount: true } }),
    ]);

    const monthlyTransactions = await prisma.transaction.findMany({
      where: { date: { gte: twelveMonthsAgoStr } },
      select: { date: true, type: true, amount: true },
    });

    const byMonth: Record<string, { income: number; expense: number }> = {};
    for (const tx of monthlyTransactions) {
      const month = tx.date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = { income: 0, expense: 0 };
      if (tx.type === 'income') byMonth[month].income += Number(tx.amount);
      else byMonth[month].expense += Number(tx.amount);
    }

    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toISOString().slice(0, 7);
      const name = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
      const { income = 0, expense = 0 } = byMonth[month] || {};
      chartData.push({ name, income, expense });
    }

    const incomeRanking = await prisma.transaction.groupBy({
      by: ['category'], where: { type: 'income' },
      _sum: { amount: true }, orderBy: { _sum: { amount: 'desc' } },
    });

    const expenseRanking = await prisma.transaction.groupBy({
      by: ['category'], where: { type: 'expense' },
      _sum: { amount: true }, orderBy: { _sum: { amount: 'desc' } },
    });

    res.json({
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      netBalance: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
      chartData,
      sortedIncomeRanking: incomeRanking.map(r => [r.category, r._sum.amount || 0]),
      sortedExpenseRanking: expenseRanking.map(r => [r.category, r._sum.amount || 0]),
    });
  } catch (err) {
    error('[STATS] Erro ao calcular estatísticas', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
