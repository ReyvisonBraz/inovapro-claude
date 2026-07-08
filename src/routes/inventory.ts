import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error, info } from '../lib/server-logger.js';
import { inventoryService } from '../services/inventory.service.js';
import { AppError } from '../lib/errors.js';
import { AuthRequest } from '../middleware/auth.js';

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

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
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
    res.json({ id: item.id });
  } catch (err: any) {
    error('[INVENTORY POST] Erro ao criar item', err, { details: { name: req.body.name } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    error('[INVENTORY PUT] Erro ao atualizar item', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

// Ajuste atômico de estoque: { delta: -2 } baixa 2 unidades, { delta: 5 } repõe 5.
// Baixa concorrente além do disponível é rejeitada pelo banco (sem estoque negativo).
router.patch('/:id/stock', async (req: AuthRequest, res: Response) => {
  try {
    const delta = parseInt(req.body.delta);

    const item = await inventoryService.adjustStock(parseInt(req.params.id), delta, req.user!.userId);

    info('Estoque ajustado', { details: { id: item.id, delta, quantity: item.quantity } });
    res.json({ success: true, quantity: item.quantity, version: item.version });
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    error('[INVENTORY STOCK] Erro ao ajustar estoque', err, { details: { id: req.params.id } });
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
