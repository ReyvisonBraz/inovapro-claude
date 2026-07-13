import { describe, expect, it } from 'vitest';
import { buildTransactionFilters, toPrismaDate } from '../lib/prisma-helpers';

describe('helpers de data do Prisma', () => {
  it('converte uma data do formulário para meia-noite UTC', () => {
    expect(toPrismaDate('2026-07-13').toISOString()).toBe('2026-07-13T00:00:00.000Z');
  });

  it('converte o período de transações para DateTimeFilter', () => {
    const where = buildTransactionFilters({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
    });

    expect(where.date).toEqual({
      gte: new Date('2026-07-01T00:00:00.000Z'),
      lte: new Date('2026-07-31T00:00:00.000Z'),
    });
  });

  it('rejeita datas inválidas antes de chamar o banco', () => {
    expect(() => toPrismaDate('data-inválida')).toThrow('Data inválida');
  });
});
