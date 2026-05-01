import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { TransactionSchema } from './schemas.js';
import { error, info } from '../lib/server-logger.js';
import { z } from 'zod';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const category = req.query.category as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const minAmount = parseFloat(req.query.minAmount as string);
    const maxAmount = parseFloat(req.query.maxAmount as string);
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type && type !== 'all') where.type = type;
    if (category && category !== 'all') where.category = category;
    if (startDate) where.date = { ...(where.date as object || {}), gte: startDate };
    if (endDate) where.date = { ...(where.date as object || {}), lte: endDate };
    if (!isNaN(minAmount)) where.amount = { ...(where.amount as object || {}), gte: minAmount };
    if (!isNaN(maxAmount)) where.amount = { ...(where.amount as object || {}), lte: maxAmount };
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
      }),
      prisma.transaction.count({ where }),
    ]);
    res.json({ data: transactions, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    error('[TRANSACTIONS GET] Erro ao listar transações', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = TransactionSchema.parse(req.body);
    const { description, category, type, amount, date, createdBy, customerId, customerName, customerPhone } = validatedData;
    let finalCustomerId = customerId;
    let finalCustomerName = customerName;
    let finalCustomerPhone = customerPhone;
    if (customerId && !customerName) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (customer) {
        finalCustomerName = `${customer.firstName} ${customer.lastName}`;
        finalCustomerPhone = customer.phone;
      }
    }
    const transaction = await prisma.transaction.create({
      data: {
        description, category, type, amount, date,
        createdBy: createdBy || 1,
        customerId: finalCustomerId, customerName: finalCustomerName, customerPhone: finalCustomerPhone,
      },
    });
    info('Transação criada', { details: { id: transaction.id, description, type, amount, date } });
    res.json({ id: transaction.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[TRANSACTIONS POST] Erro ao criar transação', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = TransactionSchema.parse(req.body);
    const { description, category, type, amount, date, updatedBy } = validatedData;
    await prisma.transaction.update({
      where: { id: parseInt(req.params.id) },
      data: { description: description || 'Sem descrição', category, type, amount, date, updatedBy: updatedBy || 1 },
    });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[TRANSACTIONS PUT] Erro ao atualizar transação', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const txId = parseInt(req.params.id);
    const tx = await prisma.transaction.findUnique({ where: { id: txId } });
    if (tx?.paymentId) {
      const payment = await prisma.clientPayment.findUnique({ where: { id: tx.paymentId } });
      if (payment) {
        const newPaidAmount = Math.max(0, payment.paidAmount - tx.amount);
        const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'pending';
        await prisma.clientPayment.update({
          where: { id: tx.paymentId },
          data: { paidAmount: newPaidAmount, status: newStatus },
        });
      }
    }
    await prisma.transaction.delete({ where: { id: txId } });
    info('Transação excluída', { details: { id: txId, paymentId: tx?.paymentId } });
    res.json({ success: true });
  } catch (err) {
    error('[TRANSACTIONS DELETE] Erro ao excluir transação', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
