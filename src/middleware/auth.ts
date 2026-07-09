import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('[auth] JWT_SECRET não configurado. Defina a variável de ambiente antes de iniciar o servidor.');
}
const JWT_EXPIRES_IN = '7d';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Aceita o token do cookie httpOnly (preferencial) ou do header Authorization
  // (compatibilidade durante a transição / clientes server-to-server).
  const authHeader = req.headers.authorization;
  const fromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const fromCookie = (req as Request & { cookies?: Record<string, string> }).cookies?.token;
  const token = fromCookie || fromHeader;

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação necessário' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
