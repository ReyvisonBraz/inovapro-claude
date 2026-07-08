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
import { requireRole, requirePermission } from '../middleware/roles.js';

const router = Router();

/*
 * Todas as rotas abaixo exigem autenticação JWT.
 * O middleware requireAuth é aplicado em server.ts antes de montá-las.
 * 
 * Nomenclatura: cada grupo se alinha ao endpoint /api/<prefixo>/...
 *   Ex: /api/transactions, /api/customers/:id, /api/debug/logs
 */
// Administrativo — somente owner
router.use('/users', requireRole('owner'), usersRoutes);
router.use('/settings', requireRole('owner'), settingsRoutes);
router.use('/audit-logs', requireRole('owner'), auditLogRoutes);
router.use('/debug', requireRole('owner'), debugRoutes);

// Features — por permissão de role
router.use('/transactions', requirePermission('manage_transactions'), transactionsRoutes);
router.use('/client-payments', requirePermission('manage_payments'), clientPaymentsRoutes);
router.use('/service-orders', requirePermission('manage_service_orders'), serviceOrdersRoutes);
router.use('/customers', requirePermission('manage_customers'), customersRoutes);
router.use('/inventory', requirePermission('manage_inventory'), inventoryRoutes);
router.use('/stats', requirePermission('view_dashboard'), statsRoutes);
router.use('/export-all', requirePermission('view_reports'), exportRoutes);
router.use('/receipts', requirePermission('manage_payments'), receiptsRoutes);

// Referência / IA
router.use('/categories', categoriesRoutes);   // guarda de escrita dentro do arquivo
router.use('/', catalogRoutes);                 // guarda dentro do arquivo (requirePermission)
router.use('/ai', aiRoutes);                    // qualquer autenticado (rate-limit vem na Fase 2)

export default router;
