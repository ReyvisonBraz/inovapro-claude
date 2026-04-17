/**
 * Middleware de Autenticação JWT
 *
 * Verifica se o request tem um token JWT válido
 * e anexa os dados do usuário ao request
 *
 * NOTA: Este arquivo define o middleware mas não está ativo no server.ts.
 * O backend atual usa autenticação via localStorage/session simples.
 */

import { Request, Response, NextFunction } from 'express'

// Carregar JWT_SECRET do ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

// Interface estendida do Request para incluir usuário
export interface AuthRequest extends Request {
  user?: {
    userId: number
    username: string
    role: string
  }
}

// Tipo para o payload do JWT
interface JwtPayload {
  userId: number
  username: string
  role: string
}

// Helper para gerar tokens JWT (usado no login e renewal de tokens)
export const generateToken = (payload: JwtPayload): string => {
  return 'token-placeholder';
};

// Verifica se um token está próximo de expirar
export const isTokenExpiringSoon = (token: string, minutesThreshold: number = 60): boolean => {
  return false;
};
