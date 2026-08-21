/**
 * Caracterização e invariantes dos fluxos financeiros contra PostgreSQL REAL.
 * Complementa concurrency.service.test.ts (unit, prisma mockado): aqui o banco
 * de verdade prova que incremento atômico + guards se comportam como o esperado.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../lib/prisma.js';
import { clientPaymentService } from '../../services/client-payment.service.js';
import { BusinessError } from '../../lib/errors.js';
import { createClientPayment, createCustomer, countEntriesAndTransactions, resetDb } from './db.js';

let customerId: number;

beforeEach(async () => {
  await resetDb();
  const customer = await createCustomer();
  customerId = customer.id;
});

describe('ClientPaymentService.registerPayment — recebimento real', () => {
  it('pagamento integral marca "paid", grava exatamente 1 entry e 1 transação de recebimento', async () => {
    const payment = await createClientPayment(customerId, { totalAmount: 100 });

    const result = await clientPaymentService.registerPayment(payment.id, { amount: 100 });

    expect(result.newStatus).toBe('paid');
    expect(result.newPaidAmount).toBe(100);

    const stored = await prisma.clientPayment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(Number(stored.paidAmount)).toBe(100);
    expect(stored.status).toBe('paid');
    expect(stored.version).toBeGreaterThan(0);

    const { entries, transactions } = await countEntriesAndTransactions(payment.id);
    expect(entries).toBe(1);
    expect(transactions).toBe(1);
  });

  it('recebimento parcial mantém "partial" e soma valores em recebimentos seguintes', async () => {
    const payment = await createClientPayment(customerId, { totalAmount: 100 });

    const first = await clientPaymentService.registerPayment(payment.id, { amount: 40 });
    expect(first.newStatus).toBe('partial');

    const second = await clientPaymentService.registerPayment(payment.id, { amount: 60 });
    expect(second.newStatus).toBe('paid');
    expect(second.newPaidAmount).toBe(100);

    const { entries, transactions } = await countEntriesAndTransactions(payment.id);
    expect(entries).toBe(2);
    expect(transactions).toBe(2);
  });

  it('pagamento acima do saldo é rejeitado e NADA é gravado (rollback total)', async () => {
    const payment = await createClientPayment(customerId, { totalAmount: 100 });

    await expect(
      clientPaymentService.registerPayment(payment.id, { amount: 150 })
    ).rejects.toBeInstanceOf(BusinessError);

    const stored = await prisma.clientPayment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(Number(stored.paidAmount)).toBe(0);
    expect(stored.status).toBe('pending');

    const { entries, transactions } = await countEntriesAndTransactions(payment.id);
    expect(entries).toBe(0);
    expect(transactions).toBe(0);
  });

  it('falha de um recebimento não corrompe recebimentos anteriores', async () => {
    const payment = await createClientPayment(customerId, { totalAmount: 100 });

    await clientPaymentService.registerPayment(payment.id, { amount: 40 });

    await expect(
      clientPaymentService.registerPayment(payment.id, { amount: 100 })
    ).rejects.toBeInstanceOf(BusinessError);

    const stored = await prisma.clientPayment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(Number(stored.paidAmount)).toBe(40);
    expect(stored.status).toBe('partial');

    const { entries, transactions } = await countEntriesAndTransactions(payment.id);
    expect(entries).toBe(1);
    expect(transactions).toBe(1);
  });

  it('dois recebimentos simultâneos de 60 em total 100: exatamente um vence, sem lost update', async () => {
    const payment = await createClientPayment(customerId, { totalAmount: 100 });

    const settled = await Promise.allSettled([
      clientPaymentService.registerPayment(payment.id, { amount: 60 }),
      clientPaymentService.registerPayment(payment.id, { amount: 60 }),
    ]);

    const fulfilled = settled.filter((s) => s.status === 'fulfilled');
    const rejected = settled.filter((s) => s.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(BusinessError);

    const stored = await prisma.clientPayment.findUniqueOrThrow({ where: { id: payment.id } });
    // Depois do rollback do perdedor, sobra o único pagamento aplicado.
    expect(Number(stored.paidAmount)).toBe(60);
    expect(stored.status).toBe('partial');

    const { entries, transactions } = await countEntriesAndTransactions(payment.id);
    expect(entries).toBe(1);
    expect(transactions).toBe(1);
  });
});

describe('ClientPaymentService.create — caraterização com paidAmount inicial', () => {
  it('paidAmount inicial > 0 grava entrada e transação junto com o pagamento', async () => {
    const payment = await clientPaymentService.create({
      customerId,
      description: 'Venda com entrada',
      totalAmount: 500,
      paidAmount: 150,
      purchaseDate: '2026-01-10',
      dueDate: '2026-02-10',
      paymentMethod: 'Crediário',
      installmentsCount: 2,
    });

    const created = await prisma.clientPayment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(Number(created.paidAmount)).toBe(150);
    expect(created.status).toBe('pending');

    const { entries, transactions } = await countEntriesAndTransactions(created.id);
    expect(entries).toBe(1);
    expect(transactions).toBe(1);
  });

  it('delete remove o pagamento e seus vínculos (transações)', async () => {
    const payment = await createClientPayment(customerId, { totalAmount: 100 });
    await clientPaymentService.registerPayment(payment.id, { amount: 50 });

    await clientPaymentService.delete(payment.id);

    expect(await prisma.clientPayment.count({ where: { id: payment.id } })).toBe(0);
    const { entries, transactions } = await countEntriesAndTransactions(payment.id);
    expect(entries).toBe(0);
    expect(transactions).toBe(0);
  });
});