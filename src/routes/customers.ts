import { Router, Request, Response } from 'express';
import { customerSchema as CustomerSchema } from '../schemas/customerSchema.js';
import { error, info } from '../lib/server-logger.js';
import { z } from 'zod';
import { customerService } from '../services/customer.service.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const result = await customerService.findMany({ page, limit, search });
    res.json(result);
  } catch (err) {
    error('[CUSTOMERS GET] Erro ao listar clientes', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = CustomerSchema.parse(req.body);
    const customer = await customerService.create(validatedData);
    
    info('Cliente criado', { details: { id: customer.id, name: `${customer.firstName} ${customer.lastName}` } });
    res.json({ id: customer.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[CUSTOMERS POST] Erro ao criar cliente', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const validatedData = CustomerSchema.parse(req.body);
    
    await customerService.update(customerId, validatedData);
    
    info('Cliente atualizado', { details: { id: customerId, name: `${validatedData.firstName} ${validatedData.lastName}` } });
    res.json({ success: true, cascadeUpdated: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Falha na validação', details: err.issues });
    }
    error('[CUSTOMERS PUT] Erro ao atualizar cliente', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id/payments', async (req: Request, res: Response) => {
  try {
    const payments = await customerService.getPayments(parseInt(req.params.id));
    res.json(payments);
  } catch (err) {
    error('[CUSTOMERS/:id/payments] Erro ao buscar pagamentos do cliente', err, { details: { id: req.params.id } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    await customerService.delete(customerId);
    
    info('Cliente excluído com dados relacionados', { details: { id: customerId } });
    res.json({ success: true });
  } catch (err: any) {
    error('[CUSTOMERS DELETE] Erro ao excluir cliente', err, { details: { id: req.params.id } });
    res.status(400).json({ error: 'Não foi possível excluir cliente' });
  }
});

export default router;

