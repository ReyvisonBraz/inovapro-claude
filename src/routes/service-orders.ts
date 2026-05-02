import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ServiceOrderSchema } from './schemas.js';
import { error, info } from '../lib/server-logger.js';
import { z } from 'zod';

const router = Router();

const safeParseJSON = (str: string | null | undefined, fallback: unknown = []) => {
  try { return str ? JSON.parse(str) : fallback; }
  catch { return fallback; }
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const sortBy = req.query.sortBy as string || 'newest';
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { id: parseInt(search) || 0 },
        { equipmentBrand: { contains: search, mode: 'insensitive' } },
        { equipmentModel: { contains: search, mode: 'insensitive' } },
        { equipmentType: { contains: search, mode: 'insensitive' } },
        { equipmentSerial: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    let orderBy: Record<string, string> | Array<Record<string, string>> = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'priority') orderBy = [{ priority: 'asc' }, { createdAt: 'desc' }];
    if (sortBy === 'amount-desc') orderBy = { totalAmount: 'desc' };
    if (sortBy === 'amount-asc') orderBy = { totalAmount: 'asc' };
    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy, include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
      }),
      prisma.serviceOrder.count({ where }),
    ]);
    const data = orders.map(o => ({
      ...o,
      firstName: o.customer.firstName,
      lastName: o.customer.lastName,
      phone: o.customer.phone,
      partsUsed: safeParseJSON(o.partsUsed as string, []),
      services: safeParseJSON(o.services as string, []),
    }));
    res.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    error('[SERVICE_ORDERS GET] Erro ao listar ordens de serviço', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
    });
    if (!order) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }
    res.json({
      ...order,
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      phone: order.customer.phone,
      partsUsed: safeParseJSON(order.partsUsed as string, []),
      services: safeParseJSON(order.services as string, []),
    });
  } catch (err) {
    error('[SERVICE_ORDERS GET/:id] Erro ao buscar OS', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = ServiceOrderSchema.parse(req.body);
    const { customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial,
      reportedProblem, arrivalPhotoUrl, arrivalPhotoBase64, status, entryDate, analysisPrediction,
      customerPassword, accessories, ramInfo, ssdInfo, priority, createdBy, technicalAnalysis,
      servicesPerformed, services, partsUsed, serviceFee, totalAmount, finalObservations } = validatedData;
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    const order = await prisma.serviceOrder.create({
      data: {
        customerId, firstName: customer?.firstName, lastName: customer?.lastName, phone: customer?.phone,
        equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, reportedProblem,
        arrivalPhotoUrl, arrivalPhotoBase64, status: status || 'Aguardando Análise', entryDate,
        analysisPrediction, customerPassword, accessories, ramInfo, ssdInfo, priority: priority || 'medium',
        createdBy: createdBy || 1, technicalAnalysis, servicesPerformed,
        services: JSON.stringify(services || []), partsUsed: JSON.stringify(partsUsed || []),
        serviceFee: serviceFee || 0, totalAmount: totalAmount || 0, finalObservations,
      },
    });
    info('Ordem de serviço criada', { details: { id: order.id, customerId } });
    res.json({ id: order.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[SERVICE_ORDERS POST] Erro ao criar OS', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = ServiceOrderSchema.partial().parse(req.body);
    const fields = ['status', 'technicalAnalysis', 'servicesPerformed', 'services', 'partsUsed',
      'serviceFee', 'totalAmount', 'finalObservations', 'entryDate', 'analysisPrediction',
      'customerPassword', 'accessories', 'ramInfo', 'ssdInfo', 'priority', 'equipmentType',
      'equipmentBrand', 'equipmentModel', 'equipmentColor', 'equipmentSerial', 'arrivalPhotoBase64',
      'reportedProblem', 'updatedBy', 'firstName', 'lastName', 'phone'] as const;
    const updateData: Record<string, unknown> = {};
    for (const field of fields) {
      const value = (validatedData as any)[field];
      if (value !== undefined) {
        if (field === 'services' || field === 'partsUsed') {
          updateData[field] = JSON.stringify(value ?? []);
        } else if (typeof value === 'string' && value === '' && ['equipmentType', 'equipmentBrand', 'equipmentModel', 'equipmentColor', 'equipmentSerial', 'reportedProblem', 'technicalAnalysis', 'arrivalPhotoBase64', 'customerPassword', 'accessories', 'ramInfo', 'ssdInfo', 'servicesPerformed', 'finalObservations', 'analysisPrediction'].includes(field)) {
          updateData[field] = null;
        } else {
          updateData[field] = value;
        }
      }
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    const updated = await prisma.serviceOrder.update({ where: { id: parseInt(req.params.id) }, data: updateData as any });
    info('Ordem de serviço atualizada', { details: { id: updated.id } });
    res.json({ success: true, data: { ...updated, services: safeParseJSON(updated.services as string, []), partsUsed: safeParseJSON(updated.partsUsed as string, []) } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[SERVICE_ORDERS PUT] Erro ao atualizar OS', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.serviceOrder.delete({ where: { id: parseInt(req.params.id) } });
    info('Ordem de serviço excluída', { details: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    error('[SERVICE_ORDERS DELETE] Erro ao excluir OS', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

export default router;
