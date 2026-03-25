import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import db from "../database.js";
import { config } from "../config.js";
import { LoginSchema, UserCreateSchema, UserUpdateSchema } from "../validators/schemas.js";
import { generateToken, requireAuth, requireRole, type JwtPayload } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
import { AppError } from "../middleware/errorHandler.js";
import { logAudit } from "../helpers.js";

const router = Router();

// --- Login ---
router.post("/login", loginLimiter, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = LoginSchema.parse(req.body);

    const user = db.prepare(
      "SELECT id, username, password, role, name, permissions, createdAt FROM users WHERE username = ?"
    ).get(username) as any;

    if (!user) {
      throw new AppError(401, "Credenciais inválidas");
    }

    // Support both hashed passwords (bcrypt) and legacy plaintext
    let passwordValid = false;
    if (user.password.startsWith("$2")) {
      // bcrypt hash
      passwordValid = bcrypt.compareSync(password, user.password);
    } else {
      // Legacy plaintext — compare and upgrade hash
      passwordValid = password === user.password;
      if (passwordValid) {
        const hashed = bcrypt.hashSync(password, config.bcryptRounds);
        db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, user.id);
      }
    }

    if (!passwordValid) {
      throw new AppError(401, "Credenciais inválidas");
    }

    // Parse permissions
    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.permissions || "[]");
    } catch {
      permissions = [];
    }

    // Owner always gets all permissions
    if (user.role === "owner") {
      permissions = [
        "view_dashboard",
        "manage_transactions",
        "view_reports",
        "manage_customers",
        "manage_payments",
        "manage_settings",
        "manage_users",
      ];
    }

    const tokenPayload: JwtPayload = {
      userId: user.id,
      role: user.role,
      permissions,
    };

    const token = generateToken(tokenPayload);

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions,
      createdAt: user.createdAt,
      token,
    });
  } catch (err) {
    next(err);
  }
});

// --- List Users ---
router.get("/users", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = db
      .prepare(
        "SELECT id, username, role, name, permissions, createdAt FROM users ORDER BY name ASC"
      )
      .all()
      .map((u: any) => {
        try {
          u.permissions = JSON.parse(u.permissions || "[]");
        } catch {
          u.permissions = [];
        }
        return u;
      });

    res.json(users);
  } catch (err) {
    next(err);
  }
});

// --- Create User ---
router.post(
  "/users",
  requireAuth,
  requireRole("owner"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = UserCreateSchema.parse(req.body);
      const hashedPassword = bcrypt.hashSync(data.password, config.bcryptRounds);
      const permsString = JSON.stringify(data.permissions || []);

      const result = db
        .prepare(
          "INSERT INTO users (username, password, role, name, permissions) VALUES (?, ?, ?, ?, ?)"
        )
        .run(data.username, hashedPassword, data.role, data.name, permsString);

      logAudit(
        req.user!.userId,
        "create",
        "user",
        result.lastInsertRowid,
        `Created user ${data.username}`
      );

      res.json({ id: result.lastInsertRowid });
    } catch (err) {
      next(err);
    }
  }
);

// --- Update User ---
router.put(
  "/users/:id",
  requireAuth,
  requireRole("owner"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = UserUpdateSchema.parse(req.body);
      const permsString = JSON.stringify(data.permissions || []);

      if (data.password) {
        const hashed = bcrypt.hashSync(data.password, config.bcryptRounds);
        db.prepare(
          "UPDATE users SET name = ?, role = ?, password = ?, permissions = ? WHERE id = ?"
        ).run(data.name, data.role, hashed, permsString, req.params.id);
      } else {
        db.prepare(
          "UPDATE users SET name = ?, role = ?, permissions = ? WHERE id = ?"
        ).run(data.name, data.role, permsString, req.params.id);
      }

      logAudit(
        req.user!.userId,
        "update",
        "user",
        parseInt(req.params.id),
        `Updated user ${data.name}`
      );

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

// --- Delete User ---
router.delete(
  "/users/:id",
  requireAuth,
  requireRole("owner"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Prevent deleting the last owner
      const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.params.id) as any;
      if (user?.role === "owner") {
        const ownerCount = (
          db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'owner'").get() as any
        ).count;
        if (ownerCount <= 1) {
          throw new AppError(400, "Não é possível excluir o último administrador");
        }
      }

      db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

      logAudit(
        req.user!.userId,
        "delete",
        "user",
        parseInt(req.params.id),
        `Deleted user ID: ${req.params.id}`
      );

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
