import { Router, Request, Response, NextFunction } from "express";
import db from "../database.js";
import { ServiceOrderSchema, PaginationSchema, ServiceOrderStatusSchema } from "../validators/schemas.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit, getPaginatedData } from "../helpers.js";

const router = Router();

// --- Public OS Status (No Auth Required) ---
router.post("/public/:id/status", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cpfPrefix } = req.body;
    if (!cpfPrefix || typeof cpfPrefix !== 'string' || cpfPrefix.length < 4) {
      return res.status(400).json({ error: "Prefixo do CPF inválido. É necessário informar os 4 primeiros dígitos." });
    }

    // Buscar a OS e os dados do cliente
    const osData = db.prepare(`
      SELECT 
        so.id, so.status, so.reportedProblem, so.technicalAnalysis, so.equipmentType, 
        so.equipmentBrand, so.equipmentModel, so.entryDate, so.analysisPrediction,
        so.totalAmount, so.createdAt, so.updatedAt,
        c.cpf, c.firstName, c.lastName
      FROM service_orders so
      JOIN customers c ON so.customerId = c.id
      WHERE so.id = ?
    `).get(req.params.id) as any;

    if (!osData) {
      return res.status(404).json({ error: "Ordem de serviço não encontrada." });
    }

    // Verificar se o CPF bate
    if (!osData.cpf) {
      // Se o cliente não tem CPF cadastrado, nós exigimos os 4 primeiros dígitos do telefone
      // Como fallback de segurança, evite o acesso.
      return res.status(403).json({ error: "Cliente não possui CPF cadastrado. Acesse via painel." });
    }

    const cleanCpf = osData.cpf.replace(/\D/g, ''); // Remover não-numéricos
    const cleanPrefix = cpfPrefix.replace(/\D/g, '').substring(0, 4);

    if (!cleanCpf.startsWith(cleanPrefix)) {
      return res.status(401).json({ error: "CPF incorreto. Verifique os dados e tente novamente." });
    }

    // Se bateu, remove os dados sensíveis do cliente (ex: CPF completo)
    delete osData.cpf;

    res.json(osData);
  } catch (err) {
    next(err);
  }
});

