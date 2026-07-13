import type { Prisma } from '@prisma/client';

export function toPrismaDate(value: string): Date {
  const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const parsed = new Date(dateOnly ? `${dateOnly}T00:00:00.000Z` : value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Data inválida: ${value}`);
  }

  return parsed;
}

export function buildTransactionFilters(options: {
  search?: string;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = {};

  if (options.search) {
    where.OR = [
      { description: { contains: options.search, mode: 'insensitive' } },
      { category: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  if (options.type && options.type !== 'all') {
    where.type = options.type;
  }

  if (options.category && options.category !== 'all') {
    where.category = options.category;
  }

  if (options.startDate || options.endDate) {
    where.date = {};
    if (options.startDate) where.date.gte = toPrismaDate(options.startDate);
    if (options.endDate) where.date.lte = toPrismaDate(options.endDate);
  }

  if (options.minAmount !== undefined && !isNaN(options.minAmount)) {
    where.amount = { ...(where.amount as object || {}), gte: options.minAmount };
  }

  if (options.maxAmount !== undefined && !isNaN(options.maxAmount)) {
    where.amount = { ...(where.amount as object || {}), lte: options.maxAmount };
  }

  return where;
}

export function buildServiceOrderFilters(options: {
  search?: string;
  status?: string;
  priority?: string;
}): {
  where: Prisma.ServiceOrderWhereInput;
  orderBy: Prisma.ServiceOrderOrderByWithRelationInput[];
} {
  const where: Prisma.ServiceOrderWhereInput = {};

  if (options.search) {
    where.OR = [
      { firstName: { contains: options.search, mode: 'insensitive' } },
      { lastName: { contains: options.search, mode: 'insensitive' } },
      { phone: { contains: options.search } },
      { equipmentType: { contains: options.search, mode: 'insensitive' } },
      { equipmentBrand: { contains: options.search, mode: 'insensitive' } },
      { reportedProblem: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  if (options.status && options.status !== 'all') {
    where.status = options.status;
  }

  if (options.priority && options.priority !== 'all') {
    where.priority = options.priority;
  }

  return { where, orderBy: [{ createdAt: 'desc' }] };
}
