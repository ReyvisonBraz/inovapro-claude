import { Router, Request, Response, NextFunction } from "express";
import db from "../database.js";
import { InventoryItemSchema } from "../validators/schemas.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../helpers.js";

const router = Router();

// --- List Inventory Items ---
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = db.prepare("SELECT * FROM inventory_items ORDER BY name ASC").all();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// --- Create Inventory Item ---
router.post("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = InventoryItemSchema.parse(req.body);
    const userId = req.user!.userId;

    const finalUnitPrice = data.unitPrice !== undefined ? data.unitPrice : (data.salePrice || 0);
    const finalStockLevel = data.stockLevel !== undefined ? data.stockLevel : (data.quantity || 0);

    const result = db.prepare(
      "INSERT INTO inventory_items (name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      data.name, data.category, data.sku || null,
      data.costPrice || 0, finalUnitPrice, finalStockLevel,
      data.minQuantity || 5, finalUnitPrice, finalStockLevel, userId
    );

    logAudit(userId, "create", "InventoryItem", result.lastInsertRowid, `Created item ${data.name}`);

    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

// --- Update Inventory Item ---
router.put("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = InventoryItemSchema.parse(req.body);
    const userId = req.user!.userId;

    const finalUnitPrice = data.unitPrice !== undefined ? data.unitPrice : (data.salePrice || 0);
    const finalStockLevel = data.stockLevel !== undefined ? data.stockLevel : (data.quantity || 0);

    db.prepare(
      "UPDATE inventory_items SET name = ?, category = ?, sku = ?, costPrice = ?, salePrice = ?, quantity = ?, minQuantity = ?, unitPrice = ?, stockLevel = ?, updatedBy = ? WHERE id = ?"
    ).run(
      data.name, data.category, data.sku || null,
      data.costPrice || 0, finalUnitPrice, finalStockLevel,
      data.minQuantity || 5, finalUnitPrice, finalStockLevel,
      userId, req.params.id
    );

    logAudit(userId, "update", "InventoryItem", parseInt(req.params.id), `Updated item ${data.name}`);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Delete Inventory Item ---
router.delete("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    db.prepare("DELETE FROM inventory_items WHERE id = ?").run(req.params.id);
    logAudit(userId, "delete", "InventoryItem", parseInt(req.params.id), `Deleted inventory item ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
