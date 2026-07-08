import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error, info } from '../lib/server-logger.js';
import { requirePermission } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { BrandSchema, ModelSchema, EquipmentTypeSchema, ServiceOrderStatusSchema } from './schemas.js';

const router = Router();

// Todo o catálogo é configuração de OS: exige manage_service_orders
// (leituras de marcas/modelos/tipos/status inclusas — employee tem a permissão).
router.use(requirePermission('manage_service_orders'));

/* ───── Service Order Statuses ───── */

router.get('/service-order-statuses', async (_req: Request, res: Response) => {
  try {
    const statuses = await prisma.serviceOrderStatus.findMany({ orderBy: { priority: 'asc' } });
    res.json(statuses);
  } catch (err) {
    error('[SERVICE_ORDER_STATUSES GET] Erro ao listar status', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/service-order-statuses', validate(ServiceOrderStatusSchema), async (req: Request, res: Response) => {
  try {
    const { name, color, priority, isDefault } = req.body;
    const status = await prisma.serviceOrderStatus.create({ data: { name, color, priority, isDefault } });
    info('Status de OS criado', { details: { id: status.id, name } });
    res.json({ id: status.id });
  } catch (err: any) {
    error('[SERVICE_ORDER_STATUSES POST] Erro ao criar status', err, { details: { name: req.body.name } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/service-order-statuses/:id', validate(ServiceOrderStatusSchema), async (req: Request, res: Response) => {
  try {
    const { name, color, priority, isDefault } = req.body;
    await prisma.serviceOrderStatus.update({
      where: { id: parseInt(req.params.id) },
      data: { name, color, priority, isDefault },
    });
    res.json({ success: true });
  } catch (err: any) {
    error('[SERVICE_ORDER_STATUSES PUT] Erro ao atualizar status', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/service-order-statuses/:id', async (req: Request, res: Response) => {
  try {
    await prisma.serviceOrderStatus.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err: any) {
    error('[SERVICE_ORDER_STATUSES DELETE] Erro ao excluir status', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

/* ───── Brands ───── */

router.get('/brands', async (_req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({ include: { Models: true }, orderBy: { name: 'asc' } });
    res.json(brands);
  } catch (err) {
    error('[BRANDS GET] Erro ao listar marcas', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/brands', validate(BrandSchema), async (req: Request, res: Response) => {
  try {
    const { name, equipmentType } = req.body;
    const brand = await prisma.brand.create({ data: { name, equipmentType } });
    res.json({ id: brand.id });
  } catch (err: any) {
    error('[BRANDS POST] Erro ao criar marca', err, { details: { name: req.body.name } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/brands/:id', validate(BrandSchema), async (req: Request, res: Response) => {
  try {
    const { name, equipmentType } = req.body;
    await prisma.brand.update({ where: { id: parseInt(req.params.id) }, data: { name, equipmentType } });
    res.json({ success: true });
  } catch (err: any) {
    error('[BRANDS PUT] Erro ao atualizar marca', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/brands/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return res.status(404).json({ error: 'Marca não encontrada.' });

    const modelCount = await prisma.model.count({ where: { brandId: id } });
    if (modelCount > 0) {
      return res.status(400).json({
        error: `Marca "${brand.name}" possui ${modelCount} modelo(s) vinculado(s). ` +
          `Exclua os modelos primeiro antes de excluir a marca.`
      });
    }

    await prisma.brand.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    error('[BRANDS DELETE] Erro ao excluir marca', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

/* ───── Models ───── */

router.get('/models', async (_req: Request, res: Response) => {
  try {
    const models = await prisma.model.findMany({ include: { brand: true }, orderBy: { name: 'asc' } });
    res.json(models);
  } catch (err) {
    error('[MODELS GET] Erro ao listar modelos', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/models', validate(ModelSchema), async (req: Request, res: Response) => {
  try {
    const { brandId, name } = req.body;
    const model = await prisma.model.create({ data: { brandId, name } });
    res.json({ id: model.id });
  } catch (err: any) {
    error('[MODELS POST] Erro ao criar modelo', err, { details: { name: req.body.name, brandId: req.body.brandId } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/models/:id', validate(ModelSchema), async (req: Request, res: Response) => {
  try {
    const { brandId, name } = req.body;
    await prisma.model.update({ where: { id: parseInt(req.params.id) }, data: { brandId, name } });
    res.json({ success: true });
  } catch (err: any) {
    error('[MODELS PUT] Erro ao atualizar modelo', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/models/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const model = await prisma.model.findUnique({ where: { id } });
    if (!model) return res.status(404).json({ error: 'Modelo não encontrado.' });

    const osCount = await prisma.serviceOrder.count({ where: { equipmentModel: model.name } });
    if (osCount > 0) {
      return res.status(400).json({
        error: `Modelo "${model.name}" está em uso por ${osCount} ordem(ns) de serviço. ` +
          `Altere o modelo nessas OS antes de excluí-lo.`
      });
    }

    await prisma.model.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    error('[MODELS DELETE] Erro ao excluir modelo', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

/* ───── Equipment Types ───── */

router.get('/equipment-types', async (_req: Request, res: Response) => {
  try {
    const types = await prisma.equipmentType.findMany({ orderBy: { name: 'asc' } });
    res.json(types);
  } catch (err) {
    error('[EQUIPMENT_TYPES GET] Erro ao listar tipos de equipamento', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/equipment-types', validate(EquipmentTypeSchema), async (req: Request, res: Response) => {
  try {
    const { name, icon } = req.body;
    const type = await prisma.equipmentType.create({ data: { name, icon } });
    res.json({ id: type.id });
  } catch (err: any) {
    error('[EQUIPMENT_TYPES POST] Erro ao criar tipo', err, { details: { name: req.body.name } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/equipment-types/:id', validate(EquipmentTypeSchema), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, icon } = req.body;
    const oldType = await prisma.equipmentType.findUnique({ where: { id } });
    await prisma.equipmentType.update({ where: { id }, data: { name, icon } });
    if (oldType && oldType.name !== name) {
      await prisma.serviceOrder.updateMany({ where: { equipmentType: oldType.name }, data: { equipmentType: name } });
      await prisma.brand.updateMany({ where: { equipmentType: oldType.name }, data: { equipmentType: name } });
    }
    res.json({ success: true });
  } catch (err: any) {
    error('[EQUIPMENT_TYPES PUT] Erro ao atualizar tipo', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/equipment-types/:id', async (req: Request, res: Response) => {
  try {
    await prisma.equipmentType.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err: any) {
    error('[EQUIPMENT_TYPES DELETE] Erro ao excluir tipo', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

export default router;
