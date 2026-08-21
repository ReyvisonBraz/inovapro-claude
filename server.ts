/**
 * ============================================================================
 * INOVA PRO — Servidor Principal (Express + Prisma + PostgreSQL)
 * ============================================================================
 * Boot: handlers de processo, montagem do app (src/app.ts), teste de conexão e
 * listen. A Vercel consome o default export (o app montado).
 */

import { createApp } from './src/app.js';
import { testConnection } from './src/lib/prisma.js';
import { error, info, persistFatalError } from './src/lib/server-logger.js';

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

const app = createApp();

export default app;

// Teste de conexão (não bloqueante)
testConnection().catch(err => error('[STARTUP] Falha na conexão com banco de dados', err));

// Inicia o servidor apenas se não estiver em ambiente de função serverless (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  app.listen(PORT, '0.0.0.0', () => {
    info(`Servidor rodando em http://localhost:${PORT}`, { details: { port: PORT, env: process.env.NODE_ENV || 'development' } });
  });
}