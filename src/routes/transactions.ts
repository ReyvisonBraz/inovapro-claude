import { Router, Request, Response } from 'express';
import { TransactionSchema } from './schemas.js';
import { info } from '../lib/server-logger.js';
import { transactionService } from '../services/transaction.service.js';
import { validate } from '../middleware/validate.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const type = req.query.type as string;
  const category = req.query.category as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const minAmount = parseFloat(req.query.minAmount as string);
  const maxAmount = parseFloat(req.query.maxAmount as string);

  const result = await transactionService.findMany({
    page, limit, search, type, category, startDate, endDate, minAmount, maxAmount
  });

  res.json(result);
}));

router.post('/', validate(TransactionSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const transaction = await transactionService.create({ ...req.body, createdBy: req.user!.userId });

  info('Transação criada', { details: { id: transaction.id, description: transaction.description, type: transaction.type, amount: transaction.amount, date: transaction.date } });
  res.status(201).json({ id: transaction.id });
}));

router.put('/:id', validate(TransactionSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;
  await transactionService.update(id, { ...req.body, updatedBy: req.user!.userId }, expectedVersion);

  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const txId = parseInt(req.params.id);
  const tx = await transactionService.delete(txId);

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