import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export const formatMonthYear = (dateStr: string) => {
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  const monthName = format(date, 'MMMM', { locale: ptBR });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
};
