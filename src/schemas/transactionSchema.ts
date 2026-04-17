import { z } from 'zod';

const parseAmount = (val: string): number => {
  if (!val || val === '') return NaN;

  try {
    const cleaned = val.replace(/[R$\s]/g, '').trim();
    if (!cleaned) return NaN;

    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normalized);

    if (isNaN(parsed)) return NaN;
    return parsed;
  } catch {
    return NaN;
  }
};

export const transactionSchema = z.object({
  description: z.string().min(0).default(''),
  category: z.string().min(1, 'Categoria é obrigatória'),
  type: z.enum(['income', 'expense']),
  amount: z.string()
    .min(1, 'Valor é obrigatório')
    .transform(parseAmount)
    .refine((val) => !isNaN(val) && val > 0, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;