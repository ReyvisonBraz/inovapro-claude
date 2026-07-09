import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { BusinessError } from '../lib/errors.js';

const router = Router();

router.get('/:paymentId', asyncHandler(async (req: Request, res: Response) => {
  const receipts = await prisma.receipt.findMany({
    where: { paymentId: parseInt(req.params.paymentId) },
    orderBy: { createdAt: 'desc' },
  });
  res.json(receipts);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { paymentId, content } = req.body;
  if (!paymentId || !content) {
    throw new BusinessError('paymentId e content são obrigatórios');
  }
  const receipt = await prisma.receipt.create({ data: { paymentId, content } });
  res.status(201).json({ id: receipt.id });
}));

export default router;