import { Router, Request, Response } from 'express';
import { TransactionSchema } from './schemas.js';
import { error, info } from '../lib/server-logger.js';
import { transactionService } from '../services/transaction.service.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../lib/errors.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
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
  } catch (err) {
    error('[TRANSACTIONS GET] Erro ao listar transações', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', validate(TransactionSchema), async (req: Request, res: Response) => {
  try {
    const transaction = await transactionService.create(req.body);

    info('Transação criada', { details: { id: transaction.id, description: transaction.description, type: transaction.type, amount: transaction.amount, date: transaction.date } });
    res.json({ id: transaction.id });
  } catch (err) {
    error('[TRANSACTIONS POST] Erro ao criar transação', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', validate(TransactionSchema), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;
    await transactionService.update(id, req.body, expectedVersion);

    res.json({ success: true });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    error('[TRANSACTIONS PUT] Erro ao atualizar transação', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
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
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    error('[TRANSACTIONS DELETE] Erro ao excluir transação', err, { details: { id: req.params.id } });
    const msg = err?.message || 'Erro interno do servidor';
    res.status(500).json({ error: msg });
  }
});

export default router;
