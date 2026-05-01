/**
 * ============================================================================
 * INOVA PRO — Servidor Principal (Express + Prisma + PostgreSQL)
 * ============================================================================
 *
 * Arquitetura:
 *   server.ts          → Configuração do Express, middleware global, inicialização
 *   src/routes/        → Módulos de rota organizados por domínio
 *   src/middleware/     → Autenticação JWT e autorização por roles
 *   src/lib/           → Prisma client, loggers utilitários
 *
 * Fluxo de requisição:
 *   Cliente → CORS/Helmet → Rate Limit → Auth JWT → Rota específica → Prisma → Resposta
 *
 * Pontos estratégicos de log:
 *   - Toda rota possui try/catch com logging estruturado (requestId, userId, params)
 *   - Erros são registrados com stack trace e contexto completo
 *   - Endpoint /api/debug/logs e /api/debug/errors para diagnóstico em produção
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
 * Garantem que o processo reinicie em caso de falha inesperada.
 */
process.on('uncaughtException', (err) => {
  error('[FATAL] Exceção não capturada', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  error('[FATAL] Rejeição não tratada', reason);
  process.exit(1);
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

  /*
   * Teste de conexão com o banco ao iniciar.
   * Se falhar, o servidor não sobe — evitando requisições com banco offline.
   */
  const connected = await testConnection();
  if (!connected) {
    error('[STARTUP] Falha na conexão com banco de dados');
    process.exit(1);
  }

  /*
   * ─── Middleware Global ───
   */

  // Helmet: segurança HTTP (CSP desabilitado para SPA com múltiplas origens)
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS: origens permitidas (Vercel + locais)
  const allowedOrigins = [
    process.env.APP_URL,
    /^https:\/\/.*\.vercel\.app$/,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : (o as RegExp).test(origin)
      );
      if (allowed) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));

  // Logger de requisições: adiciona requestId para rastreabilidade
  app.use(requestLogger);

  /*
   * ─── Health Check (público) ───
   * Monitoramento externo sem autenticação.
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
   * ─── Rotas Públicas ───
   * Login não requer autenticação.
   * O router de auth contém POST /login com rate limiting integrado.
   */
  app.use('/api', authRoutes);

  /*
   * ─── Rotas Protegidas (requerem JWT) ───
   * Todas as demais rotas /api/* exigem token de autenticação.
   * O middleware requireAuth decodifica o JWT e injeta req.user.
   */
  app.use('/api', requireAuth, protectedRoutes);

  /*
   * ─── Servir Frontend em Produção ───
   * Em produção, o Vercel serve o frontend separadamente.
   * Esta seção é usada para deploy Railway/Render com SPA integrado.
   */
  if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  /*
   * ─── Handler de Erros Global ───
   * Captura erros não tratados nas rotas, registra com contexto completo
   * e retorna resposta amigável (sem stack trace em produção).
   */
  app.use(errorHandler);

  /*
   * ─── Inicialização do Servidor ───
   */
  app.listen(PORT, '0.0.0.0', () => {
    info(`Servidor rodando em http://localhost:${PORT}`, { details: { port: PORT, env: process.env.NODE_ENV || 'development' } });
    console.log(`[SERVER] Rodando em http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  error('[FATAL] Falha ao iniciar servidor', err);
  process.exit(1);
});
