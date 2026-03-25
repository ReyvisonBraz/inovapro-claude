import { Router, Request, Response, NextFunction } from "express";
import db from "../database.js";
import {
  SettingsSchema,
  CategorySchema,
  BrandSchema,
  ModelSchema,
  EquipmentTypeSchema,
  ServiceOrderStatusSchema,
} from "../validators/schemas.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ==================== APP SETTINGS ====================

router.get("/settings", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    if (settings) {
      settings.showWarnings = !!settings.showWarnings;
      try { settings.hiddenColumns = JSON.parse(settings.hiddenColumns || "[]"); } catch { settings.hiddenColumns = []; }
    }
    res.json(settings);
  } catch (err) { next(err); }
});

router.post("/settings", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = SettingsSchema.parse(req.body);
    db.prepare(`
      UPDATE settings
      SET appName = ?, appVersion = ?, fiscalYear = ?, primaryColor = ?,
          categories = ?, incomeCategories = ?, expenseCategories = ?,
          profileName = ?, profileAvatar = ?,
          initialBalance = ?, showWarnings = ?, hiddenColumns = ?,
          settingsPassword = ?, receiptLayout = ?, receiptLogo = ?,
          sendPulseClientId = ?, sendPulseClientSecret = ?, sendPulseTemplateId = ?,
          telegramBotToken = ?, telegramChatId = ?
      WHERE id = 1
    `).run(
      data.appName, data.appVersion, data.fiscalYear, data.primaryColor,
      data.categories, data.incomeCategories, data.expenseCategories,
      data.profileName, data.profileAvatar,
      data.initialBalance, data.showWarnings ? 1 : 0, JSON.stringify(data.hiddenColumns || []),
      data.settingsPassword, data.receiptLayout || "a4", data.receiptLogo || "",
      data.sendPulseClientId || "", data.sendPulseClientSecret || "", data.sendPulseTemplateId || "",
      data.telegramBotToken || null, data.telegramChatId || null
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ==================== CATEGORIES ====================

router.get("/categories", requireAuth, (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(db.prepare("SELECT * FROM categories ORDER BY name ASC").all());
  } catch (err) { next(err); }
});

router.post("/categories", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CategorySchema.parse(req.body);
    const result = db.prepare("INSERT INTO categories (name, type) VALUES (?, ?)").run(data.name, data.type);
    res.json({ id: result.lastInsertRowid });
  } catch (err) { next(err); }
});

router.delete("/categories/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ==================== BRANDS ====================

router.get("/brands", requireAuth, (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(db.prepare("SELECT * FROM brands ORDER BY name ASC").all());
  } catch (err) { next(err); }
});

router.post("/brands", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = BrandSchema.parse(req.body);
    const result = db.prepare("INSERT INTO brands (name, equipmentType) VALUES (?, ?)").run(data.name, data.equipmentType);
    res.json({ id: result.lastInsertRowid });
  } catch (err) { next(err); }
});

router.delete("/brands/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    db.prepare("DELETE FROM brands WHERE id = ?").run(req.params.id);
    db.prepare("DELETE FROM models WHERE brandId = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ==================== MODELS ====================

router.get("/models", requireAuth, (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(db.prepare("SELECT * FROM models ORDER BY name ASC").all());
  } catch (err) { next(err); }
});

router.post("/models", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ModelSchema.parse(req.body);
    const result = db.prepare("INSERT INTO models (brandId, name) VALUES (?, ?)").run(data.brandId, data.name);
    res.json({ id: result.lastInsertRowid });
  } catch (err) { next(err); }
});

router.delete("/models/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    db.prepare("DELETE FROM models WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ==================== EQUIPMENT TYPES ====================

router.get("/equipment-types", requireAuth, (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(db.prepare("SELECT * FROM equipment_types ORDER BY name ASC").all());
  } catch (err) { next(err); }
});

router.post("/equipment-types", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = EquipmentTypeSchema.parse(req.body);
    const result = db.prepare("INSERT INTO equipment_types (name, icon) VALUES (?, ?)").run(data.name, data.icon);
    res.json({ id: result.lastInsertRowid });
  } catch (err) { next(err); }
});

router.delete("/equipment-types/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    db.prepare("DELETE FROM equipment_types WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ==================== SERVICE ORDER STATUSES ====================

router.get("/service-order-statuses", requireAuth, (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(db.prepare("SELECT * FROM service_order_statuses ORDER BY priority ASC").all());
  } catch (err) { next(err); }
});

router.post("/service-order-statuses", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ServiceOrderStatusSchema.parse(req.body);
    const result = db.prepare(
      "INSERT INTO service_order_statuses (name, color, priority, isDefault) VALUES (?, ?, ?, ?)"
    ).run(data.name, data.color, data.priority || 0, data.isDefault ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
  } catch (err) { next(err); }
});

router.delete("/service-order-statuses/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    db.prepare("DELETE FROM service_order_statuses WHERE id = ? AND isDefault = 0").run(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ==================== AUDIT LOGS ====================

router.get("/audit-logs", requireAuth, (_req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = db.prepare(`
      SELECT l.*, u.name as userName
      FROM audit_logs l
      LEFT JOIN users u ON l.userId = u.id
      ORDER BY l.timestamp DESC
      LIMIT 100
    `).all();
    res.json(logs);
  } catch (err) { next(err); }
});

export default router;
