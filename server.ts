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
import protectedRoutes from './src/routes/index.js';
import { requestLogger, errorHandler, error, info } from './src/lib/server-logger.js';

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

// Helmet: segurança HTTP ajustada para cross-origin
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));

// Configuração robusta de CORS
const allowedOrigins = [
  'https://inovapro-theta.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (como ferramentas de teste)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
    
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // Em produção, vamos ser liberais por enquanto para debugar, mas logar
      console.warn(`[CORS] Origem não listada tentando acessar: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handler explícito para preflight OPTIONS (crítico para alguns navegadores/proxies)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

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
