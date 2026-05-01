import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { CustomerSchema } from './schemas.js';
import { error, info } from '../lib/server-logger.js';
import { z } from 'zod';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { nickname: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { companyName: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { firstName: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);
    res.json({ data: customers, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    error('[CUSTOMERS GET] Erro ao listar clientes', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = CustomerSchema.parse(req.body);
    const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit } = validatedData;
    const customer = await prisma.customer.create({
      data: { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit },
    });
    info('Cliente criado', { details: { id: customer.id, name: `${firstName} ${lastName}` } });
    res.json({ id: customer.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[CUSTOMERS POST] Erro ao criar cliente', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const validatedData = CustomerSchema.parse(req.body);
    const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit } = validatedData;
    const fullName = `${firstName} ${lastName}`;
    await prisma.customer.update({
      where: { id: customerId },
      data: { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit },
    });
    await prisma.serviceOrder.updateMany({ where: { customerId }, data: { firstName, lastName, phone } });
    await prisma.transaction.updateMany({ where: { customerId }, data: { customerName: fullName, customerPhone: phone } });
    info('Cliente atualizado', { details: { id: customerId, name: fullName } });
    res.json({ success: true, cascadeUpdated: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[CUSTOMERS PUT] Erro ao atualizar cliente', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id/payments', async (req: Request, res: Response) => {
  try {
    const payments = await prisma.clientPayment.findMany({
      where: { customerId: parseInt(req.params.id) },
    });
    res.json(payments);
  } catch (err) {
    error('[CUSTOMERS/:id/payments] Erro ao buscar pagamentos do cliente', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const payments = await prisma.clientPayment.findMany({ where: { customerId } });
    for (const p of payments) {
      await prisma.transaction.deleteMany({ where: { paymentId: p.id } });
      await prisma.receipt.deleteMany({ where: { paymentId: p.id } });
    }
    await prisma.clientPayment.deleteMany({ where: { customerId } });
    await prisma.serviceOrder.deleteMany({ where: { customerId } });
    await prisma.customer.delete({ where: { id: customerId } });
    info('Cliente excluído com dados relacionados', { details: { id: customerId } });
    res.json({ success: true });
  } catch (err: any) {
    error('[CUSTOMERS DELETE] Erro ao excluir cliente', err, { details: { id: req.params.id } });
    res.status(400).json({ error: 'Não foi possível excluir cliente' });
  }
});

export default router;
