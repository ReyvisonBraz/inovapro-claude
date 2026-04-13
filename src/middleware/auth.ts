/**
 * Middleware de Autenticação JWT
 * 
 * Verifica se o request tem um token JWT válido
 * e anexa os dados do usuário ao request
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Carregar JWT_SECRET do ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

// Interface estendida do Request para incluir usuário
export interface AuthRequest extends Request {
  user?: {
    userId: number
    username: string
    role: string
    // Adicionar outros campos do token se necessário
  }
}

// Tipo para o payload do JWT
interface JwtPayload {
  userId: number
  username: string
  role: string
}

/**
 * Middleware que verifica o token JWT
 * 
 * Uso:
 * import { authMiddleware } from '@/middleware/auth'
 * app.get('/api/protected', authMiddleware, handler)
 */
export const authMiddleware = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): void => {
  // Pega o header Authorization
  const authHeader = req.headers.authorization

  // Verifica se o header existe e começa com "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: 'Token de autenticação não fornecido',
      code: 'NO_TOKEN'
    })
    return
  }

  // Extrai o token (remove "Bearer " do início)
  const token = authHeader.substring(7)

  // Se o token estiver vazio
  if (!token) {
    res.status(401).json({ 
      error: 'Token de autenticação vazio',
      code: 'EMPTY_TOKEN'
    })
    return
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    // Anexa os dados do usuário ao request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    }

    next()
  } catch (error) {
    // Token expirado
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token expirado. Faça login novamente.',
        code: 'TOKEN_EXPIRED'
      })
      return
    }

    // Token inválido (malformado, assinatura errada, etc)
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      })
      return
    }

    // Qualquer outro erro
    console.error('Erro inesperado na verificação do token:', error)
    res.status(401).json({ 
      error: 'Falha na autenticação',
      code: 'AUTH_ERROR'
    })
  }
}

/**
 * Helper para gerar tokens JWT
 * Usado no login e renewal de tokens
 */
export const generateToken = (payload: JwtPayload): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * Helper para verificar se um token está próximo de expirar
 * Útil para implementar refresh token
 */
export const isTokenExpiringSoon = (token: string, minutesThreshold: number = 60): boolean => {
  try {
    const decoded = jwt.decode(token) as JwtPayload & { exp: number }
    if (!decoded || !decoded.exp) return true
    
    const now = Math.floor(Date.now() / 1000)
    const threshold = minutesThreshold * 60
    
    return (decoded.exp - now) < threshold
  } catch {
    return true
  }
}
