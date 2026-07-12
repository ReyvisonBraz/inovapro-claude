import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { info } from '../lib/server-logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const EXPORT_LIMIT = 5000;

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const [customers, transactions, serviceOrders, clientPayments, categories, brands, models, equipmentTypes] = await Promise.all([
    prisma.customer.findMany({ take: EXPORT_LIMIT }),
    prisma.transaction.findMany({ take: EXPORT_LIMIT, orderBy: { date: 'desc' } }),
    prisma.serviceOrder.findMany({ take: EXPORT_LIMIT, orderBy: { createdAt: 'desc' } }),
    prisma.clientPayment.findMany({ take: EXPORT_LIMIT }),
    prisma.category.findMany(),
    prisma.brand.findMany(),
    prisma.model.findMany(),
    prisma.equipmentType.findMany(),
  ]);
  const data = {
    exportedAt: new Date().toISOString(),
    limit: EXPORT_LIMIT,
    customers, transactions, serviceOrders, clientPayments,
    categories, brands, models, equipmentTypes,
  };
  info('Exportação completa de dados', {
    details: {
      customers: customers.length, transactions: transactions.length,
      serviceOrders: serviceOrders.length, payments: clientPayments.length,
    },
  });
  res.json(data);
}));

export default router;