import { describe, it, expect } from 'vitest';
import { formatCurrency, formatMonthYear, cn } from '../lib/utils';
import { parsePaymentHistory } from '../types';

// --- formatCurrency ---
describe('formatCurrency', () => {
  it('formata valor positivo em BRL', () => {
    expect(formatCurrency(1500)).toBe('R$\u00a01.500,00');
  });

  it('formata zero', () => {
    expect(formatCurrency(0)).toBe('R$\u00a00,00');
  });

  it('formata valor com centavos', () => {
    expect(formatCurrency(99.9)).toBe('R$\u00a099,90');
  });

  it('formata valor negativo', () => {
    expect(formatCurrency(-200)).toBe('-R$\u00a0200,00');
  });
});

// --- formatMonthYear ---
describe('formatMonthYear', () => {
  it('formata janeiro', () => {
    const result = formatMonthYear('2024-01');
    expect(result).toMatch(/janeiro/i);
    expect(result).toContain('2024');
  });

  it('formata dezembro', () => {
    const result = formatMonthYear('2023-12');
    expect(result).toMatch(/dezembro/i);
    expect(result).toContain('2023');
  });

  it('começa com letra maiúscula', () => {
    const result = formatMonthYear('2024-06');
    expect(result[0]).toBe(result[0].toUpperCase());
  });
});

// --- cn (class merging) ---
describe('cn', () => {
  it('combina classes normais', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('remove classes condicionais falsas', () => {
    expect(cn('foo', false && 'bar')).toBe('foo');
  });

  it('resolve conflito tailwind (última vence)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('ignora undefined e null', () => {
    expect(cn('foo', undefined, null)).toBe('foo');
  });
});

// --- parsePaymentHistory ---
describe('parsePaymentHistory', () => {
  it('retorna array vazio para undefined', () => {
    expect(parsePaymentHistory(undefined)).toEqual([]);
  });

  it('retorna array vazio para string vazia', () => {
    expect(parsePaymentHistory('')).toEqual([]);
  });

  it('retorna array vazio para JSON inválido', () => {
    expect(parsePaymentHistory('not-json')).toEqual([]);
  });

  it('faz parse de JSON válido', () => {
    const entries = [{ amount: 100, date: '2024-01-15' }];
    expect(parsePaymentHistory(JSON.stringify(entries))).toEqual(entries);
  });

  it('preserva installmentNumber opcional', () => {
    const entries = [{ amount: 50, date: '2024-02-01', installmentNumber: 1 }];
    expect(parsePaymentHistory(JSON.stringify(entries))).toEqual(entries);
  });
});