// --- List Service Orders (paginated) ---
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = PaginationSchema.parse(req.query);

    const options: any = {
      select: "so.*, c.firstName, c.lastName, c.phone",
      join: "so LEFT JOIN customers c ON so.customerId = c.id",
      orderBy: "so.createdAt DESC",
    };

    if (search) {
      options.where = "c.firstName LIKE ? OR c.lastName LIKE ? OR so.equipmentBrand LIKE ? OR so.equipmentSerial LIKE ? OR CAST(so.id AS TEXT) LIKE ?";
      options.params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    const result = getPaginatedData("service_orders", page, limit, options);

    // Calculate status counts
    const counts = db.prepare(`
      SELECT
        COUNT(CASE WHEN status IN ('Aguardando Análise', 'Aguardando Peças') THEN 1 END) as awaiting,
        COUNT(CASE WHEN status IN ('Em Manutenção', 'Em Reparo', 'Aprovado') THEN 1 END) as active,
        COUNT(CASE WHEN status IN ('Pronto para Retirada', 'Pronto', 'Concluído') THEN 1 END) as ready,
        COUNT(CASE WHEN status = 'Urgente' OR (priority = 'high' AND status NOT IN ('Pronto para Retirada', 'Pronto', 'Concluído', 'Entregue')) THEN 1 END) as urgent
      FROM service_orders
    `).get() as any;

    (result.meta as any).counts = counts;

    // Parse JSON columns
    result.data = result.data.map((o: any) => {
      try { o.partsUsed = JSON.parse(o.partsUsed || "[]"); } catch { o.partsUsed = []; }
      try { o.services = JSON.parse(o.services || "[]"); } catch { o.services = []; }
      return o;
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- Create Service Order ---
router.post("/", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ServiceOrderSchema.parse(req.body);
    const userId = req.user!.userId;

    const partsString = JSON.stringify(data.partsUsed || []);
    const servicesString = JSON.stringify(data.services || []);

    const result = db.prepare(`
      INSERT INTO service_orders (
        customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial,
        reportedProblem, arrivalPhotoUrl, arrivalPhotoBase64, status, entryDate, analysisPrediction,
        customerPassword, accessories, ramInfo, ssdInfo, priority, createdBy,
        technicalAnalysis, servicesPerformed, services, partsUsed, serviceFee, totalAmount, finalObservations
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.customerId, data.equipmentType || null, data.equipmentBrand || null,
      data.equipmentModel || null, data.equipmentColor || null, data.equipmentSerial || null,
      data.reportedProblem, data.arrivalPhotoUrl || null, data.arrivalPhotoBase64 || null,
      data.status || "Aguardando Análise", data.entryDate || null, data.analysisPrediction || null,
      data.customerPassword || null, data.accessories || null, data.ramInfo || null,
      data.ssdInfo || null, data.priority || "medium", userId,
      data.technicalAnalysis || null, data.servicesPerformed || null, servicesString, partsString,
      data.serviceFee || 0, data.totalAmount || 0, data.finalObservations || null
    );

    logAudit(userId, "create", "ServiceOrder", result.lastInsertRowid, `Created OS for customer ${data.customerId}`);

    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

// --- Update Service Order ---
router.put("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ServiceOrderSchema.partial().parse(req.body);
    const userId = req.user!.userId;

    // Fetch old OS parts for inventory reconciliation
    const oldOs = db.prepare("SELECT partsUsed FROM service_orders WHERE id = ?").get(req.params.id) as any;
    let oldParts: any[] = [];
    try { oldParts = JSON.parse(oldOs?.partsUsed || "[]"); } catch { /* ignore */ }

    const newParts = data.partsUsed || oldParts;
    const newServices = data.services || [];

    // Reconcile inventory if parts changed
    if (data.partsUsed) {
      oldParts.forEach((p: any) => {
        if (p.id) {
          db.prepare("UPDATE inventory_items SET stockLevel = stockLevel + ? WHERE id = ?").run(p.quantity, p.id);
        }
      });
      newParts.forEach((p: any) => {
        if (p.id) {
          db.prepare("UPDATE inventory_items SET stockLevel = stockLevel - ? WHERE id = ?").run(p.quantity, p.id);
        }
      });
    }

    const partsString = JSON.stringify(newParts);
    const servicesString = JSON.stringify(newServices);

    db.prepare(`
      UPDATE service_orders
      SET status = COALESCE(?, status),
          technicalAnalysis = COALESCE(?, technicalAnalysis),
          servicesPerformed = COALESCE(?, servicesPerformed),
          services = COALESCE(?, services),
          partsUsed = COALESCE(?, partsUsed),
          serviceFee = COALESCE(?, serviceFee),
          totalAmount = COALESCE(?, totalAmount),
          finalObservations = COALESCE(?, finalObservations),
          entryDate = COALESCE(?, entryDate),
          analysisPrediction = COALESCE(?, analysisPrediction),
          customerPassword = COALESCE(?, customerPassword),
          accessories = COALESCE(?, accessories),
          ramInfo = COALESCE(?, ramInfo),
          ssdInfo = COALESCE(?, ssdInfo),
          priority = COALESCE(?, priority),
          equipmentType = COALESCE(?, equipmentType),
          equipmentBrand = COALESCE(?, equipmentBrand),
          equipmentModel = COALESCE(?, equipmentModel),
          equipmentColor = COALESCE(?, equipmentColor),
          equipmentSerial = COALESCE(?, equipmentSerial),
          arrivalPhotoBase64 = COALESCE(?, arrivalPhotoBase64),
          updatedBy = ?
      WHERE id = ?
    `).run(
      data.status, data.technicalAnalysis, data.servicesPerformed,
      servicesString, partsString, data.serviceFee, data.totalAmount,
      data.finalObservations, data.entryDate, data.analysisPrediction,
      data.customerPassword, data.accessories, data.ramInfo, data.ssdInfo,
      data.priority, data.equipmentType, data.equipmentBrand,
      data.equipmentModel, data.equipmentColor, data.equipmentSerial,
      data.arrivalPhotoBase64, userId, req.params.id
    );

    logAudit(userId, "update", "ServiceOrder", parseInt(req.params.id), `Updated OS #${req.params.id}`);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Delete Service Order ---
router.delete("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    db.prepare("DELETE FROM service_orders WHERE id = ?").run(req.params.id);
    logAudit(userId, "delete", "ServiceOrder", parseInt(req.params.id), `Deleted OS #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Service Order Statuses ---
router.get("/statuses", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const statuses = db.prepare("SELECT * FROM service_order_statuses ORDER BY priority ASC").all();
    res.json(statuses);
  } catch (err) {
    next(err);
  }
});

router.post("/statuses", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ServiceOrderStatusSchema.parse(req.body);
    const result = db.prepare(
      "INSERT INTO service_order_statuses (name, color, priority, isDefault) VALUES (?, ?, ?, ?)"
    ).run(data.name, data.color, data.priority || 0, data.isDefault ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

router.delete("/statuses/:id", requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    db.prepare("DELETE FROM service_order_statuses WHERE id = ? AND isDefault = 0").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
