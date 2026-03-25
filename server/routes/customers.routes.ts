import { Router, Request, Response, NextFunction } from "express";
import db from "../database.js";
import { CustomerSchema, PaginationSchema } from "../validators/schemas.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit, getPaginatedData } from "../helpers.js";

const router = Router();

// --- List Customers (paginated) ---
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = PaginationSchema.parse(req.query);

    const options: any = { orderBy: "firstName ASC" };
    if (search) {
      options.where = "firstName LIKE ? OR lastName LIKE ? OR nickname LIKE ? OR phone LIKE ? OR companyName LIKE ?";
      options.params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    const result = getPaginatedData("customers", page, limit, options);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- Create Customer ---
router.post("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CustomerSchema.parse(req.body);
    const userId = req.user!.userId;

    const result = db.prepare(`
      INSERT INTO customers (firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.firstName, data.lastName, data.nickname || null, data.cpf || null,
      data.companyName || null, data.phone, data.observation || null,
      data.creditLimit || 0, userId
    );

    logAudit(userId, "create", "customer", result.lastInsertRowid, `Created customer: ${data.firstName} ${data.lastName}`);

    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

// --- Update Customer ---
router.put("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CustomerSchema.parse(req.body);
    const userId = req.user!.userId;

    db.prepare(`
      UPDATE customers
      SET firstName = ?, lastName = ?, nickname = ?, cpf = ?, companyName = ?, phone = ?, observation = ?, creditLimit = ?, updatedBy = ?
      WHERE id = ?
    `).run(
      data.firstName, data.lastName, data.nickname || null, data.cpf || null,
      data.companyName || null, data.phone, data.observation || null,
      data.creditLimit || 0, userId, req.params.id
    );

    logAudit(userId, "update", "customer", parseInt(req.params.id), `Updated customer: ${data.firstName} ${data.lastName}`);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Get Customer Payments ---
router.get("/:id/payments", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = db.prepare("SELECT * FROM client_payments WHERE customerId = ?").all(req.params.id);
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

// --- Delete Customer ---
router.delete("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    db.prepare("DELETE FROM client_payments WHERE customerId = ?").run(req.params.id);
    db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);

    logAudit(userId, "delete", "customer", parseInt(req.params.id), `Deleted customer ID: ${req.params.id}`);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
