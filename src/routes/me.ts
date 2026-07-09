import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { OWNER_PERMISSIONS } from '../constants/permissions.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { NotFoundError } from '../lib/errors.js';

const router = Router();

router.get('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, username: true, role: true, name: true, permissions: true },
  });
  if (!user) throw new NotFoundError('Usuário não encontrado');

  let permissions: string[] = [];
  try { permissions = JSON.parse(user.permissions || '[]'); } catch { /* empty */ }
  if (user.role === 'owner') permissions = [...OWNER_PERMISSIONS];

  res.json({ user: { ...user, permissions } });
}));

export default router;