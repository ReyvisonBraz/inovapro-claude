import { prisma } from '../lib/prisma.js';
import { BusinessError, ConflictError, NotFoundError } from '../lib/errors.js';

export class InventoryService {
  /**
   * Ajusta o estoque de forma atômica.
   * delta > 0 = entrada; delta < 0 = saída.
   * A guarda `quantity >= -delta` no WHERE impede estoque negativo mesmo
   * com duas baixas simultâneas — o banco serializa e a segunda falha.
   */
  async adjustStock(id: number, delta: number, updatedBy?: number) {
    if (!Number.isInteger(delta) || delta === 0) {
      throw new BusinessError('Ajuste de estoque inválido');
    }

    const where = delta < 0
      ? { id, quantity: { gte: -delta } }
      : { id };

    const result = await prisma.inventoryItem.updateMany({
      where,
      data: {
        quantity: { increment: delta },
        stockLevel: { increment: delta },
        version: { increment: 1 },
        updatedBy: updatedBy || 1,
      },
    });

    if (result.count === 0) {
      const exists = await prisma.inventoryItem.findUnique({ where: { id }, select: { id: true, quantity: true } });
      if (!exists) throw new NotFoundError('Item de inventário não encontrado');
      throw new BusinessError(
        `Estoque insuficiente: disponível ${exists.quantity ?? 0}, solicitado ${-delta}`
      );
    }

    return prisma.inventoryItem.findUniqueOrThrow({ where: { id } });
  }

  /**
   * Atualização completa do item (edição de cadastro) com lock otimista
   * opcional: se o cliente informar a versão que conhecia, um salvamento
   * concorrente gera 409 em vez de sobrescrever.
   */
  async update(id: number, data: Record<string, unknown>, expectedVersion?: number) {
    const result = await prisma.inventoryItem.updateMany({
      where: expectedVersion !== undefined ? { id, version: expectedVersion } : { id },
      data: { ...data, version: { increment: 1 } } as any,
    });

    if (result.count === 0) {
      const exists = await prisma.inventoryItem.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw new NotFoundError('Item de inventário não encontrado');
      throw new ConflictError();
    }

    return prisma.inventoryItem.findUniqueOrThrow({ where: { id } });
  }
}

export const inventoryService = new InventoryService();
