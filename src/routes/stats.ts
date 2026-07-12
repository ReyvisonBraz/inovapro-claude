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

  const [totalIncome, totalExpenses, pendingPayments, activeOS, recentTx,
    monthIncome, monthExpenses] = await Promise.all([
    prisma.transaction.aggregate({ where: { type: 'income' }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: 'expense' }, _sum: { amount: true } }),
    prisma.clientPayment.count({ where: { status: { in: ['pending', 'partial'] } } }),
    prisma.serviceOrder.count({ where: { NOT: { status: { in: ['Concluído', 'Cancelado', 'Entregue'] } } } }),
    prisma.transaction.findMany({ orderBy: { date: 'desc' }, take: 5 }),
    month ? prisma.transaction.aggregate({ where: { ...{ date: { gte: monthStart, lt: monthEnd } }, type: 'income' }, _sum: { amount: true } }) : Promise.resolve({ _sum: { amount: 0 } }),
    month ? prisma.transaction.aggregate({ where: { ...{ date: { gte: monthStart, lt: monthEnd } }, type: 'expense' }, _sum: { amount: true } }) : Promise.resolve({ _sum: { amount: 0 } }),
  ]);

  const monthlyData = await prisma.$queryRaw<Array<{ month: string; type: string; total: number }>>`
    SELECT
      TO_CHAR("date", 'YYYY-MM') as month,
      type,
      SUM(amount)::float as total
    FROM "Transaction"
    WHERE "date" >= ${twelveMonthsAgoStr}
    GROUP BY TO_CHAR("date", 'YYYY-MM'), type
  `;

  const byMonth: Record<string, { income: number; expense: number }> = {};
  for (const row of monthlyData) {
    if (!byMonth[row.month]) byMonth[row.month] = { income: 0, expense: 0 };
    if (row.type === 'income') byMonth[row.month].income = row.total;
    else byMonth[row.month].expense = row.total;
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

  const [incomeRanking, expenseRanking, monthOSData, topProductsData] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['category'], where: { type: 'income' },
      _sum: { amount: true }, orderBy: { _sum: { amount: 'desc' } },
    }),
    prisma.transaction.groupBy({
      by: ['category'], where: { type: 'expense' },
      _sum: { amount: true }, orderBy: { _sum: { amount: 'desc' } },
    }),
    month ? prisma.serviceOrder.groupBy({
      by: ['status'],
      where: { entryDate: { gte: monthStart, lt: monthEnd } },
      _count: true,
    }) : Promise.resolve([]),
    prisma.$queryRaw<Array<{ name: string; qty: number; revenue: number }>>`
      SELECT
        COALESCE(svc.name, 'Serviço') as name,
        COUNT(*)::int as qty,
        SUM((svc.price)::float)::float as revenue
      FROM "ServiceOrder",
           jsonb_array_elements("services"::jsonb) AS elem
      CROSS JOIN LATERAL jsonb_to_record(elem) AS svc(name text, price numeric)
      GROUP BY svc.name
      ORDER BY qty DESC
      LIMIT 8
    `,
  ]);

  const osStatusCount: Record<string, number> = {};
  for (const row of monthOSData as Array<{ status: string; _count: number }>) {
    osStatusCount[row.status || 'Sem status'] = row._count;
  }

  res.json({
    totalIncome: Number(totalIncome._sum.amount || 0),
    totalExpenses: Number(totalExpenses._sum.amount || 0),
    netBalance: Number(totalIncome._sum.amount || 0) - Number(totalExpenses._sum.amount || 0),
    chartData,
    sortedIncomeRanking: incomeRanking.map(r => [r.category, Number(r._sum.amount || 0)]),
    sortedExpenseRanking: expenseRanking.map(r => [r.category, Number(r._sum.amount || 0)]),
    pendingPayments,
    activeOS,
    recentTransactions: recentTx,
    monthIncome: Number(monthIncome._sum.amount || 0),
    monthExpenses: Number(monthExpenses._sum.amount || 0),
    monthNet: Number(monthIncome._sum.amount || 0) - Number(monthExpenses._sum.amount || 0),
    monthOS: monthOSData,
    monthOSCount: (monthOSData as unknown[]).length,
    osStatusCount,
    topProducts: topProductsData,
  });
}));

export default router;