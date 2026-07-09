import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../middleware/auth.js';
import { verifyPassword } from '../lib/password.js';
import { error, info } from '../lib/server-logger.js';
import { OWNER_PERMISSIONS } from '../constants/permissions.js';

const router = Router();

// Opções do cookie de sessão (httpOnly = inacessível a JS, mitiga roubo por XSS).
// Em produção: SameSite=None + Secure (necessário se front e API em domínios distintos).
const AUTH_COOKIE = 'token';
const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
});

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
    // Cookie httpOnly é a fonte primária; `token` no corpo fica por transição.
    res.cookie(AUTH_COOKIE, token, { ...authCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
    info('Login bem-sucedido', { details: { username, role: user.role } });
    res.json({ token, user: { ...userWithoutPassword, permissions } });
  } catch (err) {
    error('Erro no login', err, { route: '/api/login' });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout: limpa o cookie de sessão (público — não exige o token válido).
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE, authCookieOptions());
  res.json({ success: true });
});

export default router;
