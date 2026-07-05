/**
 * Testes das garantias de concorrência da Fase 1:
 * - Lock otimista atômico (updateMany condicionado à version)
 * - Incremento/decremento atômico em valores financeiros e estoque
 *
 * O prisma é mockado: o que se valida aqui é que os services usam os
 * padrões atômicos corretos (guarda no WHERE + increment) e traduzem
 * count === 0 em erro de conflito/negócio — nunca sobrescrevem às cegas.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  serviceOrder: {
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  clientPayment: {
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  inventoryItem: {
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  transaction: {
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../lib/prisma.js', () => ({ prisma: prismaMock }));
vi.mock('../lib/storage.js', () => ({
  uploadPhotoToStorage: vi.fn(),
  isStorageConfigured: () => false,
}));

import { serviceOrderService } from '../services/service-order.service';
import { clientPaymentService } from '../services/client-payment.service';
import { inventoryService } from '../services/inventory.service';
import { transactionService } from '../services/transaction.service';
import { ConflictError, NotFoundError, BusinessError } from '../lib/errors';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ServiceOrderService.update — lock otimista', () => {
  it('inclui a versão esperada no WHERE e incrementa version no update', async () => {
    prismaMock.serviceOrder.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.serviceOrder.findUniqueOrThrow.mockResolvedValue({
      id: 7, version: 4, services: [], partsUsed: [],
    });

    await serviceOrderService.update(7, { status: 'Pronto' }, 3);

    const call = prismaMock.serviceOrder.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({ id: 7, version: 3 });
    expect(call.data.version).toEqual({ increment: 1 });
  });

  it('lança ConflictError quando outro usuário salvou antes (count = 0, registro existe)', async () => {
    prismaMock.serviceOrder.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.serviceOrder.findUnique.mockResolvedValue({ id: 7 });

    await expect(
      serviceOrderService.update(7, { status: 'Pronto' }, 3)
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('lança NotFoundError quando a OS não existe', async () => {
    prismaMock.serviceOrder.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.serviceOrder.findUnique.mockResolvedValue(null);

    await expect(
      serviceOrderService.update(999, { status: 'Pronto' }, 0)
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('sem versão informada, atualiza sem guarda (compatibilidade)', async () => {
    prismaMock.serviceOrder.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.serviceOrder.findUniqueOrThrow.mockResolvedValue({
      id: 7, services: [], partsUsed: [],
    });

    await serviceOrderService.update(7, { status: 'Pronto' });

    expect(prismaMock.serviceOrder.updateMany.mock.calls[0][0].where).toEqual({ id: 7 });
  });
});

describe('ClientPaymentService.registerPayment — recebimento atômico', () => {
  const makeTx = () => ({
    clientPayment: { update: vi.fn() },
    customer: { findUnique: vi.fn().mockResolvedValue({ id: 1, firstName: 'Ana', lastName: 'Silva', phone: '11999999999' }) },
    transaction: { create: vi.fn() },
  });

  const runInTx = (tx: any) =>
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(tx));

  it('usa increment atômico no paidAmount (nunca read-modify-write)', async () => {
    const tx = makeTx();
    tx.clientPayment.update.mockResolvedValueOnce({
      id: 5, customerId: 1, description: 'Venda', saleId: null,
      paidAmount: 60, totalAmount: 100, paymentHistory: '[]',
    }).mockResolvedValueOnce({});
    runInTx(tx);

    const result = await clientPaymentService.registerPayment(5, { amount: 60 });

    const firstUpdate = tx.clientPayment.update.mock.calls[0][0];
    expect(firstUpdate.data.paidAmount).toEqual({ increment: 60 });
    expect(firstUpdate.data.version).toEqual({ increment: 1 });
    expect(result.newPaidAmount).toBe(60);
    expect(result.newStatus).toBe('partial');
    expect(tx.transaction.create).toHaveBeenCalledOnce();
  });

  it('rejeita pagamento acima do total e não cria transação (rollback)', async () => {
    const tx = makeTx();
    tx.clientPayment.update.mockResolvedValueOnce({
      id: 5, customerId: 1, description: 'Venda', saleId: null,
      paidAmount: 150, totalAmount: 100, paymentHistory: '[]',
    });
    runInTx(tx);

    await expect(
      clientPaymentService.registerPayment(5, { amount: 100 })
    ).rejects.toBeInstanceOf(BusinessError);
    expect(tx.transaction.create).not.toHaveBeenCalled();
  });

  it('rejeita valores inválidos (zero, negativo, NaN) antes de tocar no banco', async () => {
    await expect(clientPaymentService.registerPayment(5, { amount: 0 })).rejects.toBeInstanceOf(BusinessError);
    await expect(clientPaymentService.registerPayment(5, { amount: -10 })).rejects.toBeInstanceOf(BusinessError);
    await expect(clientPaymentService.registerPayment(5, { amount: NaN as any })).rejects.toBeInstanceOf(BusinessError);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('traduz pagamento inexistente (P2025) em NotFoundError', async () => {
    const tx = makeTx();
    tx.clientPayment.update.mockRejectedValueOnce(Object.assign(new Error('no row'), { code: 'P2025' }));
    runInTx(tx);

    await expect(
      clientPaymentService.registerPayment(404, { amount: 10 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('InventoryService.adjustStock — estoque atômico', () => {
  it('baixa usa decrement com guarda quantity >= n no WHERE', async () => {
    prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.inventoryItem.findUniqueOrThrow.mockResolvedValue({ id: 3, quantity: 8, version: 2 });

    await inventoryService.adjustStock(3, -2);

    const call = prismaMock.inventoryItem.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({ id: 3, quantity: { gte: 2 } });
    expect(call.data.quantity).toEqual({ increment: -2 });
  });

  it('duas baixas concorrentes no limite: a que perder a corrida recebe "estoque insuficiente"', async () => {
    prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.inventoryItem.findUnique.mockResolvedValue({ id: 3, quantity: 1 });

    await expect(inventoryService.adjustStock(3, -2)).rejects.toThrow(/Estoque insuficiente/);
  });

  it('item inexistente vira NotFoundError', async () => {
    prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.inventoryItem.findUnique.mockResolvedValue(null);

    await expect(inventoryService.adjustStock(999, -1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('entrada de estoque não exige guarda de quantidade', async () => {
    prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.inventoryItem.findUniqueOrThrow.mockResolvedValue({ id: 3, quantity: 10 });

    await inventoryService.adjustStock(3, 5);

    expect(prismaMock.inventoryItem.updateMany.mock.calls[0][0].where).toEqual({ id: 3 });
  });
});

describe('TransactionService.delete — estorno sem duplicação', () => {
  it('exclusão dupla simultânea: a segunda recebe NotFoundError e nada é estornado', async () => {
    const tx = {
      transaction: {
        delete: vi.fn().mockRejectedValue(Object.assign(new Error('no row'), { code: 'P2025' })),
      },
      clientPayment: { update: vi.fn() },
    };
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(tx));

    await expect(transactionService.delete(10)).rejects.toBeInstanceOf(NotFoundError);
    expect(tx.clientPayment.update).not.toHaveBeenCalled();
  });

  it('estorno usa decrement atômico no pagamento vinculado', async () => {
    const tx = {
      transaction: {
        delete: vi.fn().mockResolvedValue({ id: 10, paymentId: 5, amount: 30 }),
      },
      clientPayment: {
        update: vi.fn()
          .mockResolvedValueOnce({ id: 5, paidAmount: 20, totalAmount: 100 })
          .mockResolvedValueOnce({}),
      },
    };
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(tx));

    await transactionService.delete(10);

    const firstUpdate = tx.clientPayment.update.mock.calls[0][0];
    expect(firstUpdate.data.paidAmount).toEqual({ decrement: 30 });
  });
});
