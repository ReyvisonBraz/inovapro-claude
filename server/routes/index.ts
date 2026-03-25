import { Router } from "express";
import authRoutes from "./auth.routes.js";
import transactionsRoutes from "./transactions.routes.js";
import customersRoutes from "./customers.routes.js";
import paymentsRoutes from "./payments.routes.js";
import serviceOrdersRoutes from "./serviceOrders.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import settingsRoutes from "./settings.routes.js";

const router = Router();

/**
 * Mount all API routes with backward-compatible paths.
 * 
 * Old server.ts paths → New modular routes:
 * /api/login              → authRoutes
 * /api/users              → authRoutes
 * /api/transactions       → transactionsRoutes
 * /api/stats              → transactionsRoutes (GET /stats)
 * /api/customers          → customersRoutes
 * /api/client-payments    → paymentsRoutes
 * /api/receipts           → paymentsRoutes (GET/POST /receipts/*)
 * /api/service-orders     → serviceOrdersRoutes
 * /api/inventory          → inventoryRoutes
 * /api/settings           → settingsRoutes
 * /api/categories         → settingsRoutes
 * /api/brands             → settingsRoutes
 * /api/models             → settingsRoutes
 * /api/equipment-types    → settingsRoutes
 * /api/service-order-statuses → settingsRoutes
 * /api/audit-logs         → settingsRoutes
 */

// Auth (login, users) — handles /api/login, /api/users
router.use("/api", authRoutes);

// Core domain routes
router.use("/api/transactions", transactionsRoutes);
router.use("/api/customers", customersRoutes);
router.use("/api/client-payments", paymentsRoutes);
router.use("/api/service-orders", serviceOrdersRoutes);
router.use("/api/inventory", inventoryRoutes);

// Settings + all config sub-resources
// This router defines paths like /settings, /categories, /brands, etc.
// We mount at /api so they become /api/settings, /api/categories, /api/brands, ...
router.use("/api", settingsRoutes);

// Receipts — paymentsRoutes also handles /receipts/:paymentId
router.use("/api", paymentsRoutes);

// Stats — transactionsRoutes has GET /stats
router.use("/api", transactionsRoutes);

export default router;
