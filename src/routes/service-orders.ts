import { Router, Request, Response } from 'express';
import { serviceOrderSchema as ServiceOrderSchema } from '../schemas/serviceOrderSchema.js';
import { error, info } from '../lib/server-logger.js';
import { z } from 'zod';
import { serviceOrderService } from '../services/service-order.service.js';
import { publicOsCache, PUBLIC_OS_KEY } from '../lib/cache.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../lib/errors.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const sortBy = req.query.sortBy as string || 'newest';

    const result = await serviceOrderService.findMany({
      page, limit, search, status, priority, sortBy
    });

    res.json(result);
  } catch (err) {
    error('[SERVICE_ORDERS GET] Erro ao listar ordens de serviço', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const order = await serviceOrderService.findById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }
    
    res.json(order);
  } catch (err) {
    error('[SERVICE_ORDERS GET/:id] Erro ao buscar OS', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', validate(ServiceOrderSchema), async (req: Request, res: Response) => {
  try {
    const order = await serviceOrderService.create(req.body);

    info('Ordem de serviço criada', { details: { id: order.id, customerId: req.body.customerId } });
    res.json({ id: order.id });
  } catch (err) {
    error('[SERVICE_ORDERS POST] Erro ao criar OS', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { _clientUpdatedAt, version, ...bodyRest } = req.body;
    const validatedData = ServiceOrderSchema.partial().parse(bodyRest);
    const expectedVersion = typeof version === 'number' ? version : undefined;

    const updatedOrder = await serviceOrderService.update(id, validatedData, expectedVersion);

    publicOsCache.del(PUBLIC_OS_KEY(id));
    info('Ordem de serviço atualizada', { details: { id: updatedOrder.id } });
    res.json({ success: true, data: updatedOrder });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    if (err.message === 'Nenhum campo para atualizar') {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    error('[SERVICE_ORDERS PUT] Erro ao atualizar OS', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await serviceOrderService.delete(id);

    publicOsCache.del(PUBLIC_OS_KEY(id));
    info('Ordem de serviço excluída', { details: { id } });
    res.json({ success: true });
  } catch (err: any) {
    error('[SERVICE_ORDERS DELETE] Erro ao excluir OS', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

export default router;
