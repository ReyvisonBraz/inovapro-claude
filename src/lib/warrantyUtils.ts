import { differenceInCalendarDays, format, isValid, parse } from 'date-fns';
import type { Warranty } from '../types';

interface OrderWarrantySource {
  warranties?: Warranty[] | null;
  Warranties?: Warranty[] | null;
}

export const getOrderWarranties = (order?: OrderWarrantySource | null): Warranty[] =>
  order?.warranties ?? order?.Warranties ?? [];

export const parseWarrantyDate = (value: string): Date | null => {
  const datePart = value.slice(0, 10);
  const parsed = parse(datePart, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
};

export const formatWarrantyDate = (value: string): string => {
  const date = parseWarrantyDate(value);
  return date ? format(date, 'dd/MM/yyyy') : 'Data não informada';
};

export const getLatestWarrantyExpiry = (warranties?: Warranty[] | null): Date | null => {
  const dates = (warranties ?? [])
    .map((warranty) => parseWarrantyDate(warranty.expiresAt))
    .filter((date): date is Date => date !== null);

  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((date) => date.getTime())));
};

export type WarrantyExpiryState = 'active' | 'expiring' | 'expired';

export const getWarrantyExpirySummary = (
  warranties?: Warranty[] | null,
  today = new Date(),
): { label: string; state: WarrantyExpiryState; daysRemaining: number; expiresAt: Date } | null => {
  const expiresAt = getLatestWarrantyExpiry(warranties);
  if (!expiresAt) return null;

  const daysRemaining = differenceInCalendarDays(expiresAt, today);
  if (daysRemaining < 0) {
    return { label: 'Garantia vencida', state: 'expired', daysRemaining, expiresAt };
  }
  if (daysRemaining === 0) {
    return { label: 'Garantia vence hoje', state: 'expiring', daysRemaining, expiresAt };
  }
  if (daysRemaining < 30) {
    return {
      label: `Garantia vence em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`,
      state: 'expiring',
      daysRemaining,
      expiresAt,
    };
  }

  return {
    label: `Garantia até ${format(expiresAt, 'dd/MM/yyyy')}`,
    state: 'active',
    daysRemaining,
    expiresAt,
  };
};
