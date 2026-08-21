import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';

export type TestUser = { id: number; username: string; role: string; tokenVersion: number };

const ALL_TABLES = [
  'AuditLog',
  'SystemError',
  'Transaction',
  'PaymentEntry',
  'Receipt',
  'Warranty',
  'ServiceOrder',
  'ClientPayment',
  'InventoryItem',
  'Customer',
  'Category',
  'Brand',
  'Model',
  'EquipmentType',
  'ServiceOrderStatus',
  'Settings',
  'User',
];

/**
 * Zera o banco entre testes (RESTART IDENTITY CASCADE). Sequencial por arquivo:
 * este helper nunca deve rodar dentro de transações concorrentes.
 * Identificadores com aspas porque "User" é palavra reservada do Postgres.
 */
export async function resetDb(): Promise<void> {
  const quoted = ALL_TABLES.map((t) => `"${t}"`).join(', ');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`
  );
}

export async function seedUser(
  overrides: Partial<{ username: string; password: string; role: string; name: string }> = {}
): Promise<TestUser> {
  const username = overrides.username ?? 'admin';
  const password = overrides.password ?? 'admin2021';
  const role = overrides.role ?? 'owner';
  const name = overrides.name ?? 'Administrador';

  const hash = await bcrypt.hash(password, 4);
  const user = await prisma.user.create({
    data: { username, password: hash, role, name, permissions: [] },
  });
  return { id: user.id, username: user.username, role: user.role, tokenVersion: user.tokenVersion };
}

export async function createCustomer(
  overrides: Partial<{ firstName: string; lastName: string; phone: string }> = {}
) {
  return prisma.customer.create({
    data: {
      firstName: overrides.firstName ?? 'Ana',
      lastName: overrides.lastName ?? 'Silva',
      phone: overrides.phone ?? '11999990000',
    },
  });
}

export async function createInventoryItem(overrides: Partial<{
  name: string; unitPrice: number; quantity: number;
}> = {}) {
  return prisma.inventoryItem.create({
    data: {
      name: overrides.name ?? 'Fonte ATX',
      category: 'product',
      unitPrice: overrides.unitPrice ?? 100,
      quantity: overrides.quantity ?? 5,
      stockLevel: overrides.quantity ?? 5,
    },
  });
}

/** Cria um pagamento de cliente limpo (sem entradas). */
export async function createClientPayment(
  customerId: number,
  overrides: Partial<{
    description: string; totalAmount: number; paidAmount: number;
    purchaseDate: string; dueDate: string; paymentMethod: string;
  }> = {}
) {
  return prisma.clientPayment.create({
    data: {
      customerId,
      description: overrides.description ?? 'Venda #TESTE',
      totalAmount: overrides.totalAmount ?? 100,
      paidAmount: overrides.paidAmount ?? 0,
      purchaseDate: new Date(overrides.purchaseDate ?? '2026-01-10T00:00:00.000Z'),
      dueDate: new Date(overrides.dueDate ?? '2026-02-10T00:00:00.000Z'),
      paymentMethod: overrides.paymentMethod ?? 'Crediário',
      status: 'pending',
      installmentsCount: 1,
    },
  });
}

/** Conta helpers de integridade agregada usadas nas suítes. */
export async function countEntriesAndTransactions(paymentId: number) {
  const [entries, transactions] = await Promise.all([
    prisma.paymentEntry.count({ where: { paymentId } }),
    prisma.transaction.count({ where: { paymentId } }),
  ]);
  return { entries, transactions };
}