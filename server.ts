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

// Helmet: segurança HTTP
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS: liberado para facilitar comunicação Vercel <-> Vercel
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Logger de requisições
app.use(requestLogger);

/*
 * ─── Health Check ───
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0-prisma',
    uptime: process.uptime(),
  });
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
