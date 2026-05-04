import { Router, Request, Response } from 'express';
import { ClientPaymentSchema } from './schemas.js';
import { error, info } from '../lib/server-logger.js';
import { z } from 'zod';
import { clientPaymentService } from '../services/client-payment.service.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const result = await clientPaymentService.findMany({ page, limit, search });
    res.json(result);
  } catch (err) {
    error('[CLIENT_PAYMENTS GET] Erro ao listar pagamentos', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = ClientPaymentSchema.parse(req.body);
    const payment = await clientPaymentService.create(validatedData as any);
    
    info('Pagamento criado', { details: { id: payment.id, customerId: payment.customerId, totalAmount: payment.totalAmount } });
    res.json({ id: payment.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[CLIENT_PAYMENTS POST] Erro ao criar pagamento', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { paidAmount, status, paymentHistory, updatedBy } = req.body;
    await clientPaymentService.update(parseInt(req.params.id), {
      paidAmount, status, paymentHistory, updatedBy
    });
    
    res.json({ success: true });
  } catch (err) {
    error('[CLIENT_PAYMENTS PATCH] Erro ao atualizar pagamento', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/:id/pay', async (req: Request, res: Response) => {
  try {
    const { amount, date, updatedBy } = req.body;
    const paymentId = parseInt(req.params.id);
    
    const result = await clientPaymentService.registerPayment(paymentId, { amount, date, updatedBy });
    
    info('Pagamento registrado', { details: { id: paymentId, amount, newStatus: result.newStatus } });
    res.json({ success: true, ...result });
  } catch (err: any) {
    if (err.message === 'Pagamento não encontrado') {
      return res.status(404).json({ error: err.message });
    }
    error('[CLIENT_PAYMENTS PAY] Erro ao registrar pagamento', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    await clientPaymentService.delete(paymentId);
    
    info('Pagamento excluído', { details: { id: paymentId } });
    res.json({ success: true });
  } catch (err) {
    error('[CLIENT_PAYMENTS DELETE] Erro ao excluir pagamento', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
