import { z } from 'zod';

const parseAmount = (val: string): number => {
  const cleaned = val.replace(/[.\s]/g, '').replace(',', '.');
  return parseFloat(cleaned);
};

export const transactionSchema = z.object({
  description: z.string().min(0),
  category: z.string().min(1, 'Categoria é obrigatória'),
  type: z.enum(['income', 'expense']),
  amount: z.string()
    .transform(parseAmount)
    .refine((val) => !isNaN(val) && val > 0, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;