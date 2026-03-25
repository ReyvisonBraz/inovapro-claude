import { Router, Request, Response, NextFunction } from "express";
import db from "../database.js";
import { TransactionSchema, PaginationSchema } from "../validators/schemas.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit, getPaginatedData } from "../helpers.js";

const router = Router();

// --- List Transactions (paginated) ---
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = PaginationSchema.parse(req.query);

    const options: any = { orderBy: "date DESC, id DESC" };
    if (search) {
      options.where = "description LIKE ? OR category LIKE ? OR CAST(amount AS TEXT) LIKE ?";
      options.params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    const result = getPaginatedData("transactions", page, limit, options);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- Create Transaction ---
router.post("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = TransactionSchema.parse(req.body);
    const userId = req.user!.userId;

    const info = db.prepare(
      "INSERT INTO transactions (description, category, type, amount, date, createdBy) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(data.description, data.category, data.type, data.amount, data.date, userId);

    logAudit(userId, "create", "transaction", info.lastInsertRowid, `Created transaction: ${data.description}`);

    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

// --- Update Transaction ---
router.put("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = TransactionSchema.parse(req.body);
    const userId = req.user!.userId;

    db.prepare(
      "UPDATE transactions SET description = ?, category = ?, type = ?, amount = ?, date = ?, updatedBy = ? WHERE id = ?"
    ).run(data.description, data.category, data.type, data.amount, data.date, userId, req.params.id);

    logAudit(userId, "update", "transaction", parseInt(req.params.id), `Updated transaction: ${data.description}`);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Delete Transaction ---
router.delete("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const tx = db.prepare("SELECT description FROM transactions WHERE id = ?").get(req.params.id) as any;

    db.prepare("DELETE FROM transactions WHERE id = ?").run(req.params.id);

    logAudit(userId, "delete", "transaction", parseInt(req.params.id), `Deleted transaction: ${tx?.description || "unknown"}`);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Stats ---
router.get("/stats", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalIncome = (db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'income'").get() as any).total || 0;
    const totalExpense = (db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'").get() as any).total || 0;
    const pendingPayments = (db.prepare("SELECT COUNT(*) as count FROM client_payments WHERE status != 'paid'").get() as any).count || 0;
    const activeOS = (db.prepare("SELECT COUNT(*) as count FROM service_orders WHERE status NOT IN ('completed', 'delivered', 'cancelled')").get() as any).count || 0;

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pendingPayments,
      activeOS,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
