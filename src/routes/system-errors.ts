import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { sanitizeDiagnosticDetails } from '../lib/audit.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

const ClientErrorSchema = z.object({
  id: z.string().min(6).max(64),
  severity: z.enum(['warning', 'error', 'critical']).default('error'),
  operation: z.string().max(200).optional(),
  message: z.string().min(1).max(2000),
  route: z.string().max(500).optional(),
  method: z.string().max(10).optional(),
  statusCode: z.number().int().min(0).max(599).optional(),
  requestId: z.string().max(100).optional(),
  stack: z.string().max(20_000).optional(),
  details: z.unknown().optional(),
});

router.get('/', requireRole('owner'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const unresolved = req.query.unresolved !== 'false';
  const errors = await prisma.systemError.findMany({
    where: unresolved ? { resolved: false } : undefined,
    take: 200,
    orderBy: { timestamp: 'desc' },
  });
  res.json(errors);
}));

router.post('/report', validate(ClientErrorSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await prisma.systemError.upsert({
    where: { id: req.body.id },
    update: {},
    create: {
      id: req.body.id,
      source: 'client',
      severity: req.body.severity,
      operation: req.body.operation,
      message: req.body.message,
      requestId: req.body.requestId || req.requestId,
      route: req.body.route,
      method: req.body.method,
      statusCode: req.body.statusCode,
      stack: req.body.stack,
      userId: req.user?.userId,
      username: req.user?.username,
      details: sanitizeDiagnosticDetails(req.body.details),
    },
  });
  res.status(201).json({ id: event.id });
}));

router.patch('/:id/resolve', requireRole('owner'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await prisma.systemError.update({
    where: { id: req.params.id },
    data: { resolved: true },
  });
  res.json({ id: event.id, resolved: true });
}));

export default router;
