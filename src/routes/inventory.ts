import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { info } from '../lib/server-logger.js';
import { inventoryService } from '../services/inventory.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { InventoryItemSchema } from '../schemas/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
}));

router.post('/', validate(InventoryItemSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel } = req.body;
  const pCostPrice = isNaN(parseFloat(costPrice)) ? 0 : parseFloat(costPrice);
  const pUnitPrice = unitPrice !== undefined && unitPrice !== '' ? parseFloat(unitPrice) : (isNaN(parseFloat(salePrice)) ? 0 : parseFloat(salePrice));
  const pStockLevel = stockLevel !== undefined && stockLevel !== '' ? parseInt(stockLevel) : (isNaN(parseInt(quantity)) ? 0 : parseInt(quantity));
  const pMinQuantity = isNaN(parseInt(minQuantity)) ? 5 : parseInt(minQuantity);

  const item = await prisma.inventoryItem.create({
    data: {
      name, category,
      sku: sku || null,
      costPrice: pCostPrice, salePrice: pUnitPrice,
      quantity: pStockLevel, minQuantity: pMinQuantity,
      unitPrice: pUnitPrice, stockLevel: pStockLevel,
      createdBy: req.user.userId,
    },
  });
  info('Item de inventário criado', { details: { id: item.id, name } });
  res.status(201).json(item);
}));

router.put('/:id', validate(InventoryItemSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel } = req.body;
  const pCostPrice = isNaN(parseFloat(costPrice)) ? 0 : parseFloat(costPrice);
  const pUnitPrice = unitPrice !== undefined && unitPrice !== '' ? parseFloat(unitPrice) : (isNaN(parseFloat(salePrice)) ? 0 : parseFloat(salePrice));
  const pStockLevel = stockLevel !== undefined && stockLevel !== '' ? parseInt(stockLevel) : (isNaN(parseInt(quantity)) ? 0 : parseInt(quantity));
  const pMinQuantity = isNaN(parseInt(minQuantity)) ? 5 : parseInt(minQuantity);

  const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;
  const id = parseInt(req.params.id ?? '');
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }

  const item = await inventoryService.update(id, {
    name, category, sku: sku || null,
    costPrice: pCostPrice, salePrice: pUnitPrice,
    quantity: pStockLevel, minQuantity: pMinQuantity,
    unitPrice: pUnitPrice, stockLevel: pStockLevel,
    updatedBy: req.user.userId,
  }, expectedVersion);
  res.json(item);
}));

router.patch('/:id/stock', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Não autenticado' }); return; }
  const delta = parseInt(req.body.delta);
  const id = parseInt(req.params.id ?? '');
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }

  const item = await inventoryService.adjustStock(id, delta, req.user.userId);

  info('Estoque ajustado', { details: { id: item.id, delta, quantity: item.quantity } });
  res.json({ success: true, quantity: item.quantity, version: item.version });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id ?? '');
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
  await prisma.inventoryItem.delete({ where: { id } });
  info('Item de inventário excluído', { details: { id } });
  res.status(204).end();
}));

export default router;
