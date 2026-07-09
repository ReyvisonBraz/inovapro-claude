import { Router, Request, Response } from 'express';
import { customerSchema as CustomerSchema } from '../schemas/customerSchema.js';
import { info } from '../lib/server-logger.js';
import { customerService } from '../services/customer.service.js';
import { validate } from '../middleware/validate.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;

  const result = await customerService.findMany({ page, limit, search });
  res.json(result);
}));

router.post('/', validate(CustomerSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { forceCreate, ...rest } = req.body;
  const customerData = { ...rest, createdBy: req.user!.userId };

  if (!forceCreate) {
    const existingByPhone = await customerService.findByPhone(customerData.phone);
    if (existingByPhone) {
      return res.status(409).json({
        error: 'duplicate_phone',
        existing: {
          id: existingByPhone.id,
          name: `${existingByPhone.firstName} ${existingByPhone.lastName}`.trim(),
        },
      });
    }
  }

  const customer = await customerService.create(customerData);
  info('Cliente criado', { details: { id: customer.id, name: `${customer.firstName} ${customer.lastName}` } });
  res.status(201).json({ id: customer.id });
}));

router.put('/:id', validate(CustomerSchema.partial()), asyncHandler(async (req: AuthRequest, res: Response) => {
  const customerId = parseInt(req.params.id);
  const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;
  const { version: _version, forceCreate: _forceCreate, ...rest } = req.body;
  await customerService.update(customerId, { ...rest, updatedBy: req.user!.userId }, expectedVersion);

  info('Cliente atualizado', { details: { id: customerId, name: `${req.body.firstName ?? ''} ${req.body.lastName ?? ''}` } });
  res.json({ success: true, cascadeUpdated: true });
}));

router.get('/:id/payments', asyncHandler(async (req: Request, res: Response) => {
  const payments = await customerService.getPayments(parseInt(req.params.id));
  res.json(payments);
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const customerId = parseInt(req.params.id);
  await customerService.delete(customerId);

  info('Cliente excluído com dados relacionados', { details: { id: customerId } });
  res.status(204).end();
}));

export default router;