import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ClientPaymentSchema } from './schemas.js';
import { error, info } from '../lib/server-logger.js';
import { z } from 'zod';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const where: Record<string, unknown> = search ? {
      OR: [
        { description: { contains: search, mode: 'insensitive' } },
        { saleId: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ],
    } : {};
    const [payments, total] = await Promise.all([
      prisma.clientPayment.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { dueDate: 'asc' },
        include: { customer: { select: { firstName: true, lastName: true } } },
      }),
      prisma.clientPayment.count({ where }),
    ]);
    const data = payments.map(p => ({ ...p, customerName: `${p.customer.firstName} ${p.customer.lastName}` }));
    res.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    error('[CLIENT_PAYMENTS GET] Erro ao listar pagamentos', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = ClientPaymentSchema.parse(req.body);
    const { customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, saleId, createdBy } = validatedData;
    const initialPaymentHistory = paidAmount && paidAmount > 0
      ? JSON.stringify([{ amount: paidAmount, date: new Date().toISOString() }])
      : '[]';
    const payment = await prisma.clientPayment.create({
      data: {
        customerId, description, totalAmount, paidAmount: paidAmount || 0, purchaseDate, dueDate,
        paymentMethod, status: status || 'pending', installmentsCount: installmentsCount || 1,
        type: type || 'income', saleId, paymentHistory: initialPaymentHistory,
      },
    });
    if (paidAmount && paidAmount > 0) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente';
      await prisma.transaction.create({
        data: {
          description: `Pagamento: ${description} (${customerName})`, category: 'Vendas',
          type: 'income', amount: paidAmount, date: purchaseDate || new Date().toISOString().split('T')[0],
          createdBy: createdBy || 1, paymentId: payment.id, saleId,
          customerId, customerName, customerPhone: customer?.phone,
        },
      });
    }
    info('Pagamento criado', { details: { id: payment.id, customerId, totalAmount } });
    res.json({ id: payment.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[CLIENT_PAYMENTS POST] Erro ao criar pagamento', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { paidAmount, status, paymentHistory, updatedBy } = req.body;
    const updateData: Record<string, unknown> = { paidAmount, status, updatedBy: updatedBy || 1 };
    if (paymentHistory) updateData.paymentHistory = JSON.stringify(paymentHistory);
    await prisma.clientPayment.update({ where: { id: parseInt(req.params.id) }, data: updateData as any });
    res.json({ success: true });
  } catch (err) {
    error('[CLIENT_PAYMENTS PATCH] Erro ao atualizar pagamento', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/:id/pay', async (req: Request, res: Response) => {
  try {
    const { amount, date, updatedBy } = req.body;
    const paymentId = parseInt(req.params.id);
    const payment = await prisma.clientPayment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    const newPaidAmount = payment.paidAmount + amount;
    const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'partial';
    let history: Array<{ amount: number; date: string }> = [];
    try { history = JSON.parse(payment.paymentHistory || '[]'); } catch { /* empty */ }
    history.push({ amount, date: date || new Date().toISOString() });
    await prisma.clientPayment.update({
      where: { id: paymentId },
      data: {
        paidAmount: newPaidAmount, status: newStatus,
        paymentHistory: JSON.stringify(history), updatedBy: updatedBy || 1,
      },
    });
    const customer = await prisma.customer.findUnique({ where: { id: payment.customerId } });
    const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente';
    await prisma.transaction.create({
      data: {
        description: `Recebimento: ${payment.description} (${customerName})`, category: 'Vendas',
        type: 'income', amount, date: (date || new Date().toISOString()).split('T')[0],
        createdBy: updatedBy || 1, paymentId, saleId: payment.saleId || null,
        customerId: payment.customerId, customerName, customerPhone: customer?.phone,
      },
    });
    info('Pagamento registrado', { details: { id: paymentId, amount, newStatus } });
    res.json({ success: true, newPaidAmount, newStatus });
  } catch (err) {
    error('[CLIENT_PAYMENTS PAY] Erro ao registrar pagamento', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    await prisma.transaction.deleteMany({ where: { paymentId } });
    await prisma.clientPayment.delete({ where: { id: paymentId } });
    info('Pagamento excluído', { details: { id: paymentId } });
    res.json({ success: true });
  } catch (err) {
    error('[CLIENT_PAYMENTS DELETE] Erro ao excluir pagamento', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
