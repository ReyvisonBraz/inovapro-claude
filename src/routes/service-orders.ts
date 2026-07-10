import { Router, Request, Response } from 'express';
import { serviceOrderSchema as ServiceOrderSchema } from '../schemas/serviceOrderSchema.js';
import { info } from '../lib/server-logger.js';
import { serviceOrderService } from '../services/service-order.service.js';
import { validate } from '../middleware/validate.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
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
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const order = await serviceOrderService.findById(id);

  if (!order) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
  }

  res.json(order);
}));

router.post('/', validate(ServiceOrderSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await serviceOrderService.create({ ...req.body, createdBy: req.user!.userId });

  info('Ordem de serviço criada', { details: { id: order.id, customerId: req.body.customerId } });
  res.status(201).json({ id: order.id });
}));

router.put('/:id', validate(ServiceOrderSchema.partial()), asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const { version, ...rest } = req.body;
  const expectedVersion = typeof version === 'number' ? version : undefined;

  const updatedOrder = await serviceOrderService.update(id, { ...rest, updatedBy: req.user!.userId }, expectedVersion);

  info('Ordem de serviço atualizada', { details: { id: updatedOrder.id } });
  res.json({ success: true, data: updatedOrder });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await serviceOrderService.delete(id);

  info('Ordem de serviço excluída', { details: { id } });
  res.status(204).end();
}));

export default router;