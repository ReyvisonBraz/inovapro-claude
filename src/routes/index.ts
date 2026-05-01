import { Router } from 'express';
import categoriesRoutes from './categories.js';
import settingsRoutes from './settings.js';
import usersRoutes from './users.js';
import customersRoutes from './customers.js';
import transactionsRoutes from './transactions.js';
import clientPaymentsRoutes from './client-payments.js';
import serviceOrdersRoutes from './service-orders.js';
import inventoryRoutes from './inventory.js';
import statsRoutes from './stats.js';
import catalogRoutes from './catalog.js';
import receiptsRoutes from './receipts.js';
import aiRoutes from './ai.js';
import exportRoutes from './export.js';
import auditLogRoutes from './audit-logs.js';
import debugRoutes from './debug.js';

const router = Router();

/*
 * Todas as rotas abaixo exigem autenticação JWT.
 * O middleware requireAuth é aplicado em server.ts antes de montá-las.
 * 
 * Nomenclatura: cada grupo se alinha ao endpoint /api/<prefixo>/...
 *   Ex: /api/transactions, /api/customers/:id, /api/debug/logs
 */
router.use('/categories', categoriesRoutes);
router.use('/settings', settingsRoutes);
router.use('/users', usersRoutes);
router.use('/customers', customersRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/client-payments', clientPaymentsRoutes);
router.use('/service-orders', serviceOrdersRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/stats', statsRoutes);
router.use('/', catalogRoutes);
router.use('/receipts', receiptsRoutes);
router.use('/ai', aiRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/export-all', exportRoutes);
router.use('/debug', debugRoutes);

export default router;
