import { Router, Request, Response } from 'express';
import { ClientPaymentSchema, PaymentRegisterSchema } from './schemas.js';
import { info } from '../lib/server-logger.js';
import { clientPaymentService } from '../services/client-payment.service.js';
import { validate } from '../middleware/validate.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;

  const result = await clientPaymentService.findMany({ page, limit, search });
  res.json(result);
}));

router.post('/', validate(ClientPaymentSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const payment = await clientPaymentService.create({ ...req.body, createdBy: req.user!.userId });

  info('Pagamento criado', { details: { id: payment.id, customerId: payment.customerId, totalAmount: payment.totalAmount } });
  res.status(201).json({ id: payment.id });
}));

router.patch('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { paidAmount, status, paymentHistory, version } = req.body;
  const expectedVersion = typeof version === 'number' ? version : undefined;
  await clientPaymentService.update(parseInt(req.params.id), {
    paidAmount, status, paymentHistory, updatedBy: req.user!.userId
  }, expectedVersion);

  res.json({ success: true });
}));

router.post('/:id/pay', validate(PaymentRegisterSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, date } = req.body;
  const paymentId = parseInt(req.params.id);

  const result = await clientPaymentService.registerPayment(paymentId, { amount, date, updatedBy: req.user!.userId });

  info('Pagamento registrado', { details: { id: paymentId, amount, newStatus: result.newStatus } });
  res.json({ success: true, ...result });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  await clientPaymentService.delete(paymentId);

  info('Pagamento excluído', { details: { id: paymentId } });
  res.status(204).end();
}));

export default router;