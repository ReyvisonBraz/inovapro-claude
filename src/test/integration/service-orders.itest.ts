/**
 * Caracterização e invariantes do fluxo de ordens de serviço + ESTOQUE contra
 * PostgreSQL REAL. Complementa service-order-stock-deduction.test.ts (unit).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../lib/prisma.js';
import { serviceOrderService } from '../../services/service-order.service.js';
import { BusinessError, ConflictError } from '../../lib/errors.js';
import type { ServiceOrderFormData } from '../../schemas/index.js';
import { createCustomer, createInventoryItem, resetDb } from './db.js';

const CONCLUDED = 'Concluído';
const OPEN = 'Aguardando Análise';

let customerId: number;

function part(id: number, name: string, quantity: number) {
  return { id, name, quantity, unitPrice: 0, subtotal: 0 };
}

beforeEach(async () => {
  await resetDb();
  const customer = await createCustomer();
  customerId = customer.id;
});

async function createOrder(parts: Array<{ id: number; name: string; quantity: number }>) {
  return serviceOrderService.create({
    customerId,
    entryDate: '2026-07-13',
    equipmentType: 'Notebook',
    equipmentBrand: 'Dell',
    equipmentModel: 'Inspiron',
    status: OPEN,
    services: [{ name: 'Diagnóstico', price: 50 }],
    partsUsed: parts.map((p) => part(p.id, p.name, p.quantity)),
    serviceFee: 50,
    totalAmount: 150,
  } as ServiceOrderFormData);
}

describe('ServiceOrderService — conclusão e baixa de estoque (real)', () => {
  it('fecha a OS, baixa o estoque exatamente pelas peças, cria garantias e marca completedAt', async () => {
    const item = await createInventoryItem({ name: 'Fonte ATX', quantity: 5 });
    const order = await createOrder([{ id: item.id, name: 'Fonte ATX', quantity: 2 }]);

    const updated = await serviceOrderService.update(order.id, { status: CONCLUDED }, order.version);

    expect(updated.status).toBe(CONCLUDED);
    expect(updated.completedAt).not.toBeNull();
    expect(updated.warranties).toHaveLength(2); // serviço 'Diagnóstico' + peça

    const stock = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(stock.quantity).toBe(3);
    expect(stock.stockLevel).toBe(3);
  });

  it('estoque insuficiente aborta a conclusão: status, estoque e garantias intactos', async () => {
    const item = await createInventoryItem({ name: 'Placa-mãe', quantity: 1 });
    const order = await createOrder([{ id: item.id, name: 'Placa-mãe', quantity: 2 }]);

    await expect(
      serviceOrderService.update(order.id, { status: CONCLUDED }, order.version)
    ).rejects.toBeInstanceOf(BusinessError);

    const stored = await prisma.serviceOrder.findUniqueOrThrow({ where: { id: order.id } });
    expect(stored.status).toBe(OPEN);
    expect(stored.completedAt).toBeNull();

    const stock = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(stock.quantity).toBe(1);
    expect(await prisma.warranty.count({ where: { serviceOrderId: order.id } })).toBe(0);
  });

  it('conclusões concorrentes com a MESMA versão: exatamente uma vence; estoque baixa uma única vez', async () => {
    const item = await createInventoryItem({ name: 'SSD 256', quantity: 5 });
    const order = await createOrder([{ id: item.id, name: 'SSD 256', quantity: 2 }]);

    const settled = await Promise.allSettled([
      serviceOrderService.update(order.id, { status: CONCLUDED }, order.version),
      serviceOrderService.update(order.id, { status: CONCLUDED }, order.version),
    ]);

    const fulfilled = settled.filter((s) => s.status === 'fulfilled');
    const rejected = settled.filter((s) => s.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(ConflictError);

    const stock = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(stock.quantity).toBe(3);

    expect(await prisma.warranty.count({ where: { serviceOrderId: order.id } })).toBe(2);
  });
});

describe('ServiceOrderService — caracterização do comportamento ATUAL (P0.4, a corrigir)', () => {
  it('REABRIR não devolve estoque e RECONCLUIR baixa de novo (dupla baixa hoje)', async () => {
    const item = await createInventoryItem({ name: 'Fonte ATX', quantity: 5 });
    const order = await createOrder([{ id: item.id, name: 'Fonte ATX', quantity: 2 }]);

    await serviceOrderService.update(order.id, { status: CONCLUDED }, order.version);
    let stock = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(stock.quantity).toBe(3);

    // Reabertura: hoje não há estorno (a baixa não é revertida).
    const reopened = await serviceOrderService.update(order.id, { status: OPEN });
    expect(reopened.status).toBe(OPEN);
    stock = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(stock.quantity).toBe(3);

    // Reconclusão: usa previous.partsUsed (in­clui a peça) → baixa de novo.
    await serviceOrderService.update(order.id, { status: CONCLUDED });
    stock = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(stock.quantity).toBe(1);

    // Garantias não duplicam nessa segunda passada (guard existentWarranties).
    expect(await prisma.warranty.count({ where: { serviceOrderId: order.id } })).toBe(2);
  });

  it('peças adicionadas SÓ na conclusão NÃO são baixadas (previous.partsUsed vazio vence) — bug P0.4', async () => {
    const item = await createInventoryItem({ name: 'Memória 8GB', quantity: 5 });
    const order = await createOrder([]); // sem peças na criação

    const updated = await serviceOrderService.update(order.id, {
      status: CONCLUDED,
      partsUsed: [part(item.id, 'Memória 8GB', 2)],
    });

    expect(updated.status).toBe(CONCLUDED);

    const stock = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(stock.quantity).toBe(5); // nada foi baixado
  });

  it('converte entryDate para Date no create (caracterização)', async () => {
    const order = await serviceOrderService.create({
      customerId,
      equipmentType: 'Notebook',
      entryDate: '2026-07-13',
    } as ServiceOrderFormData);

    const stored = await prisma.serviceOrder.findUniqueOrThrow({ where: { id: order.id } });
    expect(stored.entryDate?.toISOString()).toBe('2026-07-13T00:00:00.000Z');
  });
});