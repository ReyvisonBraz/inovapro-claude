import { Router, Response } from 'express';
import { TransactionSchema } from '../schemas/index.js';
import { info } from '../lib/server-logger.js';
import { transactionService } from '../services/transaction.service.js';
import { validate } from '../middleware/validate.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { parseQueryParam, parseQueryInt, parseQueryFloat } from '../lib/query-params.js';
import { writeAudit } from '../lib/audit.js';

const router = Router();

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseQueryInt(req.query.page, 1) ?? 1;
  const limit = parseQueryInt(req.query.limit, 20) ?? 20;
  const search = parseQueryParam(req.query.search);
  const type = parseQueryParam(req.query.type);
  const category = parseQueryParam(req.query.category);
  const startDate = parseQueryParam(req.query.startDate);
  const endDate = parseQueryParam(req.query.endDate);
  const minAmount = parseQueryFloat(req.query.minAmount);
  const maxAmount = parseQueryFloat(req.query.maxAmount);

  const result = await transactionService.findMany({
    page, limit, search, type, category, startDate, endDate, minAmount, maxAmount
  });

  res.json(result);
}));

router.post('/', validate(TransactionSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const transaction = await transactionService.create({ ...req.body, createdBy: req.user.userId });
  await writeAudit(req, 'create', 'transaction', transaction.id, { type: transaction.type, amount: transaction.amount });

  info('Transação criada', { details: { id: transaction.id, description: transaction.description, type: transaction.type, amount: transaction.amount, date: transaction.date } });
  res.status(201).json({ id: transaction.id });
}));

router.put('/:id', validate(TransactionSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const id = parseInt(req.params.id ?? '');
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
  const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;
  await transactionService.update(id, { ...req.body, updatedBy: req.user.userId }, expectedVersion);
  await writeAudit(req, 'update', 'transaction', id, { fields: Object.keys(req.body) });

  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const txId = parseInt(req.params.id ?? '');
  const tx = await transactionService.delete(txId);
  await writeAudit(req, 'delete', 'transaction', txId, { linkedPaymentId: tx?.paymentId });

  if (tx?.paymentId) {
    info('Transação excluída — valor ajustado no pagamento vinculado', { details: { id: txId, paymentId: tx.paymentId } });
    res.json({
      success: true,
      warning: `Esta transação fazia parte de um pagamento (ID ${tx.paymentId}). ` +
        `O valor foi descontado do total pago. O saldo do pagamento foi recalculado automaticamente.`
    });
  } else {
    info('Transação excluída', { details: { id: txId } });
    res.json({ success: true });
  }
}));

export default router;
