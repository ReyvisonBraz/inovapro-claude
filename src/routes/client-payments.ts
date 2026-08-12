import { Router, Response } from 'express';
import { ClientPaymentSchema, PaymentRegisterSchema } from '../schemas/index.js';
import { info } from '../lib/server-logger.js';
import { clientPaymentService } from '../services/client-payment.service.js';
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

  const result = await clientPaymentService.findMany({ page, limit, search });
  res.json(result);
}));

router.post('/', validate(ClientPaymentSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const payment = await clientPaymentService.create({ ...req.body, createdBy: req.user.userId });
  await writeAudit(req, 'create', 'client-payment', payment.id, { customerId: payment.customerId, totalAmount: payment.totalAmount });

  info('Pagamento criado', { details: { id: payment.id, customerId: payment.customerId, totalAmount: payment.totalAmount } });
  res.status(201).json(payment);
}));

router.patch('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const { paidAmount, status, version } = req.body;
  const expectedVersion = typeof version === 'number' ? version : undefined;
  const id = parseInt(req.params.id ?? '');
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
  await clientPaymentService.update(id, {
    paidAmount, status, updatedBy: req.user.userId
  }, expectedVersion);
  await writeAudit(req, 'update', 'client-payment', id, { fields: ['paidAmount', 'status'] });

  res.json({ success: true });
}));

router.post('/:id/pay', validate(PaymentRegisterSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const { amount, date } = req.body;
  const paymentId = parseInt(req.params.id ?? '');
  if (isNaN(paymentId)) { res.status(400).json({ error: 'ID inválido' }); return; }

  const result = await clientPaymentService.registerPayment(paymentId, { amount, date, updatedBy: req.user.userId });
  await writeAudit(req, 'payment', 'client-payment', paymentId, { amount, date, newStatus: result.newStatus });

  info('Pagamento registrado', { details: { id: paymentId, amount, newStatus: result.newStatus } });
  res.json({ success: true, ...result });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const paymentId = parseInt(req.params.id ?? '');
  await clientPaymentService.delete(paymentId);
  await writeAudit(req, 'delete', 'client-payment', paymentId);

  info('Pagamento excluído', { details: { id: paymentId } });
  res.status(204).end();
}));

export default router;
