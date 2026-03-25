import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { AppError } from "./errorHandler.js";

export interface JwtPayload {
  userId: number;
  role: "owner" | "manager" | "employee";
  permissions: string[];
}

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

/**
 * Express middleware: requires a valid JWT in Authorization header.
 * Sets req.user with the decoded token payload.
 */
export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Token de autenticação não fornecido"));
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return next(new AppError(401, "Token inválido ou expirado"));
  }
}

/**
 * Express middleware: requires the user to have a specific role.
 * Must be used AFTER requireAuth.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, "Não autenticado"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Permissão insuficiente"));
    }
    next();
  };
}

/**
 * Express middleware: requires the user to have a specific permission.
 * Must be used AFTER requireAuth.
 */
export function requirePermission(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, "Não autenticado"));
    }
    // Owners always have all permissions
    if (req.user.role === "owner") {
      next();
      return;
    }
    const hasPermission = permissions.every((p) =>
      req.user!.permissions.includes(p)
    );
    if (!hasPermission) {
      return next(new AppError(403, "Permissão insuficiente para esta ação"));
    }
    next();
  };
}
