import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error } from '../lib/server-logger.js';

const router = Router();

router.get('/:paymentId', async (req: Request, res: Response) => {
  try {
    const receipts = await prisma.receipt.findMany({
      where: { paymentId: parseInt(req.params.paymentId) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(receipts);
  } catch (err) {
    error('[RECEIPTS GET] Erro ao buscar recibos', err, { details: { paymentId: req.params.paymentId } });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { paymentId, content } = req.body;
    const receipt = await prisma.receipt.create({ data: { paymentId, content } });
    res.json({ id: receipt.id });
  } catch (err: any) {
    error('[RECEIPTS POST] Erro ao criar recibo', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
