import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { OWNER_PERMISSIONS } from '../constants/permissions.js';

const router = Router();

// GET /api/me — reidrata o usuário logado no reload (o cookie httpOnly não é
// legível por JS, então o front pergunta ao servidor quem está autenticado).
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, username: true, role: true, name: true, permissions: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    let permissions: string[] = [];
    try { permissions = JSON.parse(user.permissions || '[]'); } catch { /* empty */ }
    if (user.role === 'owner') permissions = [...OWNER_PERMISSIONS];

    res.json({ user: { ...user, permissions } });
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
