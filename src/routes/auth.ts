import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';
import { verifyPassword } from '../lib/password.js';
import { makeLoginLimiter } from '../lib/rate-limit.js';
import { error, info } from '../lib/server-logger.js';
import { OWNER_PERMISSIONS } from '../constants/permissions.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const ACCESS_COOKIE = 'token';
const REFRESH_COOKIE = 'refreshToken';
const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
});
const refreshMs = 7 * 24 * 60 * 60 * 1000;
const accessMs = 15 * 60 * 1000;

const loginLimiter = makeLoginLimiter();

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
    const payload = { userId: user.id, username: user.username, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const { password: _, ...userWithoutPassword } = user;
    res.cookie(ACCESS_COOKIE, accessToken, { ...authCookieOptions(), maxAge: accessMs });
    res.cookie(REFRESH_COOKIE, refreshToken, { ...authCookieOptions(), maxAge: refreshMs });
    info('Login bem-sucedido', { details: { username, role: user.role } });
    res.json({ token: accessToken, user: { ...userWithoutPassword, permissions } });
  } catch (err) {
    error('Erro no login', err, { route: '/api/login' });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[REFRESH_COOKIE];
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token necessário' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { type: string; userId: number; username: string; role: string };
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Tipo de token inválido' });
    }
    const accessToken = generateAccessToken({ userId: decoded.userId, username: decoded.username, role: decoded.role });
    res.cookie(ACCESS_COOKIE, accessToken, { ...authCookieOptions(), maxAge: accessMs });
    return res.json({ success: true });
  } catch {
    return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
  }
}));

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(ACCESS_COOKIE, authCookieOptions());
  res.clearCookie(REFRESH_COOKIE, authCookieOptions());
  res.json({ success: true });
});

export default router;
