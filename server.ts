/**
 * ============================================================================
 * INOVA PRO — Servidor Principal (Express + Prisma + PostgreSQL)
 * ============================================================================
 */

import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import { requireAuth } from './src/middleware/auth.js';
import { prisma, testConnection, disconnect } from './src/lib/prisma.js';
import authRoutes from './src/routes/auth.js';
import publicRoutes from './src/routes/public.js';
import protectedRoutes from './src/routes/index.js';
import { requestLogger, errorHandler, error, info } from './src/lib/server-logger.js';
import { isOriginAllowed } from './src/lib/cors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * Handlers de erros não capturados no nível do Node.js.
 */
process.on('uncaughtException', (err) => {
  error('[FATAL] Exceção não capturada', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  error('[FATAL] Rejeição não tratada', reason);
  process.exit(1);
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
      console.warn(`[CORS] Origem bloqueada: ${origin}`);
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));
// O middleware cors() acima já responde ao preflight OPTIONS respeitando a
// allowlist — não há handler manual que ecoe qualquer Origin.

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Logger de requisições
app.use(requestLogger);

/*
 * ─── Health Check e Diagnóstico ───
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0-prisma',
    uptime: process.uptime(),
  });
});

app.get('/api/ping', (_req, res) => {
  res.json({
    ok: true,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'definido' : 'ausente',
      DB_HOST: process.env.DB_HOST || 'ausente',
      NODE_ENV: process.env.NODE_ENV || 'ausente',
    },
  });
});

app.get('/api/db-test', async (_req, res) => {
  try {
    await prisma.$connect();
    const r = await prisma.$queryRawUnsafe('SELECT 1 AS ok, version() AS v');
    await prisma.$disconnect();
    res.json({ ok: true, result: r });
  } catch (err: any) {
    await prisma.$disconnect().catch(() => {});
    res.status(500).json({ ok: false, erro: err?.message || String(err), code: err?.code, stack: err?.stack });
  }
});

/*
 * ─── Rotas ───
 */
app.use('/api', authRoutes);
app.use('/api', publicRoutes);
app.use('/api', requireAuth, protectedRoutes);

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
    console.log(`[SERVER] Rodando em http://localhost:${PORT}`);
  });
}
