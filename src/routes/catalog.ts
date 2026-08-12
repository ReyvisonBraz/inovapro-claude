import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { info } from '../lib/server-logger.js';
import { requirePermission } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { BrandSchema, ModelSchema, EquipmentTypeSchema, ServiceOrderStatusSchema } from '../schemas/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { BusinessError, NotFoundError } from '../lib/errors.js';
import { isPrismaUniqueConstraintError } from '../lib/prisma-error.js';
import { writeAudit } from '../lib/audit.js';

function parseIdOrReject(params: Record<string, string | undefined>, name: string): number {
  const raw = params[name];
  if (!raw) throw new BusinessError('ID não fornecido');
  const id = parseInt(raw);
  if (isNaN(id)) throw new BusinessError('ID inválido');
  return id;
}

const router = Router();

router.use(requirePermission('manage_service_orders'));

/* ───── Service Order Statuses ───── */

router.get('/service-order-statuses', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const statuses = await prisma.serviceOrderStatus.findMany({ orderBy: { priority: 'asc' } });
  res.json(statuses);
}));

router.post('/service-order-statuses', validate(ServiceOrderStatusSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, color, priority, isDefault } = req.body;
  try {
    const status = await prisma.serviceOrderStatus.create({ data: { name, color, priority, isDefault } });
    await writeAudit(req, 'create', 'service-order-status', status.id, { name });
    info('Status de OS criado', { details: { id: status.id, name } });
    res.status(201).json(status);
  } catch (err: unknown) {
    if (isPrismaUniqueConstraintError(err)) throw new BusinessError(`Status "${name}" já existe.`);
    throw err;
  }
}));

router.put('/service-order-statuses/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseIdOrReject(req.params, 'id');
  const { name, color, priority, isDefault } = req.body;
  await prisma.serviceOrderStatus.update({
    where: { id },
    data: { name, color, priority, isDefault },
  });
  await writeAudit(req, 'update', 'service-order-status', id, { fields: Object.keys(req.body) });
  res.json({ success: true });
}));

router.delete('/service-order-statuses/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseIdOrReject(req.params, 'id');
  await prisma.serviceOrderStatus.delete({ where: { id } });
  await writeAudit(req, 'delete', 'service-order-status', id);
  res.status(204).end();
}));

/* ───── Brands ───── */

router.get('/brands', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const brands = await prisma.brand.findMany({ include: { Models: true }, orderBy: { name: 'asc' } });
  res.json(brands);
}));

router.post('/brands', validate(BrandSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, equipmentType } = req.body;
  try {
    const brand = await prisma.brand.create({ data: { name, equipmentType } });
    await writeAudit(req, 'create', 'brand', brand.id, { name, equipmentType });
    res.status(201).json({ ...brand, Models: [] });
  } catch (err: unknown) {
    if (isPrismaUniqueConstraintError(err)) throw new BusinessError(`Marca "${name}" já existe.`);
    throw err;
  }
}));

router.put('/brands/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseIdOrReject(req.params, 'id');
  const { name, equipmentType } = req.body;
  await prisma.brand.update({ where: { id }, data: { name, equipmentType } });
  await writeAudit(req, 'update', 'brand', id, { name, equipmentType });
  res.json({ success: true });
}));

router.delete('/brands/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseIdOrReject(req.params, 'id');
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new NotFoundError('Marca não encontrada.');
  const modelCount = await prisma.model.count({ where: { brandId: id } });
  if (modelCount > 0) {
    throw new BusinessError(
      `Marca "${brand.name}" possui ${modelCount} modelo(s) vinculado(s). ` +
      `Exclua os modelos primeiro antes de excluir a marca.`
    );
  }
  await prisma.brand.delete({ where: { id } });
  await writeAudit(req, 'delete', 'brand', id);
  res.status(204).end();
}));

/* ───── Models ───── */

router.get('/models', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const models = await prisma.model.findMany({ include: { brand: true }, orderBy: { name: 'asc' } });
  res.json(models);
}));

router.post('/models', validate(ModelSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { brandId, name } = req.body;
  try {
    const model = await prisma.model.create({ data: { brandId, name } });
    await writeAudit(req, 'create', 'model', model.id, { brandId, name });
    res.status(201).json(model);
  } catch (err: unknown) {
    if (isPrismaUniqueConstraintError(err)) throw new BusinessError(`Modelo "${name}" já existe nesta marca.`);
    throw err;
  }
}));

router.put('/models/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseIdOrReject(req.params, 'id');
  const { brandId, name } = req.body;
  await prisma.model.update({ where: { id }, data: { brandId, name } });
  await writeAudit(req, 'update', 'model', id, { brandId, name });
  res.json({ success: true });
}));

router.delete('/models/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseIdOrReject(req.params, 'id');
  const model = await prisma.model.findUnique({ where: { id } });
  if (!model) throw new NotFoundError('Modelo não encontrado.');
  const osCount = await prisma.serviceOrder.count({ where: { equipmentModel: model.name } });
  if (osCount > 0) {
    throw new BusinessError(
      `Modelo "${model.name}" está em uso por ${osCount} ordem(ns) de serviço. ` +
      `Altere o modelo nessas OS antes de excluí-lo.`
    );
  }
  await prisma.model.delete({ where: { id } });
  await writeAudit(req, 'delete', 'model', id);
  res.status(204).end();
}));

/* ───── Equipment Types ───── */

router.get('/equipment-types', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const types = await prisma.equipmentType.findMany({ orderBy: { name: 'asc' } });
  res.json(types);
}));

router.post('/equipment-types', validate(EquipmentTypeSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, icon } = req.body;
  try {
    const type = await prisma.equipmentType.create({ data: { name, icon } });
    await writeAudit(req, 'create', 'equipment-type', type.id, { name });
    res.status(201).json(type);
  } catch (err: unknown) {
    if (isPrismaUniqueConstraintError(err)) throw new BusinessError(`Tipo "${name}" já existe.`);
    throw err;
  }
}));

router.put('/equipment-types/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseIdOrReject(req.params, 'id');
  const { name, icon } = req.body;
  const oldType = await prisma.equipmentType.findUnique({ where: { id } });
  await prisma.equipmentType.update({ where: { id }, data: { name, icon } });
  if (oldType && oldType.name !== name) {
    await prisma.serviceOrder.updateMany({ where: { equipmentType: oldType.name }, data: { equipmentType: name } });
    await prisma.brand.updateMany({ where: { equipmentType: oldType.name }, data: { equipmentType: name } });
  }
  await writeAudit(req, 'update', 'equipment-type', id, { name });
  res.json({ success: true });
}));

router.delete('/equipment-types/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseIdOrReject(req.params, 'id');
  await prisma.equipmentType.delete({ where: { id } });
  await writeAudit(req, 'delete', 'equipment-type', id);
  res.status(204).end();
}));

export default router;
