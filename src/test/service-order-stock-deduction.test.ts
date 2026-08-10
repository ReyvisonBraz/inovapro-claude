/**
 * Testes da baixa automática de estoque na transição de status da OS (M4)
 * e da persistência do checklist de entrada/saída (M1).
 *
 * O prisma é mockado (padrão do repo). Valida-se aqui que:
 * - a baixa ocorre SOMENTE na transição para um status conclusivo;
 * - a baixa agrega por id e guarda contra estoque insuficiente (rollback);
 * - salvar repetidamente já em status conclusivo NÃO re-baixa;
 * - peças avulsas (sem id) não mexem no estoque;
 * - create/update persistem checklistIn/checklistOut.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  serviceOrder: {
    create: vi.fn(),
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  customer: { findUnique: vi.fn() },
  settings: { findUnique: vi.fn() },
  inventoryItem: { updateMany: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('../lib/prisma.js', () => ({ prisma: prismaMock }));
vi.mock('../lib/storage.js', () => ({
  uploadPhotoToStorage: vi.fn(),
  isStorageConfigured: () => false,
}));

import { serviceOrderService } from '../services/service-order.service';
import { BusinessError } from '../lib/errors';

const concludingOS = (overrides: any = {}) =>
  prismaMock.serviceOrder.findUniqueOrThrow.mockResolvedValue({
    id: 7, services: [], partsUsed: [], checklistIn: [], checklistOut: [],
    ...overrides,
  });

const runInTx = (tx: any) =>
  prismaMock.$transaction.mockImplementation(async (fn: any) => fn(tx));

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.settings.findUnique.mockResolvedValue(null);
});

describe('ServiceOrderService - baixa de estoque na transição (M4)', () => {
  it('baixa estoque ao migrar de status para um status conclusivo', async () => {
    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({
          status: 'Em Atendimento',
          partsUsed: [{ id: 10, quantity: 2 }, { id: 10, quantity: 1 }, { id: 11, quantity: 3 }],
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      warranty: { count: vi.fn().mockResolvedValue(0), createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    };
    runInTx(tx);
    concludingOS();

    await serviceOrderService.update(7, { status: 'Pronto' });

    // agrega por id: peça 10 -> 3, peça 11 -> 3
    const calls = tx.inventoryItem.updateMany.mock.calls.map((c: any) => c[0]);
    expect(calls).toHaveLength(2);
    expect(calls[0].where).toEqual({ id: 10, quantity: { gte: 3 } });
    expect(calls[0].data.quantity).toEqual({ decrement: 3 });
    expect(calls[1].where).toEqual({ id: 11, quantity: { gte: 3 } });
  });

  it('não baixa estoque quando status não muda', async () => {
    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({
          status: 'Pronto',
          partsUsed: [{ id: 10, quantity: 2 }],
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn() },
    };
    runInTx(tx);
    concludingOS();

    await serviceOrderService.update(7, { status: 'Pronto' });

    expect(tx.inventoryItem.updateMany).not.toHaveBeenCalled();
  });

  it('não baixa estoque para status não conclusivo (ex.: Voltar p/ Em Análise)', async () => {
    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({
          status: 'Em Atendimento',
          partsUsed: [{ id: 10, quantity: 2 }],
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn() },
    };
    runInTx(tx);
    concludingOS();

    await serviceOrderService.update(7, { status: 'Aguardando Aprovação' });

    expect(tx.inventoryItem.updateMany).not.toHaveBeenCalled();
  });

  it('ignora peças avulsas (sem id) na baixa', async () => {
    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({
          status: 'Em Atendimento',
          partsUsed: [{ name: 'Peça avulsa', quantity: 1 }, { id: 10, quantity: 1 }],
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      warranty: { count: vi.fn().mockResolvedValue(0), createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    };
    runInTx(tx);
    concludingOS();

    await serviceOrderService.update(7, { status: 'Concluído' });

    const calls = tx.inventoryItem.updateMany.mock.calls.map((c: any) => c[0]);
    expect(calls).toHaveLength(1);
    expect(calls[0].where).toEqual({ id: 10, quantity: { gte: 1 } });
  });

  it('estoque insuficiente vira BusinessError (a transação aborta, nada persiste)', async () => {
    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({
          status: 'Em Atendimento',
          partsUsed: [{ id: 10, quantity: 5 }],
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
    };
    runInTx(tx);

    await expect(
      serviceOrderService.update(7, { status: 'Concluído' })
    ).rejects.toBeInstanceOf(BusinessError);

    // nada de findUniqueOrThrow foi chamado (erro antes de "confirmar" a OS)
    expect(prismaMock.serviceOrder.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it('respeita a lista de status conclusivos customizada nas Settings', async () => {
    prismaMock.settings.findUnique.mockResolvedValue({
      deductStockStatuses: ['Finalizado'],
    });
    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({
          status: 'Em Atendimento',
          partsUsed: [{ id: 10, quantity: 1 }],
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      warranty: { count: vi.fn().mockResolvedValue(0), createMany: vi.fn().mockResolvedValue({ count: 1 }) },
      settings: prismaMock.settings,
    };
    runInTx(tx);
    concludingOS();

    // 'Pronto' não está na lista customizada => sem baixa
    await serviceOrderService.update(7, { status: 'Pronto' });
    expect(tx.inventoryItem.updateMany).not.toHaveBeenCalled();

    // 'Finalizado' está na lista => baixa
    tx.serviceOrder.findUnique.mockResolvedValue({
      status: 'Em Atendimento',
      partsUsed: [{ id: 10, quantity: 1 }],
    });
    await serviceOrderService.update(7, { status: 'Finalizado' });
    expect(tx.inventoryItem.updateMany).toHaveBeenCalled();
  });
});

describe('ServiceOrderService - checklist de entrada/saída (M1)', () => {
  it('persiste checklistIn/checklistOut no create', async () => {
    prismaMock.customer.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.serviceOrder.create.mockResolvedValue({ id: 8 });

    await serviceOrderService.create({
      customerId: 1,
      entryDate: '2026-08-10',
      checklistIn: [{ label: 'Tampa', done: true }],
      checklistOut: [{ label: 'Carregador', value: 'ok' }],
    });

    const call = prismaMock.serviceOrder.create.mock.calls[0]![0]!;
    expect(call.data.checklistIn).toEqual([{ label: 'Tampa', done: true }]);
    expect(call.data.checklistOut).toEqual([{ label: 'Carregador', value: 'ok' }]);
  });

  it('persiste checklistIn/checklistOut no update', async () => {
    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({ status: 'Aguardando Análise', partsUsed: [] }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn() },
    };
    runInTx(tx);
    concludingOS();

    await serviceOrderService.update(7, {
      status: 'Em Atendimento',
      checklistIn: [{ label: 'Tampa', done: true }],
    });

    const call = tx.serviceOrder.updateMany.mock.calls[0]![0]!;
    expect(call.data.checklistIn).toEqual([{ label: 'Tampa', done: true }]);
  });
});
describe('ServiceOrderService - garantia (M3)', () => {
  it('cria Warranties ao concluir a OS (serviços + peças), com validade do padrão', async () => {
    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({
          status: 'Em Atendimento',
          partsUsed: [{ id: 10, name: 'Tela', quantity: 1 }],
          services: [{ name: 'Troca de tela', price: 50 }],
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      warranty: { count: vi.fn().mockResolvedValue(0), createMany: vi.fn().mockResolvedValue({ count: 2 }) },
      settings: prismaMock.settings,
    };
    runInTx(tx);
    concludingOS();

    prismaMock.settings.findUnique.mockResolvedValue({ warrantyDefaultMonths: 12 });

    await serviceOrderService.update(7, { status: 'Pronto' });

    const data = tx.warranty.createMany.mock.calls[0]![0]!.data;
    expect(data).toHaveLength(2);
    expect(data[0].itemType).toBe('service');
    expect(data[0].itemName).toBe('Troca de tela');
    expect(data[1].itemType).toBe('part');
    expect(data[1].itemName).toBe('Tela');
    expect(data[0].warrantyMonths).toBe(12);
    expect(data[0].expiresAt).toBeInstanceOf(Date);
  });

  it('não duplica garantias ao salvar repetidamente já concluído', async () => {
    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({
          status: 'Pronto',
          partsUsed: [{ id: 10, name: 'Tela', quantity: 1 }],
          services: [],
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn() },
      warranty: { count: vi.fn().mockResolvedValue(1), createMany: vi.fn() },
      settings: prismaMock.settings,
    };
    runInTx(tx);
    concludingOS();

    await serviceOrderService.update(7, { status: 'Pronto' });

    expect(tx.warranty.createMany).not.toHaveBeenCalled();
  });

  it('persiste warrantyReturn no create e no update', async () => {
    prismaMock.customer.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.serviceOrder.create.mockResolvedValue({ id: 8 });
    await serviceOrderService.create({ customerId: 1, entryDate: '2026-08-10', warrantyReturn: true });
    expect(prismaMock.serviceOrder.create.mock.calls[0]![0]!.data.warrantyReturn).toBe(true);

    const tx = {
      serviceOrder: {
        findUnique: vi.fn().mockResolvedValue({ status: 'Aguardando Análise', partsUsed: [], services: [] }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryItem: { updateMany: vi.fn() },
    };
    runInTx(tx);
    concludingOS();
    await serviceOrderService.update(7, { warrantyReturn: true });
    expect(tx.serviceOrder.updateMany.mock.calls[0]![0]!.data.warrantyReturn).toBe(true);
  });
});
