import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getLogs, getErrors, clearLogs, info } from '../lib/server-logger.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

/**
 * Endpoint: GET /api/debug/logs
 *
 * Retorna logs recentes do servidor com filtro opcional por nível.
 * Query params:
 *   - level: 'info' | 'warn' | 'error' | 'debug' (opcional)
 *   - limit: número máximo de entradas (opcional, default 200)
 *
 * Uso estratégico:
 *   - /api/debug/logs?level=error → ver apenas erros recentes
 *   - /api/debug/logs?limit=50 → últimas 50 entradas
 */
router.get('/logs', requireAuth, (req: Request, res: Response) => {
  const level = req.query.level as string | undefined;
  const limit = parseInt(req.query.limit as string) || 200;
  const validLevels = ['info', 'warn', 'error', 'debug'];
  const filteredLevel = level && validLevels.includes(level)
    ? level as 'info' | 'warn' | 'error' | 'debug'
    : undefined;

  const logs = getLogs(filteredLevel, limit);

  info('Logs consultados', {
    route: '/api/debug/logs',
    details: { level: level || 'all', count: logs.length, limit },
  });

  res.json({ success: true, data: logs, total: logs.length });
});

/**
 * Endpoint: GET /api/debug/errors
 *
 * Retorna apenas erros recentes do servidor.
 * Ideal para monitoramento e diagnóstico rápido de problemas.
 */
router.get('/errors', requireAuth, (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const errors = getErrors(limit);
  res.json({ success: true, data: errors, total: errors.length });
});

/**
 * Endpoint: GET /api/debug/health
 *
 * Health check detalhado com informações do servidor.
 * Não requer autenticação para permitir monitoramento externo.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0-prisma',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/**
 * Endpoint: POST /api/debug/logs/clear
 *
 * Limpa todos os logs em memória.
 * Requer autenticação (apenas admin/owner).
 */
router.post('/logs/clear', requireAuth, (_req: Request, res: Response) => {
  clearLogs();
  info('Logs limpos manualmente');
  res.json({ success: true, message: 'Logs limpos com sucesso' });
});

/**
 * Endpoint: GET /api/debug/db-test
 *
 * Testa cada tipo de query Prisma isoladamente para diagnosticar
 * quais operações falham no ambiente serverless.
 * Cada teste loga o resultado explicitamente via console.log.
 */
router.get('/db-test', requireAuth, async (_req: Request, res: Response) => {
  const results: Record<string, { ok: boolean; ms: number; error?: string }> = {};
  const t = () => Date.now();

  const tests: Array<[string, () => Promise<unknown>]> = [
    ['findUnique_settings', () => prisma.settings.findUnique({ where: { id: 1 } })],
    ['findUnique_user', () => prisma.user.findUnique({ where: { id: 1 }, select: { id: true } })],
    ['findMany_categories', () => prisma.category.findMany()],
    ['findMany_brands_with_include', () => prisma.brand.findMany({ include: { Models: true } })],
    ['findMany_statuses', () => prisma.serviceOrderStatus.findMany()],
    ['findMany_equipment_types', () => prisma.equipmentType.findMany()],
    ['findMany_inventory', () => prisma.inventoryItem.findMany({ take: 5 })],
    ['findMany_customers', () => prisma.customer.findMany({ take: 5 })],
    ['count_customers', () => prisma.customer.count()],
    ['findMany_transactions', () => prisma.transaction.findMany({ take: 5 })],
    ['count_transactions', () => prisma.transaction.count()],
    ['findMany_clientPayments', () => prisma.clientPayment.findMany({ take: 5 })],
    ['findMany_serviceOrders', () => prisma.serviceOrder.findMany({ take: 5 })],
    ['findMany_serviceOrders_with_include', () => prisma.serviceOrder.findMany({ take: 2, include: { customer: { select: { firstName: true, lastName: true } } } })],
    ['findMany_clientPayments_with_include', () => prisma.clientPayment.findMany({ take: 2, include: { customer: { select: { firstName: true } }, paymentEntries: true } })],
    ['insensitive_search_transactions', () => prisma.transaction.findMany({ where: { OR: [{ description: { contains: 'test', mode: 'insensitive' } }] }, take: 1 })],
    ['insensitive_search_customers', () => prisma.customer.findMany({ where: { OR: [{ firstName: { contains: 'test', mode: 'insensitive' } }] }, take: 1 })],
    ['promiseAll_findMany_count_transactions', () => Promise.all([prisma.transaction.findMany({ take: 1 }), prisma.transaction.count()])],
    ['promiseAll_findMany_count_customers', () => Promise.all([prisma.customer.findMany({ take: 1 }), prisma.customer.count()])],
    ['promiseAll_findMany_count_serviceOrders', () => Promise.all([prisma.serviceOrder.findMany({ take: 1 }), prisma.serviceOrder.count()])],
    ['promiseAll_3queries_serviceOrders', () => Promise.all([
      prisma.serviceOrder.findMany({ take: 1, include: { customer: { select: { firstName: true } } } }),
      prisma.serviceOrder.count(),
      prisma.serviceOrder.groupBy({ by: ['status'], _count: { status: true } }),
    ])],
    ['aggregate_transactions', () => prisma.transaction.aggregate({ where: { type: 'income' }, _sum: { amount: true } })],
    ['groupBy_transactions', () => prisma.transaction.groupBy({ by: ['category'], _sum: { amount: true } })],
    ['queryRaw', () => prisma.$queryRaw`SELECT 1 as test`],
    ['queryRaw_complex', () => prisma.$queryRaw<Array<{ month: string; type: string; total: number }>>`
      SELECT TO_CHAR("date", 'YYYY-MM') as month, type, SUM(amount)::float as total
      FROM "Transaction" WHERE "date" >= '2025-01-01'
      GROUP BY TO_CHAR("date", 'YYYY-MM'), type
    `],
  ];

  console.log(`[DB-TEST] Starting ${tests.length} database tests...`);

  for (const [name, fn] of tests) {
    const start = t();
    try {
      await fn();
      const ms = t() - start;
      results[name] = { ok: true, ms };
      console.log(`[DB-TEST] ✅ ${name} — ${ms}ms`);
    } catch (err: unknown) {
      const ms = t() - start;
      const errorMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      results[name] = { ok: false, ms, error: errorMsg };
      console.error(`[DB-TEST] ❌ ${name} — ${ms}ms — ${errorMsg}`);
      if (errorStack) console.error(`[DB-TEST] Stack: ${errorStack}`);
    }
  }

  const passed = Object.values(results).filter(r => r.ok).length;
  const failed = Object.values(results).filter(r => !r.ok).length;
  console.log(`[DB-TEST] Done: ${passed} passed, ${failed} failed out of ${tests.length}`);

  res.json({ passed, failed, total: tests.length, results });
});

export default router;