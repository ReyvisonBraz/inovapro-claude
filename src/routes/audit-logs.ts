import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error } from '../lib/server-logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } },
    });
    const logsWithUserName = logs.map(l => ({ ...l, userName: l.user?.name || null }));
    res.json(logsWithUserName);
  } catch (err) {
    error('[AUDIT_LOGS] Erro ao listar logs de auditoria', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
