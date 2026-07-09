import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const month = (req.query.month as string) || '';
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split('T')[0];

  const monthStart = month ? `${month}-01` : '';
  const monthEnd = month ? (() => {
    const d = new Date(monthStart);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  })() : '';

  const monthFilter = month ? { date: { gte: monthStart, lt: monthEnd } } : {};

  const [totalIncome, totalExpenses, pendingPayments, activeOS, recentTx,
    monthIncome, monthExpenses, monthOS, allOS] = await Promise.all([
    prisma.transaction.aggregate({ where: { type: 'income' }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: 'expense' }, _sum: { amount: true } }),
    prisma.clientPayment.count({ where: { status: { in: ['pending', 'partial'] } } }),
    prisma.serviceOrder.count({ where: { NOT: { status: { in: ['Concluído', 'Cancelado', 'Entregue'] } } } }),
    prisma.transaction.findMany({ orderBy: { date: 'desc' }, take: 5 }),

    month ? prisma.transaction.aggregate({ where: { ...monthFilter, type: 'income' }, _sum: { amount: true } }) : Promise.resolve({ _sum: { amount: 0 } }),
    month ? prisma.transaction.aggregate({ where: { ...monthFilter, type: 'expense' }, _sum: { amount: true } }) : Promise.resolve({ _sum: { amount: 0 } }),
    month ? prisma.serviceOrder.findMany({ where: { entryDate: { gte: monthStart, lt: monthEnd } } }) : Promise.resolve([]),
    prisma.serviceOrder.findMany({ select: { services: true, partsUsed: true } }),
  ]);

  const monthlyTransactions = await prisma.transaction.findMany({
    where: { date: { gte: twelveMonthsAgoStr } },
    select: { date: true, type: true, amount: true },
  });

  const byMonth: Record<string, { income: number; expense: number }> = {};
  for (const tx of monthlyTransactions) {
    const m = tx.date.substring(0, 7);
    if (!byMonth[m]) byMonth[m] = { income: 0, expense: 0 };
    if (tx.type === 'income') byMonth[m].income += Number(tx.amount);
    else byMonth[m].expense += Number(tx.amount);
  }

  const chartData = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.toISOString().slice(0, 7);
    const name = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
    const { income = 0, expense = 0 } = byMonth[m] || {};
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

  const osStatusCount: Record<string, number> = {};
  for (const os of monthOS as unknown[]) {
    const s = (os as { status?: string }).status || 'Sem status';
    osStatusCount[s] = (osStatusCount[s] || 0) + 1;
  }

  const serviceCount: Record<string, { qty: number; revenue: number }> = {};
  for (const os of allOS as unknown[]) {
    try {
      const services = JSON.parse(((os as { services?: string }).services) || '[]');
      for (const s of services) {
        const name = s.name || 'Serviço';
        if (!serviceCount[name]) serviceCount[name] = { qty: 0, revenue: 0 };
        serviceCount[name].qty += 1;
        serviceCount[name].revenue += Number(s.price || 0);
      }
    } catch { /* empty */ }
    try {
      const parts = JSON.parse(((os as { partsUsed?: string }).partsUsed) || '[]');
      for (const p of parts) {
        const name = p.name || 'Peça';
        if (!serviceCount[name]) serviceCount[name] = { qty: 0, revenue: 0 };
        serviceCount[name].qty += Number(p.quantity || 1);
        serviceCount[name].revenue += Number(p.subtotal || 0);
      }
    } catch { /* empty */ }
  }

  const topProducts = Object.entries(serviceCount)
    .sort(([, a], [, b]) => b.qty - a.qty)
    .slice(0, 8)
    .map(([name, data]) => ({ name, ...data }));

  res.json({
    totalIncome: totalIncome._sum.amount || 0,
    totalExpenses: totalExpenses._sum.amount || 0,
    netBalance: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
    chartData,
    sortedIncomeRanking: incomeRanking.map(r => [r.category, r._sum.amount || 0]),
    sortedExpenseRanking: expenseRanking.map(r => [r.category, r._sum.amount || 0]),
    pendingPayments,
    activeOS,
    recentTransactions: recentTx,
    monthIncome: monthIncome._sum.amount || 0,
    monthExpenses: monthExpenses._sum.amount || 0,
    monthNet: ((monthIncome._sum.amount || 0) - (monthExpenses._sum.amount || 0)),
    monthOS,
    monthOSCount: (monthOS as unknown[]).length,
    osStatusCount,
    topProducts,
  });
}));

export default router;