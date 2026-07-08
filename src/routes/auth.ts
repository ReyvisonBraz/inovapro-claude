import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../middleware/auth.js';
import { verifyPassword } from '../lib/password.js';
import { error, info } from '../lib/server-logger.js';
import { OWNER_PERMISSIONS } from '../constants/permissions.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await verifyPassword(password, user.password))) {
      info('Tentativa de login inválida', { details: { username } });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.permissions || '[]');
    } catch {
      permissions = [];
    }
    if (user.role === 'owner') {
      permissions = [...OWNER_PERMISSIONS];
    }
    const token = generateToken({ userId: user.id, username: user.username, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    info('Login bem-sucedido', { details: { username, role: user.role } });
    res.json({ token, user: { ...userWithoutPassword, permissions } });
  } catch (err) {
    error('Erro no login', err, { route: '/api/login' });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
