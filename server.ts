/**
 * ============================================================================
 * INOVA PRO — Servidor Principal (Express + Prisma + PostgreSQL)
 * ============================================================================
 */

import express from 'express';
import 'dotenv/config';
import './src/lib/serialize.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { requireAuth } from './src/middleware/auth.js';
import { idempotencyMiddleware } from './src/middleware/idempotency.js';
import { testConnection } from './src/lib/prisma.js';
import authRoutes from './src/routes/auth.js';
import publicRoutes from './src/routes/public.js';
import protectedRoutes from './src/routes/index.js';
import meRoutes from './src/routes/me.js';
import healthRoutes from './src/routes/health.js';
import { requestLogger, errorHandler, error, info, persistFatalError } from './src/lib/server-logger.js';
import { makeApiLimiter } from './src/lib/rate-limit.js';
import { isOriginAllowed } from './src/lib/cors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * Handlers de erros não capturados no nível do Node.js.
 */
process.on('uncaughtException', async (err) => {
  error('[FATAL] Exceção não capturada', err);
  await persistFatalError('Exceção não capturada no processo', err);
  if (!process.env.VERCEL) process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  error('[FATAL] Rejeição não tratada', reason);
  await persistFatalError('Rejeição não tratada no processo', reason);
  if (!process.env.VERCEL) process.exit(1);
});

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
      callback(new Error('Origem não permitida pelo CORS'));
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

app.use('/api', idempotencyMiddleware);
app.use('/api', authRoutes);
app.use('/api', publicRoutes);
app.use('/api', apiLimiter, requireAuth, meRoutes);
app.use('/api', apiLimiter, requireAuth, protectedRoutes);

/*
 * ─── Servir Frontend em Produção ───
 */
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  const distPath = path.join(__dirname, 'dist');
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

// Teste de conexão (não bloqueante)
testConnection().catch(err => error('[STARTUP] Falha na conexão com banco de dados', err));

// Exporta o app para a Vercel
export default app;

// Inicia o servidor apenas se não estiver em ambiente de função serverless (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  app.listen(PORT, '0.0.0.0', () => {
    info(`Servidor rodando em http://localhost:${PORT}`, { details: { port: PORT, env: process.env.NODE_ENV || 'development' } });
  });
}
