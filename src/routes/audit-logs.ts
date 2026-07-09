import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { timestamp: 'desc' },
    include: { user: { select: { name: true } } },
  });
  const logsWithUserName = logs.map(l => ({ ...l, userName: l.user?.name || null }));
  res.json(logsWithUserName);
}));

export default router;