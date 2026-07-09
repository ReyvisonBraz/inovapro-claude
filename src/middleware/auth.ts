import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('[auth] JWT_SECRET não configurado. Defina a variável de ambiente antes de iniciar o servidor.');
}

const JWT_ACCESS_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

interface AccessPayload extends JwtPayload {
  type: 'access';
}

interface RefreshPayload extends JwtPayload {
  type: 'refresh';
}

export const generateAccessToken = (payload: Omit<AccessPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
};

export const generateRefreshToken = (payload: Omit<RefreshPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

/** Compatibilidade: mantém o nome antigo usado por código externo. */
export const generateToken = generateAccessToken;

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const fromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const fromCookie = (req as Request & { cookies?: Record<string, string> }).cookies?.token;
  const token = fromCookie || fromHeader;

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação necessário' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AccessPayload;

    if (decoded.type !== 'access') {
      res.status(401).json({ error: 'Tipo de token inválido' });
      return;
    }

    req.user = { userId: decoded.userId, username: decoded.username, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export { JWT_REFRESH_EXPIRES_IN };
