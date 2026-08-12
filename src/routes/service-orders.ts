import { Router, Response } from 'express';
import { serviceOrderSchema as ServiceOrderSchema } from '../schemas/index.js';
import { info } from '../lib/server-logger.js';
import { serviceOrderService } from '../services/service-order.service.js';
import { validate } from '../middleware/validate.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { parseQueryParam, parseQueryInt } from '../lib/query-params.js';
import { writeAudit } from '../lib/audit.js';

const router = Router();

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseQueryInt(req.query.page, 1) ?? 1;
  const limit = parseQueryInt(req.query.limit, 20) ?? 20;
  const search = parseQueryParam(req.query.search);
  const status = parseQueryParam(req.query.status);
  const priority = parseQueryParam(req.query.priority);
  const sortBy = parseQueryParam(req.query.sortBy, 'newest');

  const result = await serviceOrderService.findMany({
    page, limit, search, status, priority, sortBy
  });

  res.json(result);
}));

router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id ?? '');
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
  const order = await serviceOrderService.findById(id);

  if (!order) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
  }

  res.json(order);
}));

router.post('/', validate(ServiceOrderSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const order = await serviceOrderService.create({ ...req.body, createdBy: req.user.userId });
  await writeAudit(req, 'create', 'service-order', order.id, { customerId: req.body.customerId, status: order.status });

  info('Ordem de serviço criada', { details: { id: order.id, customerId: req.body.customerId } });
  res.status(201).json(order);
}));

router.put('/:id', validate(ServiceOrderSchema.partial()), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const id = parseInt(req.params.id ?? '');
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
  const { version, ...rest } = req.body;
  const expectedVersion = typeof version === 'number' ? version : undefined;

  const updatedOrder = await serviceOrderService.update(id, { ...rest, updatedBy: req.user.userId }, expectedVersion);
  await writeAudit(req, 'update', 'service-order', id, { fields: Object.keys(rest), status: updatedOrder.status });

  info('Ordem de serviço atualizada', { details: { id: updatedOrder.id } });
  res.json({ success: true, data: updatedOrder });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id ?? '');
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
  await serviceOrderService.delete(id);
  await writeAudit(req, 'delete', 'service-order', id);

  info('Ordem de serviço excluída', { details: { id } });
  res.status(204).end();
}));

export default router;
