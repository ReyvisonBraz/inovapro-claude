import { Router, Request, Response, NextFunction } from "express";
import db from "../database.js";
import { ClientPaymentSchema, ClientPaymentUpdateSchema, PaginationSchema, ReceiptSchema } from "../validators/schemas.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit, getPaginatedData } from "../helpers.js";

const router = Router();

// --- List Payments (paginated) ---
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = PaginationSchema.parse(req.query);

    const options: any = {
      select: "cp.*, c.firstName || ' ' || c.lastName as customerName",
      join: "cp JOIN customers c ON cp.customerId = c.id",
      orderBy: "cp.dueDate ASC",
    };

    if (search) {
      options.where = "c.firstName LIKE ? OR c.lastName LIKE ? OR cp.description LIKE ? OR cp.saleId LIKE ?";
      options.params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    const result = getPaginatedData("client_payments", page, limit, options);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- Create Payment ---
router.post("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ClientPaymentSchema.parse(req.body);
    const userId = req.user!.userId;

    const initialPaymentHistory =
      data.paidAmount && data.paidAmount > 0
        ? JSON.stringify([{ amount: data.paidAmount, date: new Date().toISOString() }])
        : "[]";

    const result = db.prepare(`
      INSERT INTO client_payments
      (customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, paymentHistory, saleId, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.customerId, data.description, data.totalAmount, data.paidAmount || 0,
      data.purchaseDate, data.dueDate, data.paymentMethod,
      data.status || "pending", data.installmentsCount || 1,
      data.type || "income", initialPaymentHistory, data.saleId || null, userId
    );

    logAudit(userId, "create", "client_payment", result.lastInsertRowid, `Created payment: ${data.description}`);

    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

// --- Update Payment (partial) ---
router.patch("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ClientPaymentUpdateSchema.parse(req.body);
    const userId = req.user!.userId;

    if (data.paymentHistory) {
      db.prepare(
        "UPDATE client_payments SET paidAmount = ?, status = ?, paymentHistory = ?, updatedBy = ? WHERE id = ?"
      ).run(data.paidAmount, data.status, JSON.stringify(data.paymentHistory), userId, req.params.id);
    } else {
      db.prepare(
        "UPDATE client_payments SET paidAmount = ?, status = ?, updatedBy = ? WHERE id = ?"
      ).run(data.paidAmount, data.status, userId, req.params.id);
    }

    logAudit(userId, "update", "client_payment", parseInt(req.params.id), `Updated payment status: ${data.status}`);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Delete Payment ---
router.delete("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    db.prepare("DELETE FROM client_payments WHERE id = ?").run(req.params.id);
    logAudit(userId, "delete", "client_payment", parseInt(req.params.id), `Deleted payment ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Delete Payment Group (by saleId) ---
router.delete("/group/:saleId", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    db.prepare("DELETE FROM client_payments WHERE saleId = ?").run(req.params.saleId);
    logAudit(userId, "delete", "client_payment_group", 0, `Deleted payment group: ${req.params.saleId}`);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Receipts ---
router.get("/receipts/:paymentId", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const receipts = db.prepare("SELECT * FROM receipts WHERE paymentId = ? ORDER BY createdAt DESC").all(req.params.paymentId);
    res.json(receipts);
  } catch (err) {
    next(err);
  }
});

router.post("/receipts", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ReceiptSchema.parse(req.body);
    const result = db.prepare("INSERT INTO receipts (paymentId, content) VALUES (?, ?)").run(data.paymentId, data.content);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

export default router;
