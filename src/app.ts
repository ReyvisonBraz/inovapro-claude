/**
 * ============================================================================
 * INOVA PRO — fábrica do app Express (separada do boot para testes)
 * ============================================================================
 * Monta a aplicação com todas as rotas/middleware. O boot (process handlers,
 * teste de conexão, listen) fica em server.ts, que é o ponto de entrada.
 */

import express, { Express } from 'express';
import 'dotenv/config';
import './lib/serialize.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { requireAuth } from './middleware/auth.js';
import { idempotencyMiddleware } from './middleware/idempotency.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import protectedRoutes from './routes/index.js';
import meRoutes from './routes/me.js';
import healthRoutes from './routes/health.js';
import { requestLogger, errorHandler, warn } from './lib/server-logger.js';
import { makeApiLimiter } from './lib/rate-limit.js';
import { isOriginAllowed } from './lib/cors.js';
import { csrfProtection } from './middleware/csrf.js';
import { AppError } from './lib/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  const app = express();

  /*
   * ─── Middleware Global ───
   */

  // Helmet com CSP explícita (antes estava desligada).
  // Origem da API quando o front está em domínio separado (opcional).
  const apiOrigin = process.env.PUBLIC_API_ORIGIN;
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],       // estilos injetados (motion/inline)
        imgSrc: ["'self'", 'data:', 'https:'],           // avatares/QR/base64/storage
        connectSrc: ["'self'", ...(apiOrigin ? [apiOrigin] : [])],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  }));

  // CORS: decisão isolada e testável em src/lib/cors.ts.
  // Origem desconhecida é REJEITADA (antes o código liberava tudo em produção).
  app.use(cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, process.env.NODE_ENV)) {
        callback(null, true);
      } else {
        callback(new AppError('Origem não permitida pelo CORS', 403));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Idempotency-Key'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  }));

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));
  app.use(cookieParser());

  // Logger de requisições
  app.use(requestLogger);

  /*
   * ─── Health Check (sem vazar ambiente) ───
   * /health e /ping minimalistas. Os antigos /api/ping (vazava DB_HOST/env) e
   * /api/db-test (vazava version() e stack) foram removidos.
   */
  app.use(healthRoutes);        // /health, /ping
  app.use('/api', healthRoutes); // /api/ping (compatibilidade), sem env

  /*
   * ─── Rotas ───
   */
  const apiLimiter = makeApiLimiter();

  /*
   * Aviso de configuração (causa + consequência), não de erro:
   * sem REDIS_URL o rate-limit vira memória por instância serverless — cada
   * instância tem seu contador, então brute-force/abuso de larga escala passa.
   */
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    warn('[STARTUP] REDIS_URL ausente em produção — rate-limit de login/API opera em memória (não compartilhado entre instâncias serverless). Provisione o Redis e defina REDIS_URL (docs/REDIS-SETUP.md) para proteção real contra brute-force.');
  }

  app.use('/api', csrfProtection);
  app.use('/api', idempotencyMiddleware);
  app.use('/api', authRoutes);
  app.use('/api', publicRoutes);
  app.use('/api', apiLimiter, requireAuth, meRoutes);
  app.use('/api', apiLimiter, requireAuth, protectedRoutes);

  /*
   * ─── Servir Frontend em Produção ───
   */
  if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      if (!_req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  /*
   * ─── Handler de Erros Global ───
   */
  app.use(errorHandler);

  return app;
}

export default createApp;
