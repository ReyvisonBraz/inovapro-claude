import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error, info } from '../lib/server-logger.js';

const router = Router();

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

router.post('/service-order-statuses', async (req: Request, res: Response) => {
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

router.put('/service-order-statuses/:id', async (req: Request, res: Response) => {
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

router.post('/brands', async (req: Request, res: Response) => {
  try {
    const { name, equipmentType } = req.body;
    const brand = await prisma.brand.create({ data: { name, equipmentType } });
    res.json({ id: brand.id });
  } catch (err: any) {
    error('[BRANDS POST] Erro ao criar marca', err, { details: { name: req.body.name } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/brands/:id', async (req: Request, res: Response) => {
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
    await prisma.brand.delete({ where: { id: parseInt(req.params.id) } });
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

router.post('/models', async (req: Request, res: Response) => {
  try {
    const { brandId, name } = req.body;
    const model = await prisma.model.create({ data: { brandId, name } });
    res.json({ id: model.id });
  } catch (err: any) {
    error('[MODELS POST] Erro ao criar modelo', err, { details: { name: req.body.name, brandId: req.body.brandId } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/models/:id', async (req: Request, res: Response) => {
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
    await prisma.model.delete({ where: { id: parseInt(req.params.id) } });
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

router.post('/equipment-types', async (req: Request, res: Response) => {
  try {
    const { name, icon } = req.body;
    const type = await prisma.equipmentType.create({ data: { name, icon } });
    res.json({ id: type.id });
  } catch (err: any) {
    error('[EQUIPMENT_TYPES POST] Erro ao criar tipo', err, { details: { name: req.body.name } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/equipment-types/:id', async (req: Request, res: Response) => {
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
