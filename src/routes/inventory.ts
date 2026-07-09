import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { info } from '../lib/server-logger.js';
import { inventoryService } from '../services/inventory.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { InventoryItemSchema } from './schemas.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
}));

router.post('/', validate(InventoryItemSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel } = req.body;
  const pCostPrice = isNaN(parseFloat(costPrice)) ? 0 : parseFloat(costPrice);
  const pUnitPrice = unitPrice !== undefined && unitPrice !== '' ? parseFloat(unitPrice) : (isNaN(parseFloat(salePrice)) ? 0 : parseFloat(salePrice));
  const pStockLevel = stockLevel !== undefined && stockLevel !== '' ? parseInt(stockLevel) : (isNaN(parseInt(quantity)) ? 0 : parseInt(quantity));
  const pMinQuantity = isNaN(parseInt(minQuantity)) ? 5 : parseInt(minQuantity);

  const item = await prisma.inventoryItem.create({
    data: {
      name,
      category,
      sku: sku || null,
      costPrice: pCostPrice,
      salePrice: pUnitPrice,
      quantity: pStockLevel,
      minQuantity: pMinQuantity,
      unitPrice: pUnitPrice,
      stockLevel: pStockLevel,
      createdBy: req.user!.userId,
    },
  });
  info('Item de inventário criado', { details: { id: item.id, name } });
  res.status(201).json({ id: item.id });
}));

router.put('/:id', validate(InventoryItemSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel } = req.body;
  const pCostPrice = isNaN(parseFloat(costPrice)) ? 0 : parseFloat(costPrice);
  const pUnitPrice = unitPrice !== undefined && unitPrice !== '' ? parseFloat(unitPrice) : (isNaN(parseFloat(salePrice)) ? 0 : parseFloat(salePrice));
  const pStockLevel = stockLevel !== undefined && stockLevel !== '' ? parseInt(stockLevel) : (isNaN(parseInt(quantity)) ? 0 : parseInt(quantity));
  const pMinQuantity = isNaN(parseInt(minQuantity)) ? 5 : parseInt(minQuantity);

  const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;

  await inventoryService.update(parseInt(req.params.id), {
    name,
    category,
    sku: sku || null,
    costPrice: pCostPrice,
    salePrice: pUnitPrice,
    quantity: pStockLevel,
    minQuantity: pMinQuantity,
    unitPrice: pUnitPrice,
    stockLevel: pStockLevel,
    updatedBy: req.user!.userId,
  }, expectedVersion);
  res.json({ success: true });
}));

// Ajuste atômico de estoque: { delta: -2 } baixa 2 unidades, { delta: 5 } repõe 5.
// Baixa concorrente além do disponível é rejeitada pelo banco (sem estoque negativo).
router.patch('/:id/stock', asyncHandler(async (req: AuthRequest, res: Response) => {
  const delta = parseInt(req.body.delta);

  const item = await inventoryService.adjustStock(parseInt(req.params.id), delta, req.user!.userId);

  info('Estoque ajustado', { details: { id: item.id, delta, quantity: item.quantity } });
  res.json({ success: true, quantity: item.quantity, version: item.version });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await prisma.inventoryItem.delete({ where: { id: parseInt(req.params.id) } });
  info('Item de inventário excluído', { details: { id: req.params.id } });
  res.status(204).end();
}));

export default router;