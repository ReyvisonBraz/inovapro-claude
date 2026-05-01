import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error, info } from '../lib/server-logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const [customers, transactions, serviceOrders, clientPayments, categories, brands, models, equipmentTypes] = await Promise.all([
      prisma.customer.findMany(),
      prisma.transaction.findMany(),
      prisma.serviceOrder.findMany(),
      prisma.clientPayment.findMany(),
      prisma.category.findMany(),
      prisma.brand.findMany(),
      prisma.model.findMany(),
      prisma.equipmentType.findMany(),
    ]);
    const data = {
      exportedAt: new Date().toISOString(),
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
  } catch (err) {
    error('[EXPORT] Erro ao exportar dados', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
