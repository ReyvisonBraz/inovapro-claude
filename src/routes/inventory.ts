import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error, info } from '../lib/server-logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
    res.json(items);
  } catch (err) {
    error('[INVENTORY GET] Erro ao listar inventário', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, createdBy } = req.body;
    const finalUnitPrice = unitPrice !== undefined ? unitPrice : (salePrice || 0);
    const finalStockLevel = stockLevel !== undefined ? stockLevel : (quantity || 0);
    const item = await prisma.inventoryItem.create({
      data: {
        name, category, sku, costPrice: costPrice || 0, salePrice: finalUnitPrice,
        quantity: finalStockLevel, minQuantity: minQuantity || 5, unitPrice: finalUnitPrice,
        stockLevel: finalStockLevel, createdBy: createdBy || 1,
      },
    });
    info('Item de inventário criado', { details: { id: item.id, name } });
    res.json({ id: item.id });
  } catch (err: any) {
    error('[INVENTORY POST] Erro ao criar item', err, { details: { name: req.body.name } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, updatedBy } = req.body;
    const finalUnitPrice = unitPrice !== undefined ? unitPrice : (salePrice || 0);
    const finalStockLevel = stockLevel !== undefined ? stockLevel : (quantity || 0);
    await prisma.inventoryItem.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name, category, sku, costPrice: costPrice || 0, salePrice: finalUnitPrice,
        quantity: finalStockLevel, minQuantity: minQuantity || 5, unitPrice: finalUnitPrice,
        stockLevel: finalStockLevel, updatedBy: updatedBy || 1,
      },
    });
    res.json({ success: true });
  } catch (err: any) {
    error('[INVENTORY PUT] Erro ao atualizar item', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.inventoryItem.delete({ where: { id: parseInt(req.params.id) } });
    info('Item de inventário excluído', { details: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    error('[INVENTORY DELETE] Erro ao excluir item', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

export default router;
