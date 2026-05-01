import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getLogs, getErrors, clearLogs, info } from '../lib/server-logger.js';

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
  try {
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
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

/**
 * Endpoint: GET /api/debug/errors
 * 
 * Retorna apenas erros recentes do servidor.
 * Ideal para monitoramento e diagnóstico rápido de problemas.
 */
router.get('/errors', requireAuth, (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const errors = getErrors(limit);
    res.json({ success: true, data: errors, total: errors.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar erros' });
  }
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

export default router;
