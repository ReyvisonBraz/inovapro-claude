import { Router, Request, Response } from 'express';
import { TransactionSchema } from './schemas.js';
import { error, info } from '../lib/server-logger.js';
import { z } from 'zod';
import { transactionService } from '../services/transaction.service.js';

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

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = TransactionSchema.parse(req.body);
    const transaction = await transactionService.create(validatedData as any);
    
    info('Transação criada', { details: { id: transaction.id, description: transaction.description, type: transaction.type, amount: transaction.amount, date: transaction.date } });
    res.json({ id: transaction.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[TRANSACTIONS POST] Erro ao criar transação', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = TransactionSchema.parse(req.body);
    
    await transactionService.update(id, validatedData as any);
    
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[TRANSACTIONS PUT] Erro ao atualizar transação', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const txId = parseInt(req.params.id);
    const tx = await transactionService.delete(txId);
    
    info('Transação excluída', { details: { id: txId, paymentId: tx?.paymentId } });
    res.json({ success: true });
  } catch (err) {
    error('[TRANSACTIONS DELETE] Erro ao excluir transação', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
