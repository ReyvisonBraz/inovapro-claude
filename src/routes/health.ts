import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0-prisma',
    uptime: process.uptime(),
  });
});

// Ping minimalista: prova que o processo responde, sem revelar ambiente.
router.get('/ping', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;
